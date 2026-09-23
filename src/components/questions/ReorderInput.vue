<script setup lang="ts">
/**
 * JLPT「句子的組織」（もんだい2）。
 *
 * 作答流程照考試走：點選項填進空格 → 排成通順的句子 → 系統只批 ★ 那一格。
 * 拖曳看起來比較炫，但手機上拖小方塊很難拖準，而且考試本來就是「選號碼」，
 * 點兩下就定位比較接近真正在做的事。
 *
 * 選項不在這裡打散 —— 資料層寫進去的順序就是考卷上印的 1〜4 順序，
 * 打散會讓 explanation 裡提到的號碼對不上。lint 會擋掉「照正解順序排」的題目。
 */
import { computed } from 'vue'
import type { ReorderQuestion } from '../../core/types'
import InlineText from '../InlineText.vue'

const EMPTY = -1

const props = defineProps<{
  question: ReorderQuestion
  answer: number[] | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{ change: [value: number[]] }>()

const slots = computed<number[]>(() => {
  const n = props.question.segments.length
  return props.answer && props.answer.length === n
    ? props.answer
    : Array.from({ length: n }, () => EMPTY)
})

/** 題幹用 ＿＿ 標空格，切開之後每兩段文字中間插一個格子。 */
const parts = computed(() => props.question.prompt.split('＿＿'))

/** 還沒被放進格子的選項 */
const pool = computed(() =>
  props.question.segments
    .map((text, i) => ({ text, i }))
    .filter((s) => !slots.value.includes(s.i)),
)

function place(segIndex: number) {
  if (props.disabled) return
  const next = slots.value.slice()
  const empty = next.indexOf(EMPTY)
  if (empty === -1) return
  next[empty] = segIndex
  emit('change', next)
}

function clear(slotIndex: number) {
  if (props.disabled) return
  const next = slots.value.slice()
  next[slotIndex] = EMPTY
  emit('change', next)
}

const starRight = computed(
  () => slots.value[props.question.starIndex] === props.question.order[props.question.starIndex],
)

/** 訂正用：完整的正確語序。只批星號那格，但該教的句子還是要給。 */
const solution = computed(() =>
  props.question.order.map((i) => props.question.segments[i]).join(' '),
)
</script>

<template>
  <div class="reorder">
    <p class="sentence">
      <template v-for="(part, i) in parts" :key="i">
        <InlineText :text="part" />
        <button
          v-if="i < slots.length"
          class="slot"
          :class="{
            star: i === question.starIndex,
            filled: slots[i] !== EMPTY,
            right: revealed && i === question.starIndex && starRight,
            wrong: revealed && i === question.starIndex && !starRight,
          }"
          :disabled="disabled || slots[i] === EMPTY"
          :aria-label="i === question.starIndex ? '星號空格' : `第 ${i + 1} 個空格`"
          @click="clear(i)"
        >
          <span v-if="i === question.starIndex" class="mark">★</span>
          <InlineText v-if="slots[i] !== EMPTY" :text="question.segments[slots[i]]" />
        </button>
      </template>
    </p>

    <ul class="pool" :class="{ empty: pool.length === 0 }">
      <li v-for="seg in pool" :key="seg.i">
        <button class="chip" :disabled="disabled" @click="place(seg.i)">
          <span class="no">{{ seg.i + 1 }}</span>
          <InlineText :text="seg.text" />
        </button>
      </li>
    </ul>

    <p class="hint">
      把四個選項排成通順的句子，系統只看 <b>★</b> 那一格。點格子可以拿回來。
    </p>

    <p v-if="revealed" class="solution">
      正確語序：<InlineText :text="solution" />
    </p>
  </div>
</template>

<style scoped>
.reorder { display: grid; gap: var(--s-4); }

.sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2) 0;
  font-size: var(--t-lg);
  line-height: 2.2;
}

.slot {
  display: inline-flex;
  align-items: center;
  gap: var(--s-1);
  min-width: 82px;
  min-height: 38px;
  margin: 0 2px;
  padding: 0 var(--s-2);
  border: 1.5px dashed var(--edge);
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
}

.slot.filled { border-style: solid; border-color: var(--brand-solid); }
.slot:disabled { cursor: default; }
.slot.right { border-color: hsl(152 52% 40%); background: color-mix(in srgb, hsl(152 52% 40%) 14%, transparent); }
.slot.wrong { border-color: hsl(4 64% 52%); background: color-mix(in srgb, hsl(4 64% 52%) 12%, transparent); }

.mark { color: var(--brand-solid); font-size: var(--t-sm); }

.pool {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin: 0;
  padding: 0;
  list-style: none;
  min-height: var(--tap);
}

.pool.empty::before {
  content: '四格都填好了';
  color: var(--text-dim);
  font-size: var(--t-sm);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: var(--tap);
  padding: var(--s-2) var(--s-3);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
  transition: border-color var(--dur-fast), transform var(--dur-fast);
}

.chip:hover:not(:disabled) { border-color: var(--brand-solid); }
.chip:active:not(:disabled) { transform: scale(0.97); }
.chip:disabled { cursor: default; opacity: 0.6; }

.no {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: var(--t-xs);
}

.hint, .solution { margin: 0; font-size: var(--t-sm); color: var(--text-dim); }
.solution { padding-top: var(--s-2); border-top: 1px solid var(--edge); color: var(--text); }
</style>
