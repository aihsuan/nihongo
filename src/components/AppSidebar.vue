<script setup lang="ts">
/**
 * 課程大綱側欄。這是整個產品的主幹導航。
 *
 * 同時只展開一個級別、一個章 —— 五個級別全展開會是六十幾章的捲動地獄。
 * 沒有任何鎖：所有節點永遠可點，靠進度條推動而不是靠擋路。
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Chapter, Level } from '../core/types'
import { levels } from '../data/levels'
import { CATEGORIES } from '../data/reference'
import { chapterPath, lessonPath, levelPath, quizPath } from '../data/routes'
import {
  chapterCompletion,
  chapterDone,
  chapterNodes,
  chapterTotal,
  isLessonDone,
  isQuizDone,
  levelCompletion,
} from '../core/progress'
import { useProgress } from '../composables/useProgress'
import { useSettings } from '../composables/useSettings'
import ProgressBar from './ProgressBar.vue'
import InlineText from './InlineText.vue'

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const { progress } = useProgress()
const { settings } = useSettings()

const openLevel = ref<string | null>('N5')
const openChapter = ref<string | null>('n5-c1')

/** 從網址反推該展開哪一段，直接貼網址進來時側欄才不會對不上內容 */
watch(
  () => route.fullPath,
  () => {
    const levelParam = String(route.params.level ?? '').toUpperCase()
    const level = levels.find((l) => l.id === levelParam)
    if (!level) return
    openLevel.value = level.id
    const chapter = level.chapters.find((c) => c.order === Number(route.params.chapter))
    if (chapter) openChapter.value = chapter.id
  },
  { immediate: true },
)

function toggleLevel(level: Level) {
  openLevel.value = openLevel.value === level.id ? null : level.id
}

function toggleChapter(chapter: Chapter) {
  openChapter.value = openChapter.value === chapter.id ? null : chapter.id
}

const counts = computed(() =>
  Object.fromEntries(
    levels.map((l) => [
      l.id,
      {
        pct: levelCompletion(l, progress),
        // 準備中的級別沒有章，分母 0 時不顯示百分比而顯示狀態
        hasContent: l.chapters.some((c) => !c.pending),
      },
    ]),
  ),
)
</script>

