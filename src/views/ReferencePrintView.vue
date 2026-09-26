<script setup lang="ts">
/**
 * 速查表的列印版。一次印一整類，這才是 cheat sheet 的用法 ——
 * 一張一張印的話，考前桌上會散著七張紙。
 *
 * 兩種版本：
 *   乾淨版 —— 貼牆上、考前掃一遍用
 *   填空版 —— 挖掉讀音自己填，這才是真的在驗收
 * 填空版只挖有標 blankColumns 的表；沒標的照常印（五十音圖挖哪一欄都不成立）。
 *
 * 表格沿用 ContentBlocks，不另寫一套渲染 —— 兩套遲早會長得不一樣。
 * 列印用的白底黑字是在這裡覆蓋的，資料層不必知道自己會被印出來。
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { TableBlock } from '../core/types'
import { findCategory } from '../data/reference'
import type { RefSheet } from '../data/reference'
import ContentBlocks from '../components/ContentBlocks.vue'
import InlineText from '../components/InlineText.vue'

const route = useRoute()
const category = computed(() => findCategory(route.params.category))

const blank = ref(false)

/** 有東西可挖的表才有填空版可言 */
const blankable = computed(
  () => category.value?.sheets.filter((s) => s.blankColumns?.length).length ?? 0,
)

/**
 * 填空的格子填一個全形空白而不是空字串。
 * ContentBlocks 看到真正的空字串會畫一個「—」表示「這裡本來就沒有東西」，
 * 但填空版要的是「這裡留給你寫」—— 印出破折號會讓人以為不用填。
 */
const BLANK = '　'

function forPrint(sheet: RefSheet): TableBlock {
  const table = { ...sheet.table, heading: undefined }
  if (!blank.value || !sheet.blankColumns?.length) return table
  const cols = new Set(sheet.blankColumns)
  return {
    ...table,
    rows: table.rows.map((row) =>
      row.map((cell, i) => (cols.has(i) && cell.text ? { text: BLANK } : cell)),
    ),
  }
}

const print = () => window.print()
</script>

<template>
  <div v-if="category" class="sheet-page">
    <div class="toolbar">
      <RouterLink class="back" :to="`/ref/${category.id}`">← 回到速查</RouterLink>
      <p class="hint">
        列印對話框裡選「另存為 PDF」就能存成檔案。
        <template v-if="blank && blankable < category.sheets.length">
          填空版只挖得動 {{ blankable }} / {{ category.sheets.length }} 張，其餘照常印。
        </template>
      </p>
      <div class="modes">
        <button class="mode" :class="{ on: !blank }" @click="blank = false">乾淨版</button>
        <button
          class="mode"
          :class="{ on: blank }"
          :disabled="blankable === 0"
          :title="blankable === 0 ? '這一類沒有適合挖空的表' : ''"
          @click="blank = true"
        >
          填空版
        </button>
      </div>
      <button class="go" @click="print">列印</button>
    </div>

    <article class="sheet">
      <header class="sheet-head">
        <h1>{{ category.title }}　速查表{{ blank ? '（填空）' : '' }}</h1>
        <p v-if="blank">姓名 ______________　日期 ______________</p>
        <p v-else>{{ category.subtitle }}</p>
      </header>

      <section v-for="sheet in category.sheets" :key="sheet.id" class="block">
        <h2><InlineText :text="sheet.title" /></h2>
        <ContentBlocks :blocks="[forPrint(sheet)]" />
      </section>
    </article>
  </div>

  <p v-else class="missing">找不到這個速查分類。</p>
</template>

<style scoped>
.sheet-page { padding: var(--s-5); }

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-3) var(--s-4);
  max-width: 900px;
  margin: 0 auto var(--s-5);
}

.back { color: var(--brand-solid); text-decoration: none; font-weight: 600; font-size: var(--t-sm); }
.hint { flex: 1; min-width: 200px; margin: 0; font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }

.modes { display: flex; gap: var(--s-1); }

.mode {
  min-height: 34px;
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--text-2);
  font: inherit;
  font-size: var(--t-xs);
  cursor: pointer;
}
.mode.on {
  border-color: var(--brand-solid);
  background: color-mix(in srgb, var(--brand-solid) 12%, transparent);
  color: var(--text);
  font-weight: 600;
}
.mode:disabled { opacity: 0.45; cursor: not-allowed; }

.go {
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

.sheet {
  max-width: 900px;
  margin: 0 auto var(--s-6);
  padding: var(--s-6);
  background: #fff;
  color: #111;
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
}

.sheet-head { margin-bottom: var(--s-4); padding-bottom: var(--s-3); border-bottom: 2px solid #111; }
.sheet-head h1 { margin: 0 0 var(--s-2); font-size: 20px; color: #111; }
.sheet-head p { margin: 0; font-size: 12px; color: #555; }

/* 一張表不要被分頁切成兩半 */
.block { margin-bottom: var(--s-5); break-inside: avoid; }
.block h2 { margin: 0 0 var(--s-2); font-size: 14px; color: #111; }

/*
  ContentBlocks 是照畫面的深色主題做的。列印要白底黑字，
  而且發音按鈕、提示文字在紙上都沒有意義 —— 這裡整批壓掉。
*/
.block :deep(.tip) { display: none; }
.block :deep(.table-wrap h2) { display: none; }
/* 螢幕上寬表格照樣橫捲（助数詞有十欄，手機不捲就會把整頁推寬）。
   紙上才需要 overflow: visible，那段寫在 @media print 裡。 */
.block :deep(.scroller) { overflow-x: auto; }
.block :deep(table) { min-width: 0; width: 100%; border-collapse: collapse; }
.block :deep(th),
.block :deep(td) { border: 1px solid #999; padding: 3px 5px; color: #111; background: #fff; }
.block :deep(thead th) { background: #eee; font-size: 11px; }
.block :deep(.kana) {
  border: 0;
  background: none;
  color: #111;
  cursor: default;
  padding: 0;
  font-size: 13px;
}
.block :deep(.kana .hint),
.block :deep(.kana .romaji) { display: none; }
.block :deep(.plain) { color: #111; font-size: 13px; }
.block :deep(.dash) { color: #bbb; }

.missing { color: var(--muted); padding: var(--s-6); text-align: center; }

@media print {
  @page { size: A4 portrait; margin: 10mm; }

  .toolbar { display: none; }
  .sheet-page { padding: 0; }

  .sheet {
    max-width: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  /* 紙上不能有捲軸，整張表都要印出來 */
  .block :deep(.scroller) { overflow: visible; }
}
</style>
