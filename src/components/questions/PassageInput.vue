<script setup lang="ts">
/**
 * 讀解與文章語法。短文在上、四選一在下。
 *
 * 短文用等寬的一欄，最寬 34em —— 一行超過四十個字，眼睛回行時會找錯行，
 * 這在考試型的閱讀題特別要命。
 */
import { computed } from 'vue'
import type { PassageQuestion } from '../../core/types'
import { shuffleStable } from '../../core/quiz'
import InlineText from '../InlineText.vue'

const props = defineProps<{
  question: PassageQuestion
  answer: number | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{ pick: [index: number] }>()

/** 短文以空行分段 */
const paragraphs = computed(() => props.question.passage.split('\n').filter(Boolean))

const shuffled = computed(() =>
  shuffleStable(
    props.question.options.map((text, i) => ({ text, i })),
    props.question.id,
  ),
)

const stateOf = (i: number) => {
  if (!props.revealed) return props.answer === i ? 'picked' : ''
  if (i === props.question.answerIndex) return 'right'
  return props.answer === i ? 'wrong' : ''
}
</script>

<template>
  <div class="passage-q">
    <section class="passage">
      <h4 v-if="question.passageTitle" class="ptitle">
        <InlineText :text="question.passageTitle" />
      </h4>
      <p v-for="(para, i) in paragraphs" :key="i">
        <InlineText :text="para" />
      </p>
    </section>

    <div class="options" role="radiogroup" :aria-label="question.prompt">
      <button
        v-for="opt in shuffled"
        :key="opt.i"
        class="opt"
        :class="stateOf(opt.i)"
        role="radio"
        :aria-checked="answer === opt.i"
        :disabled="disabled"
        @click="emit('pick', opt.i)"
      >
        <InlineText :text="opt.text" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.passage-q { display: grid; gap: var(--s-4); min-width: 0; }

.passage {
  max-width: 34em;
  padding: var(--s-4) var(--s-5);
  border-left: 3px solid var(--brand-solid);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  background: var(--surface-2);
  font-size: var(--t-md);
  line-height: 2.1;
}

.ptitle {
  margin: 0 0 var(--s-2);
  font-size: var(--t-md);
  font-weight: 600;
}

.passage p { margin: 0 0 var(--s-2); }
.passage p:last-child { margin-bottom: 0; }

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--s-3);
}

.opt {
  min-height: var(--tap);
  padding: var(--s-3) var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
  transition: border-color var(--dur-fast), background var(--dur-fast), transform var(--dur-fast);
}

.opt:hover:not(:disabled) { border-color: var(--brand-solid); }
.opt:active:not(:disabled) { transform: scale(0.985); }
.opt:disabled { cursor: default; }

.opt.picked { border-color: var(--brand-solid); background: color-mix(in srgb, var(--brand-solid) 10%, transparent); }
.opt.right { border-color: hsl(152 52% 40%); background: color-mix(in srgb, hsl(152 52% 40%) 14%, transparent); }
.opt.wrong { border-color: hsl(4 64% 52%); background: color-mix(in srgb, hsl(4 64% 52%) 12%, transparent); }
</style>
