<script setup lang="ts">
/**
 * 高低アクセント的標記。
 *
 * 資料只存一個數字（重音核位置），線由這裡從數字畫出來 ——
 * 存線就會有「線跟數字對不上」這種永遠查不完的 bug。
 *
 * 畫法是日本教材的標準：高音的拍頂上一條線，下降的地方一個直角。
 * 尾高的直角落在詞的右緣外側，因為降的是後面的助詞而不是詞本身。
 */
import { computed } from 'vue'
import { morae, pitchShape } from '../core/mora'

const props = defineProps<{
  word: string
  accent?: number
  /** 一併顯示辭典式的數字標記 */
  showNumber?: boolean
  /**
   * 只顯示數字，不畫線。
   * 漢字加振り仮名之後再疊一條高低音線，三層資訊擠在同一行會讀不動；
   * 那個情況下數字就是辭典的標準寫法，夠用了。
   */
  numberOnly?: boolean
}>()

const parts = computed(() => {
  const list = morae(props.word)
  if (props.accent === undefined) {
    return list.map((text) => ({ text, high: false, corner: false, plain: true }))
  }

  const { highs, dropAfter } = pitchShape(props.word, props.accent)
  return list.map((text, i) => ({
    text,
    high: highs[i],
    // 這一拍是高音、而且下一拍開始降（或詞已經結束）→ 這裡畫直角
    corner: dropAfter === i,
    plain: false,
  }))
})

const CIRCLED = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨']
const badge = computed(() =>
  props.accent === undefined ? null : (CIRCLED[props.accent] ?? `[${props.accent}]`),
)
</script>

<template>
  <span class="pitch">
    <span v-if="!numberOnly" class="morae">
      <span
        v-for="(p, i) in parts"
        :key="i"
        class="mora"
        :class="{ high: p.high, corner: p.corner, plain: p.plain }"
        >{{ p.text }}</span
      >
    </span>
    <span v-if="(showNumber || numberOnly) && badge" class="badge">{{ badge }}</span>
  </span>
</template>

<style scoped>
.pitch {
  display: inline-flex;
  align-items: baseline;
  gap: var(--s-1);
}

/* 線畫在字的上方，所以這一列一定要留出垂直空間，不能給固定高度 */
.morae {
  display: inline-flex;
  padding-top: 5px;
}

.mora {
  position: relative;
  border-top: 2px solid transparent;
}

.mora.high { border-top-color: var(--brand-solid); }

/* 下降的直角：從線的右端往下一截 */
.mora.corner::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -1px;
  width: 2px;
  height: 7px;
  background: var(--brand-solid);
}

.badge {
  font-size: var(--t-xs);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
</style>
