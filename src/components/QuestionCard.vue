<script setup lang="ts">
/**
 * 一題的外框：題幹、發音鈕、作答區、回饋。
 *
 * 兩種模式的差別就是「練習」與「測驗」的體感差別：
 * practice 一填完就判定、當場給解析、錯了可以馬上訂正；
 * exam 全部做完才批改，中途不透露任何對錯。
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import type { Question } from '../core/types'
import type { Answer } from '../core/quiz'
import { checkAnswer, isComplete } from '../core/quiz'
import { useSpeech } from '../composables/useSpeech'
import InlineText from './InlineText.vue'
import ChoiceInput from './questions/ChoiceInput.vue'
import MatchInput from './questions/MatchInput.vue'
import FillInput from './questions/FillInput.vue'
import ReorderInput from './questions/ReorderInput.vue'
import PassageInput from './questions/PassageInput.vue'
import ListeningInput from './questions/ListeningInput.vue'

const props = defineProps<{
  question: Question
  index: number
  mode: 'practice' | 'exam'
  answer: Answer | undefined
  /** exam 模式由外面控制何時揭曉 */
  revealed?: boolean
}>()

const emit = defineEmits<{
  'update:answer': [value: Answer]
  /** 每次判定都送出一次：correct 是這次的結果，first 表示是不是第一次判定 */
  settle: [correct: boolean, first: boolean]
}>()

const { speak, supported } = useSpeech()

const checkedLocally = ref(false)
const attempts = ref(0)
const feedback = ref<HTMLElement | null>(null)

const revealed = computed(() =>
  props.mode === 'exam' ? Boolean(props.revealed) : checkedLocally.value,
)

const correct = computed(() => checkAnswer(props.question, props.answer))

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function setAnswer(value: Answer) {
  emit('update:answer', value)
  if (props.mode !== 'practice' || checkedLocally.value) return

  // 練習模式：填完就判定，不必再按一次「送出」
  if (isComplete(props.question, value)) {
    checkedLocally.value = true
    attempts.value += 1
    emit('settle', checkAnswer(props.question, value), attempts.value === 1)
  }
}

/** 錯了可以當場訂正。首答已經記下去了，訂正不會把成績洗白。 */
function retry() {
  checkedLocally.value = false
  emit('update:answer', blankAnswer())
}

/** 各題型的「還沒作答」長什麼樣。這個清單漏一種，那一種就訂正不了。 */
function blankAnswer(): Answer {
  switch (props.question.type) {
    case 'choice':
    case 'passage':
    case 'listening':
      return -1
    case 'fill':
      return []
    case 'reorder':
      return props.question.segments.map(() => -1)
    case 'match':
      return {}
  }
}

watch(revealed, (on) => {
  if (!on || reduced() || !feedback.value) return
  gsap.from(feedback.value, { autoAlpha: 0, y: -6, duration: 0.24, ease: 'power2.out' })
})

watch(() => props.question.id, () => {
  checkedLocally.value = false
  attempts.value = 0
})

onBeforeUnmount(() => {
  if (feedback.value) gsap.killTweensOf(feedback.value)
})

/**
 * 題幹旁邊那顆發音鈕只給 choice 用。
 * listening 的播放鍵在作答區裡面 —— 對聽解題來說「按播放」是作答的第一步，
 * 縮成題幹旁的小音符會讓人找不到。
 */
const speakable = computed(() =>
  props.question.type === 'choice' ? props.question.speak : undefined,
)

/**
 * 標題列印什麼。
 * fill 的 prompt 是帶空格的句子，句子在作答區裡已經印過一次了；
 * reorder 同理。這兩種在標題列改印指示語，照 JLPT 的措辭。
 */
const headPrompt = computed(() => {
  switch (props.question.type) {
    case 'fill':
      return '選出正確的答案'
    case 'reorder':
      return '★ に 入る ものは どれですか（哪個選項會排到星號那一格）'
    default:
      return props.question.prompt
  }
})
</script>

<template>
  <article class="card" :class="{ revealed, correct: revealed && correct }">
    <header class="head">
      <span class="num">{{ index + 1 }}</span>
      <h3 class="prompt">
        <InlineText :text="headPrompt" />
      </h3>
      <button
        v-if="speakable && supported"
        class="speak"
        :aria-label="`播放發音`"
        @click="speak(speakable!)"
      >
        ♪
      </button>
    </header>

    <ChoiceInput
      v-if="question.type === 'choice'"
      :question="question"
      :answer="typeof answer === 'number' ? answer : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @pick="setAnswer($event)"
    />

    <MatchInput
      v-else-if="question.type === 'match'"
      :question="question"
      :answer="answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @change="setAnswer($event)"
      @speak="speak($event)"
    />

    <FillInput
      v-else-if="question.type === 'fill'"
      :question="question"
      :answer="Array.isArray(answer) && answer.every((v) => typeof v === 'string') ? (answer as string[]) : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @change="setAnswer($event)"
    />

    <ReorderInput
      v-else-if="question.type === 'reorder'"
      :question="question"
      :answer="Array.isArray(answer) && answer.every((v) => typeof v === 'number') ? (answer as number[]) : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @change="setAnswer($event)"
    />

    <PassageInput
      v-else-if="question.type === 'passage'"
      :question="question"
      :answer="typeof answer === 'number' ? answer : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @pick="setAnswer($event)"
    />

    <ListeningInput
      v-else
      :question="question"
      :answer="typeof answer === 'number' ? answer : undefined"
      :disabled="revealed"
      :revealed="revealed"
      @pick="setAnswer($event)"
    />

    <div v-if="revealed" ref="feedback" class="feedback" :class="correct ? 'ok' : 'no'">
      <p class="verdict">{{ correct ? '答對了' : '再看一次' }}</p>
      <p class="explain"><InlineText :text="question.explanation" /></p>
      <button v-if="!correct && mode === 'practice'" class="retry" @click="retry">
        再試一次
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  padding: var(--s-5);
  border: 1px solid var(--edge);
  border-radius: var(--r-lg);
  background: var(--surface);
  transition: border-color var(--dur-base);
}

.card.revealed { border-color: hsl(4 64% 52%); }
.card.revealed.correct { border-color: hsl(152 52% 40%); }

.head {
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
  margin-bottom: var(--s-4);
}

.num {
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--muted);
  font-size: var(--t-xs);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.prompt {
  flex: 1;
  margin: 0;
  font-size: var(--t-md);
  font-weight: 600;
  line-height: 1.5;
}

.speak {
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid var(--edge);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--brand-solid);
  font-size: var(--t-md);
  cursor: pointer;
}
.speak:hover { background: var(--surface-2); }

.feedback {
  margin-top: var(--s-4);
  padding: var(--s-3) var(--s-4);
  border-radius: var(--r-md);
  background: var(--surface-2);
}

.feedback.ok { background: color-mix(in srgb, hsl(152 52% 40%) 12%, transparent); }
.feedback.no { background: color-mix(in srgb, hsl(4 64% 52%) 10%, transparent); }

.verdict { margin: 0 0 var(--s-1); font-weight: 700; font-size: var(--t-sm); }
.explain { margin: 0; font-size: var(--t-sm); color: var(--text-2); line-height: 1.7; }

.retry {
  margin-top: var(--s-3);
  min-height: 36px;
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-sm);
  font-weight: 600;
  cursor: pointer;
}
.retry:hover { border-color: var(--brand-solid); }

</style>
