<script setup lang="ts">
/**
 * 練習試題與錯題本。兩者都不計入課程進度。
 *
 * 原本這裡是「今日複習」（照 SRS 排程每天推到期的知識點），
 * 後來換掉了 —— 學習者要複習會自己回去點那一課，
 * 系統排程的每日複習在這個產品裡是多餘的一層。
 * 現在改成一個**隨時可以打開的練習試題庫**：選範圍、抽 15 題、練完就走。
 *
 * SRS 的熟悉度仍然留著，但只用在兩個地方：抽題時優先抽生疏的，
 * 以及階段驗收的舊題抽樣。使用者看不到它，也不必管它。
 */
import { computed, reactive, ref, watch } from 'vue'
import type { Question } from '../core/types'
import type { Answer } from '../core/quiz'
import { levels } from '../data/levels'
import { useProgress } from '../composables/useProgress'
import { questionsById } from '../core/quiz'
import QuestionCard from '../components/QuestionCard.vue'
import InlineText from '../components/InlineText.vue'

const props = withDefaults(defineProps<{ mode?: 'practice' | 'wrong' }>(), { mode: 'practice' })

/** 一輪固定 15 題。做得完才會每天做。 */
const ROUND = 15

const { state, wrongIds, recordReview } = useProgress()

/** 有內容的級別；沒內容的顯示為準備中，點不動 */
const levelTabs = computed(() =>
  levels.map((l) => ({
    id: l.id,
    title: l.title,
    hue: l.hue,
    ready: l.chapters.some((c) => !c.pending),
  })),
)

const activeLevel = ref(levelTabs.value.find((l) => l.ready)?.id ?? 'N5')

const chapters = computed(
  () => levels.find((l) => l.id === activeLevel.value)?.chapters.filter((c) => !c.pending) ?? [],
)

/** null＝全部章節 */
const activeChapter = ref<string | null>(null)

watch(activeLevel, () => {
  activeChapter.value = null
  start()
})

/** 選定範圍裡的所有題目 */
const pool = computed<Question[]>(() => {
  if (props.mode === 'wrong') {
    const all = levels
      .flatMap((l) => l.chapters)
      .flatMap((c) => [...c.lessons.flatMap((x) => x.questions), ...c.quizzes.flatMap((q) => q.bank)])
    return questionsById(all, wrongIds.value)
  }
  const scope = activeChapter.value
    ? chapters.value.filter((c) => c.id === activeChapter.value)
    : chapters.value
  return scope.flatMap((c) => [
    ...c.lessons.flatMap((x) => x.questions),
    ...c.quizzes.flatMap((q) => q.bank),
  ])
})

const session = ref<Question[]>([])
const answers = reactive(new Map<string, Answer>())
const results = reactive(new Map<string, boolean>())
const remaining = ref(0)

/** 熟悉度最低的排前面；沒紀錄的視為最生疏 */
function weakness(q: Question) {
  const levelsOf = q.knowledgePoints.map((kp) => state.srs.get(kp)?.familiarity ?? 0)
  return levelsOf.length === 0 ? 0 : Math.min(...levelsOf)
}

function start() {
  // 同一個知識點可能被好幾題涵蓋，去重之後才不會連出三題一模一樣的
  const seen = new Set<string>()
  const ranked = pool.value
    .map((q) => ({ q, w: weakness(q), r: Math.random() }))
    .sort((a, b) => a.w - b.w || a.r - b.r)

  const picked: Question[] = []
  for (const { q } of ranked) {
    const key = q.knowledgePoints.join('|')
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(q)
    if (picked.length >= ROUND) break
  }
  session.value = picked
  remaining.value = Math.max(0, pool.value.length - picked.length)
  answers.clear()
  results.clear()
}

watch(() => [props.mode, activeChapter.value].join(), start, { immediate: true })

const settled = computed(() => session.value.filter((q) => results.has(q.id)).length)
const finished = computed(
  () => session.value.length > 0 && session.value.every((q) => results.get(q.id)),
)

/** 練習只更新熟悉度，不碰任何成績。 */
watch(finished, (done) => {
  if (done) recordReview(session.value, results)
})