<template>
  <nav class="sidebar" aria-label="課程大綱">
    <RouterLink to="/" class="brand" @click="emit('navigate')">
      <span class="mark">あ</span>
      <span class="wordmark">NihonGo</span>
    </RouterLink>

    <ul class="levels">
      <li v-for="level in levels" :key="level.id" class="level">
        <button
          class="level-head"
          :class="{ open: openLevel === level.id }"
          :style="{ '--hue': String(level.hue) }"
          :aria-expanded="openLevel === level.id"
          @click="toggleLevel(level)"
        >
          <span class="chev" aria-hidden="true">›</span>
          <span class="level-text">
            <span class="level-title">
              {{ level.title }}
              <span v-if="level.pending" class="chip">準備中</span>
            </span>
            <span class="level-sub">{{ level.subtitle }}</span>
          </span>
          <span v-if="counts[level.id].hasContent" class="level-pct">
            {{ Math.round(counts[level.id].pct * 100) }}%
          </span>
        </button>

        <ProgressBar
          v-if="counts[level.id].hasContent"
          class="level-bar"
          size="level"
          :value="counts[level.id].pct"
          :hue="level.hue"
        />

        <div v-if="openLevel === level.id" class="chapters">
          <p v-if="level.pending" class="empty">
            大綱編寫中。等課本到手之後補上章節。
          </p>

          <div v-for="chapter in level.chapters" :key="chapter.id" class="chapter">
            <button
              class="chapter-head"
              :class="{ open: openChapter === chapter.id }"
              :aria-expanded="openChapter === chapter.id"
              @click="toggleChapter(chapter)"
            >
              <span class="chev" aria-hidden="true">›</span>
              <span class="chapter-title">
                {{ chapter.order }}. {{ chapter.title }}
                <span v-if="chapter.pending" class="chip">準備中</span>
              </span>
              <span v-if="!chapter.pending" class="chapter-count">
                {{ chapterDone(chapter, progress) }}/{{ chapterTotal(chapter) }}
              </span>
            </button>

            <ProgressBar
              v-if="!chapter.pending"
              class="chapter-bar"
              :value="chapterCompletion(chapter, progress)"
              :hue="level.hue"
            />

            <ul v-if="openChapter === chapter.id" class="nodes">
              <li v-if="chapter.pending">
                <RouterLink
                  :to="chapterPath(level, chapter)"
                  class="node pending"
                  @click="emit('navigate')"
                >
                  <span class="tick" aria-hidden="true">·</span>
                  <span class="node-title">看這章會教什麼</span>
                </RouterLink>
              </li>

              <li v-for="node in chapterNodes(chapter)" :key="node.kind === 'lesson' ? node.lesson.id : node.quiz.id">
                <RouterLink
                  v-if="node.kind === 'lesson'"
                  :to="lessonPath(level, chapter, node.lesson)"
                  class="node"
                  :class="{ done: isLessonDone(node.lesson, progress) }"
                  @click="emit('navigate')"
                >
                  <span class="tick" aria-hidden="true">{{ isLessonDone(node.lesson, progress) ? '✓' : '○' }}</span>
                  <span class="node-title"><InlineText :text="node.lesson.title" /></span>
                </RouterLink>

                <RouterLink
                  v-else
                  :to="quizPath(level, chapter, node.quiz)"
                  class="node quiz"
                  :class="{ done: isQuizDone(node.quiz, progress) }"
                  @click="emit('navigate')"
                >
                  <span class="tick" aria-hidden="true">{{ isQuizDone(node.quiz, progress) ? '✓' : '◇' }}</span>
                  <span class="node-title">{{ node.quiz.title }}</span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>

    <section class="ref" aria-label="速查">
      <h2 class="ref-head">
        速查
        <span class="ref-sub">考前抓起來看的表</span>
      </h2>
      <ul class="ref-list">
        <li v-for="c in CATEGORIES" :key="c.id">
          <RouterLink :to="`/ref/${c.id}`" class="ref-link" @click="emit('navigate')">
            <span class="ref-title">
              {{ c.title }}
              <span v-if="c.scope" class="ref-scope">N4+</span>
            </span>
            <span class="ref-count">{{ c.sheets.length }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="ref" aria-label="漢字">
      <h2 class="ref-head">
        漢字
        <span class="ref-sub">常用漢字 2,136 字</span>
      </h2>
      <ul class="ref-list">
        <li>
          <RouterLink to="/kanji" class="ref-link" @click="emit('navigate')">
            <span class="ref-title">查漢字</span>
            <span class="ref-count">2136</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <div class="foot">
      <RouterLink :to="levelPath(levels[0])" class="foot-link" @click="emit('navigate')">
        N5 課程總覽
      </RouterLink>

      <label class="toggle">
        <input v-model="settings.romaji" type="checkbox" />
        <span>顯示羅馬字</span>
      </label>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--edge);
  padding-bottom: calc(var(--s-5) + env(safe-area-inset-bottom, 0px));
}

.brand {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
  background: var(--surface);
  border-bottom: 1px solid var(--edge);
  text-decoration: none;
  color: var(--text);
}

.mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--r-sm);
  background: var(--brand);
  color: #fff;
  font-size: var(--t-md);
}

.wordmark { font-weight: 700; letter-spacing: 0.01em; }

.levels { list-style: none; margin: 0; padding: var(--s-2) 0 0; }

.level { border-bottom: 1px solid var(--edge); }

.level-head,
.chapter-head {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  width: 100%;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  padding: var(--s-3) var(--s-5);
  min-height: var(--tap);
}

.level-head:hover,
.chapter-head:hover { background: var(--surface-2); }

.chev {
  flex: none;
  color: var(--muted);
  transition: transform var(--dur-base) var(--ease-out);
}
.level-head.open > .chev,
.chapter-head.open > .chev { transform: rotate(90deg); }

