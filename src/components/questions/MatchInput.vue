<script setup lang="ts">
/**
 * 配對：先點左欄一項，再點右欄一項就配起來。
 * 不用拖放 —— 拖放在觸控螢幕上跟捲動手勢會打架。
 */
import { computed, ref, watch } from 'vue'
import type { MatchQuestion } from '../../core/types'
import { shuffleStable } from '../../core/quiz'
import InlineText from '../InlineText.vue'

const props = defineProps<{
  question: MatchQuestion
  answer: Record<string, string> | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{
  change: [value: Record<string, string>]
  speak: [text: string]
}>()

const active = ref<string | null>(null)

watch(() => props.question.id, () => { active.value = null })

const rights = computed(() =>
  shuffleStable(props.question.pairs.map((p) => p.right), `${props.question.id}-r`),
)

const current = computed(() => props.answer ?? {})

/** 右欄某一項已經被誰配走了 */
const takenBy = (right: string) =>
  Object.keys(current.value).find((left) => current.value[left] === right)

function clickLeft(left: string) {
  if (props.disabled) return
  const pair = props.question.pairs.find((p) => p.left === left)
  if (pair?.speak) emit('speak', pair.speak)

  // 再點一次已配對的左項＝解除配對
  if (current.value[left]) {
    const next = { ...current.value }
    delete next[left]
    emit('change', next)
    active.value = left
    return
  }
  active.value = active.value === left ? null : left
}

function clickRight(right: string) {
  if (props.disabled) return
  const owner = takenBy(right)
  const next = { ...current.value }

  if (owner) {
    delete next[owner]
    emit('change', next)
    return
  }
  if (!active.value) return

  next[active.value] = right
  emit('change', next)
  active.value = null
}

const leftState = (left: string) => {
  if (props.revealed) {
    const correct = props.question.pairs.find((p) => p.left === left)?.right
    return current.value[left] === correct ? 'right' : 'wrong'
  }
  if (active.value === left) return 'active'
  return current.value[left] ? 'paired' : ''
}
</script>

<template>
  <div class="match">
    <ul class="col">
      <li v-for="p in question.pairs" :key="p.left">
        <button class="cell jp" :class="leftState(p.left)" :disabled="disabled" @click="clickLeft(p.left)">
          <span class="text"><InlineText :text="p.left" /></span>
          <span v-if="current[p.left]" class="echo">{{ current[p.left] }}</span>
        </button>
      </li>
    </ul>

    <ul class="col">
      <li v-for="right in rights" :key="right">
        <button
          class="cell"
          :class="{ used: Boolean(takenBy(right)) }"
          :disabled="disabled"
          @click="clickRight(right)"
        >
          <InlineText :text="right" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.match {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-3);
}

.col { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); }

.cell {
  width: 100%;
  /* ruby 與兩行文字都可能出現，不給固定高度 */
  min-height: var(--tap);
  padding: var(--s-2) var(--s-3);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-2);
  transition: border-color var(--dur-fast), background var(--dur-fast);
}

.cell.jp .text { font-size: var(--t-lg); }

.cell:hover:not(:disabled) { border-color: var(--brand-solid); }
.cell:disabled { cursor: default; }

.cell.active { border-color: var(--brand-solid); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-solid) 22%, transparent); }
.cell.paired, .cell.used { background: var(--surface-2); color: var(--text-2); }
.cell.right { border-color: hsl(152 52% 40%); background: color-mix(in srgb, hsl(152 52% 40%) 14%, transparent); }
.cell.wrong { border-color: hsl(4 64% 52%); background: color-mix(in srgb, hsl(4 64% 52%) 12%, transparent); }

.echo { font-size: var(--t-xs); color: var(--muted); }
</style>
