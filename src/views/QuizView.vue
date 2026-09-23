<script setup lang="ts">
/**
 * 每 3 課的試題。考卷式：全部做完才批改，中途不透露對錯。
 * 這跟隨堂練習的即時回饋剛好相反 —— 兩者的體感差異就是「練習」與「測驗」的差別。
 */
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Question } from '../core/types'
import type { Answer } from '../core/quiz'
import { checkAnswer, drawQuiz } from '../core/quiz'
import { QUIZ_PASS, QUIZ_QUESTIONS, quizPassed } from '../core/progress'
import { quizzesBefore } from '../data/levels'
import { findChapter, findLevel, findQuiz } from '../data/routes'
import { useProgress } from '../composables/useProgress'
import QuestionCard from '../components/QuestionCard.vue'

const route = useRoute()
const { state, recordQuiz, recordReview } = useProgress()

const level = computed(() => findLevel(route.params.level))
const chapter = computed(() => findChapter(level.value, route.params.chapter))
const quiz = computed(() => findQuiz(chapter.value, route.params.index))

const paper = ref<Question[]>([])
const answers = reactive(new Map<string, Answer>())
const submitted = ref(false)
/** 批改完之後，可以只把答錯的那幾題單獨再做一次（不計分） */
const fixing = ref(false)

function deal() {
  const q = quiz.value
  if (!q) return
  paper.value = drawQuiz({
    quiz: q,
    priorQuizzes: quizzesBefore(q.id),
    records: state.srs,
  })
  answers.clear()
  submitted.value = false
  fixing.value = false
}

watch(() => quiz.value?.id, deal, { immediate: true })

const answeredCount = computed(() => paper.value.filter((q) => answers.has(q.id)).length)

const correctMap = computed(
  () => new Map(paper.value.map((q) => [q.id, checkAnswer(q, answers.get(q.id))])),
)

const correctCount = computed(() => paper.value.filter((q) => correctMap.value.get(q.id)).length)
const score = computed(() =>
  paper.value.length === 0 ? 0 : correctCount.value / paper.value.length,
)

const wrongQuestions = computed(() => paper.value.filter((q) => !correctMap.value.get(q.id)))