const title = computed(() => (props.mode === 'wrong' ? '錯題本' : 'N5–N1 練習試題'))
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>{{ title }}</h1>
      <p v-if="mode === 'practice'">
        從已經有內容的章節抽 {{ ROUND }} 題，優先抽你比較生疏的。
        這裡的作答不會改變任何課程進度。
      </p>
      <p v-else>
        答錯兩次以上、而且還沒訂正回來的題目。答對就會從這裡移出去。
      </p>
    </header>

    <template v-if="mode === 'practice'">
      <nav class="levels" aria-label="級別">
        <button
          v-for="l in levelTabs"
          :key="l.id"
          class="level"
          :class="{ on: activeLevel === l.id }"
          :style="{ '--hue': String(l.hue) }"
          :disabled="!l.ready"
          @click="activeLevel = l.id"
        >
          {{ l.title }}
          <span v-if="!l.ready" class="chip">準備中</span>
        </button>
      </nav>

      <nav class="scope" aria-label="範圍">
        <button class="chip-btn" :class="{ on: activeChapter === null }" @click="activeChapter = null">
          全部章節
        </button>
        <button
          v-for="c in chapters"
          :key="c.id"
          class="chip-btn"
          :class="{ on: activeChapter === c.id }"
          @click="activeChapter = c.id"
        >
          {{ c.order }}. <InlineText :text="c.title" />
        </button>
      </nav>
    </template>

    <p v-if="session.length === 0" class="empty">
      {{ mode === 'wrong'
        ? '錯題本是空的。同一題答錯兩次才會收進來。'
        : '這個範圍還沒有題目。' }}
    </p>

    <template v-else>
      <p class="counter">
        {{ settled }} / {{ session.length }}
        <span v-if="remaining > 0">　（這個範圍還有 {{ remaining }} 題）</span>
      </p>

      <div class="cards">
        <QuestionCard
          v-for="(q, i) in session"
          :key="q.id"
          :question="q"
          :index="i"
          mode="practice"
          :answer="answers.get(q.id)"
          @update:answer="answers.set(q.id, $event)"
          @settle="(c) => results.set(q.id, c)"
        />
      </div>

      <footer v-if="finished" class="finish">
        <p>這一輪做完了。</p>
        <button @click="start">再抽一輪</button>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; }

.head { margin-bottom: var(--s-5); }
h1 { margin: 0 0 var(--s-2); font-size: 30px; }
.head p { margin: 0; font-size: var(--t-sm); color: var(--text-2); line-height: 1.7; }

.levels { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-bottom: var(--s-3); }

.level {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  min-height: 36px;
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-2);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.level.on {
  border-color: hsl(var(--hue) 52% 46%);
  background: color-mix(in srgb, hsl(var(--hue) 52% 46%) 14%, transparent);
  color: var(--text);
}
.level:disabled { opacity: 0.45; cursor: default; }

.scope { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-bottom: var(--s-5); }

.chip-btn {
  min-height: 32px;
  padding: 0 var(--s-3);
  border: 1px solid var(--edge);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--text-2);
  font: inherit;
  font-size: var(--t-xs);
  cursor: pointer;
  /* 章名可能含振り仮名，不要給固定高度 */
  line-height: 1.6;
}
.chip-btn:hover { border-color: var(--brand-solid); }
.chip-btn.on { background: var(--brand); color: #fff; border-color: transparent; }

.chip {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11px;
}

.empty {
  padding: var(--s-6);
  border: 1px dashed var(--edge);
  border-radius: var(--r-lg);
  text-align: center;
  color: var(--muted);
  font-size: var(--t-sm);
}

.counter {
  margin: 0 0 var(--s-4);
  font-size: var(--t-xs);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.cards { display: grid; gap: var(--s-4); }

.finish {
  margin-top: var(--s-5);
  padding: var(--s-5);
  border-radius: var(--r-lg);
  background: color-mix(in srgb, hsl(152 52% 40%) 12%, transparent);
  text-align: center;
}
.finish p { margin: 0 0 var(--s-4); font-weight: 700; }

button.finish-btn, .finish button {
  min-height: var(--tap);
  padding: 0 var(--s-5);
  border: 0;
  border-radius: var(--r-md);
  background: var(--brand);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
</style>
