<script setup lang="ts">
/**
 * 一課 = 教材 + 6 題隨堂練習，單頁往下捲。
 * 不分 tab：分成兩頁的結果是大部分人只看教材不做練習。
 */
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Answer } from '../core/quiz'
import { findChapter, findLesson, findLevel, lessonPath, quizPath } from '../data/routes'
import { chapterNodes, isLessonDone, LESSON_QUESTIONS } from '../core/progress'
import { useProgress } from '../composables/useProgress'
import { useSettings } from '../composables/useSettings'
import ContentBlocks from '../components/ContentBlocks.vue'
import InlineText from '../components/InlineText.vue'
import QuestionCard from '../components/QuestionCard.vue'

const route = useRoute()
const { progress, state, completeLesson } = useProgress()
const { settings } = useSettings()

const level = computed(() => findLevel(route.params.level))
const chapter = computed(() => findChapter(level.value, route.params.chapter))
const lesson = computed(() => findLesson(chapter.value, route.params.lesson))

const answers = reactive(new Map<string, Answer>())
const firstTry = reactive(new Map<string, boolean>())
const finalCorrect = reactive(new Map<string, boolean>())
const showRomajiPrompt = ref(false)

/** 換課時把作答狀態清乾淨，否則上一課的答案會殘留在同一個元件實例上 */
watch(
  () => lesson.value?.id,
  () => {
    answers.clear()
    firstTry.clear()
    finalCorrect.clear()
    showRomajiPrompt.value = false
  },
)

const allCorrect = computed(() => {
  const qs = lesson.value?.questions ?? []
  return qs.length > 0 && qs.every((q) => finalCorrect.get(q.id))
})

const firstTryScore = computed(() => {
  const qs = lesson.value?.questions ?? []
  return qs.filter((q) => firstTry.get(q.id)).length
})

const settledCount = computed(() => {
  const qs = lesson.value?.questions ?? []
  return qs.filter((q) => finalCorrect.has(q.id)).length
})

function onSettle(id: string, correct: boolean, first: boolean) {
  if (first) firstTry.set(id, correct)
  finalCorrect.set(id, correct)
}

/** 六題全部訂正到對，這一課才打勾。 */
watch(allCorrect, (done) => {
  const l = lesson.value
  if (!done || !l) return

  completeLesson(l.id, l.questions, firstTry, finalCorrect)

  // 平假名這一章讀完了，問一次要不要把羅馬字拿掉。
  // 系統自動關會被當成壞掉，自己按下去的人才會接受後果。
  const ch = chapter.value
  if (
    ch?.order === 1 &&
    settings.romaji &&
    !settings.romajiPromptSeen &&
    ch.lessons.every((x) => isLessonDone(x, progress))
  ) {
    showRomajiPrompt.value = true
  }
})

function dismissPrompt(turnOff: boolean) {
  settings.romajiPromptSeen = true
  if (turnOff) settings.romaji = false
  showRomajiPrompt.value = false
}

/** 下一步：同章的下一個節點，沒有就回章首 */
const next = computed(() => {
  const lv = level.value
  const ch = chapter.value
  const l = lesson.value
  if (!lv || !ch || !l) return null

  const nodes = chapterNodes(ch)
  const i = nodes.findIndex((n) => n.kind === 'lesson' && n.lesson.id === l.id)
  const n = nodes[i + 1]
  if (!n) return null

  return n.kind === 'lesson'
    ? { label: `下一課：${n.lesson.title}`, to: lessonPath(lv, ch, n.lesson) }
    : { label: `進行驗收：${n.quiz.title}`, to: quizPath(lv, ch, n.quiz) }
})

const done = computed(() => (lesson.value ? isLessonDone(lesson.value, progress) : false))

/**
 * 已經存下來的首答成績。
 * 沒有這個的話，重看一堂已完成的課會看到「首答答對 0」——
 * 頁面同時說「已完成」又說「0 分」，兩個資訊互相矛盾，
 * 而且上次真正的成績就這樣消失了。
 */
const saved = computed(() => (lesson.value ? state.lessons.get(lesson.value.id) : undefined))

/** 這一輪有沒有動過 */
const touched = computed(() => finalCorrect.size > 0)
</script>