function submit() {
  const q = quiz.value
  if (!q) return
  submitted.value = true
  recordQuiz(q.id, paper.value, correctMap.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 重考一律重抽。同一份考三次，記住的會是「第 3 題選 C」而不是假名。 */
function retake() {
  deal()
  window.scrollTo({ top: 0 })
}

const fixQuestions = ref<Question[]>([])
const fixAnswers = reactive(new Map<string, Answer>())
const fixResults = reactive(new Map<string, boolean>())

function startFixing() {
  fixQuestions.value = wrongQuestions.value
  fixAnswers.clear()
  fixResults.clear()
  fixing.value = true
}

/** 錯題重做只更新熟悉度，不修改試題成績 —— 複習是維持，不是前進。 */
watch(
  () => fixQuestions.value.length > 0 && fixQuestions.value.every((q) => fixResults.get(q.id)),
  (allFixed) => {
    if (!allFixed) return
    recordReview(fixQuestions.value, fixResults)
  },
)

const best = computed(() => (quiz.value ? state.quizzes.get(quiz.value.id)?.bestScore ?? 0 : 0))
const attempts = computed(() => (quiz.value ? state.quizzes.get(quiz.value.id)?.attempts ?? 0 : 0))
</script>

<template>
  <div v-if="quiz && chapter && level" class="page">
    <nav class="crumbs">
      <RouterLink :to="`/${level.id.toLowerCase()}`">{{ level.title }}</RouterLink>
      <span aria-hidden="true">›</span>
      <RouterLink :to="`/${level.id.toLowerCase()}/${chapter.order}`">
        第 {{ chapter.order }} 章 {{ chapter.title }}
      </RouterLink>
    </nav>

    <header class="head">
      <p class="kicker">階段驗收</p>
      <h1>{{ quiz.title }}</h1>
      <p class="goal">
        {{ QUIZ_QUESTIONS }} 題，全部做完才批改，不計時。
        答對 {{ Math.round(QUIZ_PASS * 100) }}% 以上就通過，可以無限次重考，取最高分。
      </p>
      <p v-if="attempts > 0" class="meta">
        已考 {{ attempts }} 次　最高分 {{ Math.round(best * 100) }}%
      </p>
    </header>

    <section v-if="submitted" class="result" :class="{ pass: quizPassed(score) }">
      <p class="score">{{ correctCount }} / {{ paper.length }}</p>
      <p class="verdict">
        {{ quizPassed(score) ? '通過了。這三課的內容你接得起來。' : '還沒通過。下面每一題都有解析，看完再考一次。' }}
      </p>
      <div class="actions">
        <button class="primary" @click="retake">再考一次（重新抽題）</button>
        <button v-if="wrongQuestions.length && !fixing" @click="startFixing">
          只練這次錯的 {{ wrongQuestions.length }} 題
        </button>
        <RouterLink class="link" to="/wrong">打開錯題本</RouterLink>
      </div>
    </section>

    <section v-if="fixing" class="fixing">
      <h2>訂正練習</h2>
      <p class="note">這裡的作答不會改變上面的成績，但答對會讓這些題目之後少出現。</p>
      <div class="cards">
        <QuestionCard
          v-for="(q, i) in fixQuestions"
          :key="`fix-${q.id}`"
          :question="q"
          :index="i"
          mode="practice"
          :answer="fixAnswers.get(q.id)"
          @update:answer="fixAnswers.set(q.id, $event)"
          @settle="(c) => fixResults.set(q.id, c)"
        />
      </div>
    </section>

    <template v-else>
      <div class="cards">
        <QuestionCard
          v-for="(q, i) in paper"
          :key="q.id"
          :question="q"
          :index="i"
          mode="exam"
          :revealed="submitted"
          :answer="answers.get(q.id)"
          @update:answer="answers.set(q.id, $event)"
        />
      </div>

      <footer v-if="!submitted" class="submit-bar">
        <span class="count">已作答 {{ answeredCount }} / {{ paper.length }}</span>
        <button class="primary" :disabled="answeredCount < paper.length" @click="submit">
          送出並批改
        </button>
      </footer>
    </template>
  </div>

  <p v-else class="missing">找不到這份試題。</p>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; }

.crumbs {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2);
  margin-bottom: var(--s-4); font-size: var(--t-xs); color: var(--muted);
}
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { color: var(--text); }

.kicker {
  margin: 0 0 var(--s-1);
  font-size: var(--t-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--brand-solid);
}

h1 { margin: 0 0 var(--s-2); font-size: 30px; line-height: 1.3; }
.goal { margin: 0 0 var(--s-2); font-size: var(--t-sm); color: var(--text-2); line-height: 1.7; }
.meta { margin: 0; font-size: var(--t-xs); color: var(--muted); font-variant-numeric: tabular-nums; }

.head { margin-bottom: var(--s-6); }

.result {
  margin-bottom: var(--s-6);
  padding: var(--s-5);
  border-radius: var(--r-lg);
  background: color-mix(in srgb, hsl(4 64% 52%) 10%, transparent);
  text-align: center;
}
.result.pass { background: color-mix(in srgb, hsl(152 52% 40%) 12%, transparent); }

.score { margin: 0; font-size: 36px; font-weight: 800; font-variant-numeric: tabular-nums; }
.verdict { margin: var(--s-2) 0 var(--s-4); font-size: var(--t-sm); color: var(--text-2); }

.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--s-3); }

button {
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
button.primary { background: var(--brand); color: #fff; border-color: transparent; }
button:disabled { opacity: 0.5; cursor: default; }

.link {
  display: inline-flex; align-items: center;
  min-height: var(--tap); padding: 0 var(--s-3);
  color: var(--brand-solid); font-weight: 600; text-decoration: none;
}

.cards { display: grid; gap: var(--s-4); }

.fixing { margin-top: var(--s-5); }
.fixing h2 { margin: 0 0 var(--s-2); font-size: var(--t-xl); }
.note { margin: 0 0 var(--s-4); font-size: var(--t-sm); color: var(--text-2); }

.submit-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4);
  margin-top: var(--s-5);
  padding: var(--s-4) 0 calc(var(--s-4) + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, var(--bg) 70%, transparent);
}

.count { font-size: var(--t-sm); color: var(--muted); font-variant-numeric: tabular-nums; }

.missing { max-width: 720px; margin: 0 auto; color: var(--muted); }
</style>
