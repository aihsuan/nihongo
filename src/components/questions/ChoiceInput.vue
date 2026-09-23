<script setup lang="ts">
/**
 * 四選一。選項在顯示前依題目 id 打散 ——
 * 建構器一律把正解放在第一個，不打散的話答案永遠是第一格。
 */
import { computed } from 'vue'
import type { ChoiceQuestion } from '../../core/types'
import { shuffleStable } from '../../core/quiz'
import InlineText from '../InlineText.vue'

const props = defineProps<{
  question: ChoiceQuestion
  answer: number | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{ pick: [index: number] }>()

/** 洗牌後仍要能回推原始索引，判定才對得上 answerIndex */
const shuffled = computed(() =>
  shuffleStable(
    props.question.options.map((text, i) => ({ text, i })),
    props.question.id,
  ),
)

const stateOf = (originalIndex: number) => {
  if (!props.revealed) return props.answer === originalIndex ? 'picked' : ''
  if (originalIndex === props.question.answerIndex) return 'right'
  return props.answer === originalIndex ? 'wrong' : ''
}
</script>

<template>
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
</template>

<style scoped>
.options {
  display: grid;
  /* 兩欄。四個選項排成 3+1 很難看，而中文選項也需要一欄的寬度 */
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