<template>
  <div v-if="lesson && chapter && level" class="page">
    <nav class="crumbs">
      <RouterLink :to="`/${level.id.toLowerCase()}`">{{ level.title }}</RouterLink>
      <span aria-hidden="true">›</span>
      <RouterLink :to="`/${level.id.toLowerCase()}/${chapter.order}`">
        第 {{ chapter.order }} 章 {{ chapter.title }}
      </RouterLink>
    </nav>

    <header class="head">
      <h1><InlineText :text="lesson.title" /></h1>
      <p class="goal"><InlineText :text="lesson.goal" /></p>
      <div class="meta">
        <span>約 {{ lesson.minutes }} 分鐘</span>
        <!-- 讓人隨時知道自己在課本的哪一課，對照著讀不必換算 -->
        <span v-if="lesson.bookUnit" class="book">完全掌握 {{ lesson.bookUnit }}</span>
        <span v-if="done" class="done-chip">已完成</span>
        <span v-if="saved" class="first-try">首答 {{ saved.firstTryCorrect }} / {{ saved.total }}</span>
        <RouterLink v-if="lesson.printSet" class="print-link" :to="`/print/${lesson.printSet.id}`">
          列印這課的手寫練習紙
        </RouterLink>
      </div>
    </header>

    <ContentBlocks :blocks="lesson.blocks" />

    <section class="practice">
      <header class="practice-head">
        <h2>隨堂練習</h2>
        <p>
          {{ LESSON_QUESTIONS }} 題全部答對才算完成這一課。答錯可以當場訂正，
          首答成績會另外記下來給你自己看。
        </p>
        <p v-if="touched" class="counter">
          已判定 {{ settledCount }} / {{ lesson.questions.length }}　這次首答答對 {{ firstTryScore }}
        </p>
        <p v-else-if="saved" class="counter">
          上次首答 {{ saved.firstTryCorrect }} / {{ saved.total }}　—— 再做一次不會覆蓋這個紀錄
        </p>
        <p v-else class="counter">尚未作答</p>
      </header>

      <div class="cards">
        <QuestionCard
          v-for="(q, i) in lesson.questions"
          :key="q.id"
          :question="q"
          :index="i"
          mode="practice"
          :answer="answers.get(q.id)"
          @update:answer="answers.set(q.id, $event)"
          @settle="(c, f) => onSettle(q.id, c, f)"
        />
      </div>
    </section>

    <footer v-if="allCorrect" class="finish">
      <p class="verdict">這一課完成了。首答 {{ firstTryScore }} / {{ lesson.questions.length }}。</p>
      <RouterLink v-if="next" class="next" :to="next.to">{{ next.label }}</RouterLink>
      <RouterLink v-else class="next" :to="`/${level.id.toLowerCase()}/${chapter.order}`">
        回到本章總覽
      </RouterLink>
    </footer>

    <div v-if="showRomajiPrompt" class="prompt" role="dialog" aria-label="羅馬字設定">
      <p>
        平假名三課都完成了。羅馬字是初學者的拐杖，現在拿掉它，你會強迫自己直接讀假名——
        之後隨時可以在這裡打開。
      </p>
      <div class="prompt-actions">
        <button class="primary" @click="dismissPrompt(true)">關掉羅馬字</button>
        <button @click="dismissPrompt(false)">再留一陣子</button>
      </div>
    </div>
  </div>

  <p v-else class="missing">找不到這一課。</p>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; }

.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
  margin-bottom: var(--s-4);
  font-size: var(--t-xs);
  color: var(--muted);
}
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { color: var(--text); }

.head { margin-bottom: var(--s-6); }

h1 {
  margin: 0 0 var(--s-2);
  font-size: 30px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.goal { margin: 0 0 var(--s-3); font-size: var(--t-md); color: var(--text-2); line-height: 1.7; }

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3);
  font-size: var(--t-xs);
  color: var(--muted);
}

.book {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  border: 1px solid var(--edge);
  color: var(--text-2);
  font-weight: 600;
}

.done-chip {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  background: color-mix(in srgb, hsl(152 52% 40%) 16%, transparent);
  color: hsl(152 48% 30%);
  font-weight: 700;
}

.first-try {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  border: 1px solid var(--edge);
  color: var(--text-2);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.print-link { color: var(--brand-solid); text-decoration: none; font-weight: 600; }
.print-link:hover { text-decoration: underline; }

.practice { margin-top: var(--s-8); padding-top: var(--s-6); border-top: 1px solid var(--edge); }

.practice-head h2 { margin: 0 0 var(--s-2); font-size: var(--t-xl); }
.practice-head p { margin: 0 0 var(--s-2); font-size: var(--t-sm); color: var(--text-2); line-height: 1.7; }
.counter { font-variant-numeric: tabular-nums; color: var(--muted) !important; }

.cards { display: grid; gap: var(--s-4); margin-top: var(--s-5); }

.finish {
  margin-top: var(--s-6);
  padding: var(--s-5);
  border-radius: var(--r-lg);
  background: color-mix(in srgb, hsl(152 52% 40%) 12%, transparent);
  text-align: center;
}

.verdict { margin: 0 0 var(--s-4); font-weight: 700; }

.next {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  padding: 0 var(--s-5);
  border-radius: var(--r-md);
  background: var(--brand);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.prompt {
  position: sticky;
  bottom: calc(var(--s-4) + env(safe-area-inset-bottom, 0px));
  margin-top: var(--s-6);
  padding: var(--s-5);
  border: 1px solid var(--edge);
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: var(--elev-card);
}

.prompt p { margin: 0 0 var(--s-4); font-size: var(--t-sm); line-height: 1.7; color: var(--text-2); }

.prompt-actions { display: flex; flex-wrap: wrap; gap: var(--s-3); }

.prompt-actions button {
  min-height: var(--tap);
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.prompt-actions .primary { background: var(--brand); color: #fff; border-color: transparent; }

.missing { max-width: 720px; margin: 0 auto; color: var(--muted); }
</style>
