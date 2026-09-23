<script setup lang="ts">
/**
 * 填空：從候選中點選填入，不打字。
 * 使用者的電腦不一定裝了日文輸入法，要求打字會直接卡死初學者。
 */
import { computed } from 'vue'
import type { FillQuestion } from '../../core/types'
import { shuffleStable } from '../../core/quiz'
import InlineText from '../InlineText.vue'

const props = defineProps<{
  question: FillQuestion
  answer: string[] | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{ change: [value: string[]] }>()

const bank = computed(() => shuffleStable(props.question.bank, `${props.question.id}-b`))

const filled = computed(() => props.answer ?? [])

/** 題幹以 ___ 標示空格，拆成「文字段」與「空格」交錯 */
const parts = computed(() => props.question.prompt.split('___'))

function place(token: string) {
  if (props.disabled) return
  const next = filled.value.slice()
  const slot = next.findIndex((v) => !v)
  const index = slot === -1 ? next.length : slot
  if (index >= props.question.answers.length) return
  next[index] = token
  emit('change', next)
}

function clear(index: number) {
  if (props.disabled) return
  const next = filled.value.slice()
  next[index] = ''
  emit('change', next)
}

const slotState = (i: number) => {
  if (!props.revealed) return filled.value[i] ? 'filled' : ''
  return filled.value[i] === props.question.answers[i] ? 'right' : 'wrong'
}
</script>

<template>
  <div class="fill">
    <p class="sentence">
      <template v-for="(part, i) in parts" :key="i">
        <span><InlineText :text="part" /></span>
        <button
          v-if="i < parts.length - 1"
          class="slot"
          :class="slotState(i)"
          :disabled="disabled"
          @click="clear(i)"
        >
          {{ filled[i] || '　' }}
        </button>
      </template>
    </p>

    <div class="bank">
      <button
        v-for="token in bank"
        :key="token"
        class="token"
        :disabled="disabled || filled.includes(token)"
        @click="place(token)"
      >
        <InlineText :text="token" />
      </button>
    </div>

    <p v-if="revealed && filled.join('') !== question.answers.join('')" class="correct">
      正解：{{ question.answers.join('') }}
    </p>
  </div>
</template>

<style scoped>
.sentence {
  margin: 0 0 var(--s-4);
  font-size: var(--t-xl);
  line-height: 1.8;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}

.slot {
  min-width: 2.2em;
  min-height: 1.6em;
  padding: 0 var(--s-2);
  border: 0;
  border-bottom: 2.5px solid var(--trail);
  border-radius: var(--r-sm) var(--r-sm) 0 0;
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: inherit;
  cursor: pointer;
}

.slot.filled { border-bottom-color: var(--brand-solid); }
.slot.right { border-bottom-color: hsl(152 52% 40%); background: color-mix(in srgb, hsl(152 52% 40%) 14%, transparent); }
.slot.wrong { border-bottom-color: hsl(4 64% 52%); background: color-mix(in srgb, hsl(4 64% 52%) 12%, transparent); }

.bank { display: flex; flex-wrap: wrap; gap: var(--s-2); }

.token {
  min-width: var(--tap);
  min-height: var(--tap);
  padding: var(--s-2) var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-lg);
  cursor: pointer;
  transition: border-color var(--dur-fast), opacity var(--dur-fast);
}

.token:hover:not(:disabled) { border-color: var(--brand-solid); }
.token:disabled { opacity: 0.35; cursor: default; }

.correct { margin: var(--s-3) 0 0; font-size: var(--t-sm); color: var(--text-2); }
</style>