.level-text { flex: 1; min-width: 0; }

.level-title {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  font-weight: 700;
  font-size: var(--t-md);
  color: hsl(var(--hue) 46% 34%);
}

.level-sub {
  display: block;
  font-size: var(--t-xs);
  color: var(--muted);
}

.level-pct {
  flex: none;
  font-size: var(--t-xs);
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
}

.level-bar { width: calc(100% - var(--s-5) * 2); margin: 0 var(--s-5) var(--s-3); }

.chapters { padding-bottom: var(--s-3); }

.chapter-head { padding-left: var(--s-6); }

.chapter-title {
  flex: 1;
  min-width: 0;
  font-size: var(--t-sm);
  /* 章名可能兩行，不要給固定高度 */
  line-height: 1.4;
}

.chapter-count {
  flex: none;
  font-size: var(--t-xs);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.chapter-bar { width: calc(100% - var(--s-6) - var(--s-5)); margin: 0 var(--s-5) var(--s-2) var(--s-6); }

.chip {
  flex: none;
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.nodes { list-style: none; margin: 0 0 var(--s-2); padding: 0; }

.node {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-2) var(--s-5) var(--s-2) var(--s-7);
  min-height: 34px;
  font-size: var(--t-sm);
  color: var(--text-2);
  text-decoration: none;
  line-height: 1.4;
}

.node:hover { background: var(--surface-2); color: var(--text); }

.node.router-link-active {
  background: color-mix(in srgb, var(--brand-solid) 12%, transparent);
  color: var(--text);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--brand-solid);
}

.node.done .tick { color: hsl(152 52% 40%); }
.node.quiz .node-title { font-style: italic; }
.node.pending { color: var(--muted); }

.tick {
  flex: none;
  width: 14px;
  text-align: center;
  font-size: var(--t-xs);
  color: var(--trail);
}

.empty {
  margin: 0;
  padding: var(--s-2) var(--s-5) var(--s-4) var(--s-6);
  font-size: var(--t-xs);
  color: var(--muted);
}

.ref {
  margin-top: var(--s-5);
  padding: var(--s-4) 0 0;
  border-top: 1px solid var(--edge);
}

.ref-head {
  display: flex;
  align-items: baseline;
  gap: var(--s-2);
  margin: 0 0 var(--s-2);
  padding: 0 var(--s-4);
  font-size: var(--t-sm);
  font-weight: 600;
  color: var(--text-2);
}

.ref-sub { font-size: var(--t-xs); font-weight: 400; color: var(--muted); }

.ref-list { margin: 0; padding: 0; list-style: none; }

.ref-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  min-height: 38px;
  padding: 0 var(--s-4);
  color: var(--text-2);
  font-size: var(--t-sm);
  text-decoration: none;
  transition: background var(--dur-fast), color var(--dur-fast);
}

.ref-link:hover { background: var(--surface-2); color: var(--text); }

.ref-link.router-link-active {
  color: var(--text);
  font-weight: 600;
  box-shadow: inset 2px 0 0 var(--brand-solid);
}

.ref-scope {
  margin-left: var(--s-1);
  padding: 1px 4px;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 10px;
}

.ref-count {
  min-width: 18px;
  padding: 0 5px;
  border-radius: var(--r-pill);
  background: var(--surface-2);
  color: var(--muted);
  font-size: var(--t-xs);
  text-align: center;
}

.foot {
  margin-top: auto;
  padding: var(--s-4) var(--s-5) 0;
  display: grid;
  gap: var(--s-3);
  border-top: 1px solid var(--edge);
}

.foot-link {
  font-size: var(--t-xs);
  color: var(--muted);
  text-decoration: none;
}
.foot-link:hover { color: var(--text); }

/* 羅馬字關掉之後必須有地方打得開，否則那句「之後隨時可以打開」是騙人的 */
.toggle {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  min-height: var(--tap);
  font-size: var(--t-xs);
  color: var(--muted);
  cursor: pointer;
}
.toggle input { accent-color: var(--brand-solid); width: 16px; height: 16px; }
</style>
