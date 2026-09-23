<script setup lang="ts">
/**
 * 級別總覽。一個級別的所有章、各自的進度，以及整體百分比。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { chapterPath, findLevel } from '../data/routes'
import {
  chapterCompletion,
  chapterDone,
  chapterTotal,
  levelCompletion,
  levelDone,
  levelTotal,
} from '../core/progress'
import { useProgress } from '../composables/useProgress'
import { examCoverage, type ExamSection } from '../core/exam'
import type { QuestionType } from '../core/types'
import ProgressBar from '../components/ProgressBar.vue'
import InlineText from '../components/InlineText.vue'

const route = useRoute()
const { progress } = useProgress()

const level = computed(() => findLevel(route.params.level))
const hasContent = computed(() => level.value?.chapters.some((c) => !c.pending) ?? false)

/**
 * 這個級別的題目實際用到哪些題型。
 * 直接從資料算，不寫死 —— 寫死的話，哪天刪掉最後一題聽解也不會有人發現。
 */
const usedTypes = computed<QuestionType[]>(() => {
  const set = new Set<QuestionType>()
  for (const c of level.value?.chapters ?? []) {
    for (const l of c.lessons) for (const q of l.questions) set.add(q.type)
    for (const z of c.quizzes) for (const q of z.bank) set.add(q.type)
  }
  return [...set]
})

/**
 * 考試大題的涵蓋狀況，依科目分組。
 *
 * 這一區存在的理由是「讓洞看得見」：目前缺的兩個聽解大題都是圖片選項題，
 * 那不是還沒做，是決定不做。把它印在畫面上，使用者才知道要另外準備。
 */
const coverage = computed(() => {
  if (!level.value || !hasContent.value) return null
  const { tasks, covered } = examCoverage(level.value.id, usedTypes.value)
  const done = new Set(covered.map((t) => t.id))
  const sections: ExamSection[] = ['文字・語彙', '文法', '讀解', '聽解']
  return {
    done: covered.length,
    total: tasks.length,
    groups: sections
      .map((name) => ({
        name,
        items: tasks
          .filter((t) => t.section === name)
          .map((t) => ({ id: t.id, title: t.title, ok: done.has(t.id), gap: t.gap })),
      }))
      .filter((g) => g.items.length > 0),
  }
})
</script>

<template>
  <div v-if="level" class="page">
    <header class="head" :style="{ '--hue': String(level.hue) }">
      <h1>{{ level.title }}</h1>
      <p class="sub">{{ level.subtitle }}</p>

      <template v-if="hasContent">
        <div class="pct">
          <strong>{{ Math.round(levelCompletion(level, progress) * 100) }}%</strong>
          <span>{{ levelDone(level, progress) }} / {{ levelTotal(level) }} 個節點</span>
        </div>
        <ProgressBar size="level" :value="levelCompletion(level, progress)" :hue="level.hue" />
      </template>
    </header>

    <p v-if="level.pending" class="pending">
      這個級別的大綱還沒編。等實體課本到手之後，章節會照 JLPT 官方文法範圍排出來。
    </p>

    <ul v-else class="chapters">
      <li v-for="c in level.chapters" :key="c.id">
        <RouterLink :to="chapterPath(level, c)" class="chapter" :class="{ pending: c.pending }">
          <span class="ord">{{ c.order }}</span>
          <span class="body">
            <span class="title">
              {{ c.title }}
              <span v-if="c.pending" class="chip">準備中</span>
            </span>
            <span class="goal"><InlineText :text="c.goal" /></span>
            <ProgressBar
              v-if="!c.pending"
              class="bar"
              :value="chapterCompletion(c, progress)"
              :hue="level.hue"
            />
          </span>
          <span v-if="!c.pending" class="count">
            {{ chapterDone(c, progress) }}/{{ chapterTotal(c) }}
          </span>
        </RouterLink>
      </li>
    </ul>

    <section v-if="coverage" class="exam">
      <h2>
        考試題型涵蓋
        <span class="score">{{ coverage.done }} / {{ coverage.total }} 個大題</span>
      </h2>
      <p class="note">
        第 3 章起的階段驗收全部使用 JLPT 的出題形式（四選一、★ 排序、文章語法、讀解、聽解）。
        沒有打勾的大題下面會寫明原因 —— 「不做」和「還沒做」不是同一回事。
      </p>
      <div class="sections">
        <div v-for="g in coverage.groups" :key="g.name" class="section">
          <h3>{{ g.name }}</h3>
          <ul>
            <li v-for="t in g.items" :key="t.id" :class="{ ok: t.ok }">
              <span class="mark" aria-hidden="true">{{ t.ok ? '✓' : '—' }}</span>
              <span>
                {{ t.title }}
                <em v-if="t.gap" class="why">{{ t.gap }}</em>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>

  <p v-else class="missing">找不到這個級別。</p>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; }

.head { margin-bottom: var(--s-6); }
h1 { margin: 0 0 var(--s-1); font-size: 34px; color: hsl(var(--hue) 46% 36%); }
.sub { margin: 0 0 var(--s-4); color: var(--text-2); font-size: var(--t-md); }

.pct { display: flex; align-items: baseline; gap: var(--s-3); margin-bottom: var(--s-2); }
.pct strong { font-size: var(--t-xl); font-variant-numeric: tabular-nums; }
.pct span { font-size: var(--t-xs); color: var(--muted); }

.pending {
  padding: var(--s-6);
  border: 1px dashed var(--edge);
  border-radius: var(--r-lg);
  text-align: center;
  color: var(--muted);
  font-size: var(--t-sm);
  line-height: 1.7;
}

.chapters { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); }

.chapter {
  display: flex;
  align-items: flex-start;
  gap: var(--s-4);
  padding: var(--s-4);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  text-decoration: none;
  color: var(--text);
  transition: border-color var(--dur-fast);
}
.chapter:hover { border-color: var(--brand-solid); }
.chapter.pending { background: transparent; }

.ord {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px; height: 28px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  font-size: var(--t-xs);
  font-weight: 700;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.body { flex: 1; min-width: 0; }

.title {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-weight: 700;
  line-height: 1.5;
}

.goal { display: block; margin: 2px 0 var(--s-3); font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }

.bar { max-width: 240px; }

.count { flex: none; font-size: var(--t-xs); color: var(--muted); font-variant-numeric: tabular-nums; }

.chip {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.missing { max-width: 720px; margin: 0 auto; color: var(--muted); }

.exam {
  margin-top: var(--s-7);
  padding: var(--s-5);
  border: 1px solid var(--edge);
  border-radius: var(--r-lg);
  background: var(--surface);
}

.exam h2 {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
  margin: 0 0 var(--s-2);
  font-size: var(--t-lg);
}

.exam .score {
  font-size: var(--t-xs);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.exam .note {
  margin: 0 0 var(--s-4);
  color: var(--text-2);
  font-size: var(--t-sm);
  line-height: 1.8;
}

.sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  gap: var(--s-4);
}

.section h3 {
  margin: 0 0 var(--s-2);
  font-size: var(--t-xs);
  font-weight: 600;
  color: var(--muted);
}

.section ul { margin: 0; padding: 0; list-style: none; display: grid; gap: var(--s-1); }

.section li {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: var(--s-2);
  font-size: var(--t-sm);
  color: var(--muted);
}

.section li.ok { color: var(--text); }

.why {
  display: block;
  margin-top: 2px;
  font-size: var(--t-xs);
  font-style: normal;
  color: var(--muted);
  line-height: 1.6;
}
.mark { color: var(--muted); }
.section li.ok .mark { color: hsl(152 52% 40%); }
</style>