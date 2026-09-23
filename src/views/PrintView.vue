<script setup lang="ts">
/**
 * 可列印的手寫練習紙。兩頁一組：第一頁描紅、第二頁聽寫。
 *
 * 描紅只練手，聽寫才驗收 —— ㄅㄆㄇ練習紙真正讓人記住的是默寫那一頁。
 *
 * 不產 .docx 也不產 PDF：方格加淡灰描紅本質上是排版問題，CSS 做得最好，
 * 而「我要一個檔案」用列印對話框的「另存 PDF」就解決了。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findPrintSet } from '../data/levels'

const route = useRoute()
const found = computed(() => findPrintSet(String(route.params.printId)))

const TRACE = 3
const BLANK = 7

const cells = Array.from({ length: TRACE + BLANK }, (_, i) => i)

function print() {
  window.print()
}
</script>

<template>
  <div v-if="found" class="sheet-page">
    <div class="toolbar">
      <RouterLink class="back" :to="`/n5/${found.chapter.order}/${found.chapter.lessons.indexOf(found.lesson) + 1}`">
        ← 回到課程
      </RouterLink>
      <p class="hint">
        兩頁一組：第一頁描紅、第二頁默寫。列印對話框裡選「另存為 PDF」就能存成檔案。
      </p>
      <button @click="print">列印</button>
    </div>

    <article class="sheet">
      <header class="sheet-head">
        <h1>{{ found.set.title }}</h1>
        <p>描紅練習　　姓名 ______________　日期 ______________</p>
      </header>

      <div class="rows">
        <div v-for="k in found.set.kana" :key="`t-${k.char}`" class="row">
          <div class="label">
            <span class="glyph">{{ k.char }}</span>
            <span class="romaji">{{ k.romaji }}</span>
          </div>
          <div v-for="i in cells" :key="i" class="box">
            <span v-if="i < TRACE" class="trace">{{ k.char }}</span>
          </div>
        </div>
      </div>
    </article>

    <article class="sheet break">
      <header class="sheet-head">
        <h1>{{ found.set.title }}</h1>
        <p>默寫練習：看羅馬字，自己寫出假名　　姓名 ______________　日期 ______________</p>
      </header>

      <div class="rows">
        <div v-for="k in found.set.kana" :key="`d-${k.char}`" class="row">
          <div class="label">
            <span class="romaji big">{{ k.romaji }}</span>
          </div>
          <div v-for="i in cells" :key="i" class="box" />
        </div>
      </div>
    </article>
  </div>

  <p v-else class="missing">找不到這份練習紙。</p>
</template>

<style scoped>
.sheet-page { padding: var(--s-5); }

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-4);
  max-width: 820px;
  margin: 0 auto var(--s-5);
}

.back { color: var(--brand-solid); text-decoration: none; font-weight: 600; font-size: var(--t-sm); }
.hint { flex: 1; min-width: 200px; margin: 0; font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }

button {
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
  /* 一行十格加上字頭最少也要 480px；小螢幕上讓這張紙自己橫捲，
     不要把整個頁面推寬。列印時當然要恢復成完整可見。 */
  overflow-x: auto;
  max-width: 820px;
  margin: 0 auto var(--s-6);
  padding: var(--s-6);
  background: #fff;
  color: #111;
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
}

.sheet-head { margin-bottom: var(--s-5); }
.sheet-head h1 { margin: 0 0 var(--s-2); font-size: 20px; color: #111; }
.sheet-head p { margin: 0; font-size: 12px; color: #555; }

.rows { display: grid; gap: 4px; }

.row { display: flex; gap: 4px; align-items: stretch; }

.label {
  flex: none;
  width: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px solid #111;
  padding-right: 4px;
}

.label .glyph { font-size: 22px; line-height: 1.1; }
.label .romaji { font-size: 10px; color: #666; font-variant: small-caps; }
.label .romaji.big { font-size: 16px; color: #111; }

/* 田字格：淡灰的十字輔助線，跟ㄅㄆㄇ練習紙同一個道理 */
.box {
  flex: 1;
  aspect-ratio: 1;
  min-height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid #bbb;
  background-image:
    linear-gradient(to right, transparent calc(50% - 0.5px), #e4e4e4 calc(50% - 0.5px), #e4e4e4 calc(50% + 0.5px), transparent calc(50% + 0.5px)),
    linear-gradient(to bottom, transparent calc(50% - 0.5px), #e4e4e4 calc(50% - 0.5px), #e4e4e4 calc(50% + 0.5px), transparent calc(50% + 0.5px));
}

.trace { font-size: 26px; color: #d3d3d3; }

.missing { color: var(--muted); padding: var(--s-6); text-align: center; }

@media print {
  @page { size: A4 portrait; margin: 12mm; }

  .toolbar { display: none; }
  .sheet-page { padding: 0; }

  .sheet {
    max-width: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .sheet { overflow: visible; }
  .sheet.break { break-before: page; }

  .box { min-height: 0; }
}
</style>
