<script setup lang="ts">
/**
 * 平假名・片假名對照練習紙。
 *
 * 和課程裡那份（PrintView）的差別是**兩種字一起練**：
 * 同一列左邊寫ひらがな、右邊寫カタカナ，中間用羅馬字串起來。
 * 分開練的話，あ 和 ア 在腦裡會變成兩個不相干的符號 ——
 * 但它們是同一個音，配對記才是對的。
 *
 * 一樣是兩段：先描紅、再默寫。描紅只練手，默寫才驗收。
 * 不產 PDF —— 列印對話框的「另存為 PDF」就解決了，自己做只會做得更差。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { KANA, VOICED, YOUON } from '../data/n5/kana'

const route = useRoute()

const SCOPES = {
  seion: { title: '清音 46', source: KANA },
  dakuon: { title: '濁音・半濁音 25', source: VOICED },
  youon: { title: '拗音 33', source: YOUON },
  all: { title: '全部 104 音', source: [...KANA, ...VOICED, ...YOUON] },
} as const

type ScopeId = keyof typeof SCOPES

const scope = computed<ScopeId | null>(() => {
  const id = String(route.params.scope ?? 'seion')
  return id in SCOPES ? (id as ScopeId) : null
})

const rows = computed(() => (scope.value ? SCOPES[scope.value].source : []))
const title = computed(() => (scope.value ? SCOPES[scope.value].title : ''))

/** 每種字形：前 2 格描紅、後 3 格自己寫。一列共 10 格，剛好排得下 A4。 */
const TRACE = 2
const PER_SCRIPT = 5
const cells = Array.from({ length: PER_SCRIPT }, (_, i) => i)

const print = () => window.print()
</script>

<template>
  <div v-if="scope" class="sheet-page">
    <div class="toolbar">
      <RouterLink class="back" to="/ref/kana">← 回到速查</RouterLink>
      <p class="hint">
        兩頁一組：第一頁描紅、第二頁看羅馬字默寫兩種字形。
        列印對話框裡選「另存為 PDF」就能存成檔案。
      </p>
      <nav class="scopes">
        <RouterLink
          v-for="(s, id) in SCOPES"
          :key="id"
          :to="`/print/kana/${id}`"
          class="scope"
          :class="{ on: id === scope }"
        >
          {{ s.title }}
        </RouterLink>
      </nav>
      <button @click="print">列印</button>
    </div>

    <article class="sheet">
      <header class="sheet-head">
        <h1>平假名・片假名　{{ title }}　描紅練習</h1>
        <p>左邊ひらがな、右邊カタカナ　　姓名 ______________　日期 ______________</p>
      </header>

      <div class="rows">
        <div class="row head-row">
          <div class="label"><span class="romaji">羅馬字</span></div>
          <div class="half"><span class="cap">ひらがな</span></div>
          <div class="half"><span class="cap">カタカナ</span></div>
        </div>
        <div v-for="k in rows" :key="`t-${k.hira}`" class="row">
          <div class="label"><span class="romaji big">{{ k.romaji }}</span></div>
          <div class="half">
            <div v-for="i in cells" :key="`h${i}`" class="box">
              <span v-if="i < TRACE" class="trace">{{ k.hira }}</span>
            </div>
          </div>
          <div class="half">
            <div v-for="i in cells" :key="`k${i}`" class="box">
              <span v-if="i < TRACE" class="trace">{{ k.kata }}</span>
            </div>
          </div>
        </div>
      </div>
    </article>

    <article class="sheet break">
      <header class="sheet-head">
        <h1>平假名・片假名　{{ title }}　默寫練習</h1>
        <p>看羅馬字，左右各寫出兩種字形　　姓名 ______________　日期 ______________</p>
      </header>

      <div class="rows">
        <div class="row head-row">
          <div class="label"><span class="romaji">羅馬字</span></div>
          <div class="half"><span class="cap">ひらがな</span></div>
          <div class="half"><span class="cap">カタカナ</span></div>
        </div>
        <div v-for="k in rows" :key="`d-${k.hira}`" class="row">
          <div class="label"><span class="romaji big">{{ k.romaji }}</span></div>
          <div class="half"><div v-for="i in cells" :key="`dh${i}`" class="box" /></div>
          <div class="half"><div v-for="i in cells" :key="`dk${i}`" class="box" /></div>
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
  gap: var(--s-3) var(--s-4);
  max-width: 900px;
  margin: 0 auto var(--s-5);
}

.back { color: var(--brand-solid); text-decoration: none; font-weight: 600; font-size: var(--t-sm); }
.hint { flex: 1; min-width: 200px; margin: 0; font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }

.scopes { display: flex; flex-wrap: wrap; gap: var(--s-2); }

.scope {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 var(--s-3);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-pill);
  color: var(--text-2);
  font-size: var(--t-xs);
  text-decoration: none;
}
.scope:hover { border-color: var(--brand-solid); color: var(--text); }
.scope.on {
  border-color: var(--brand-solid);
  background: color-mix(in srgb, var(--brand-solid) 12%, transparent);
  color: var(--text);
  font-weight: 600;
}

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
  /* 一列十格加字頭，小螢幕上讓這張紙自己橫捲，不要把整頁推寬 */
  overflow-x: auto;
  max-width: 900px;
  margin: 0 auto var(--s-6);
  padding: var(--s-6);
  background: #fff;
  color: #111;
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
}

.sheet-head { margin-bottom: var(--s-4); }
.sheet-head h1 { margin: 0 0 var(--s-2); font-size: 19px; color: #111; }
.sheet-head p { margin: 0; font-size: 12px; color: #555; }

.rows { display: grid; gap: 4px; min-width: 560px; }

/* 一列不要被分頁切成兩半 —— 上半在這頁、下半在下一頁是最難用的練習紙 */
.row { display: flex; gap: 8px; align-items: stretch; break-inside: avoid; }

.label {
  flex: none;
  width: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 2px solid #111;
  padding-right: 4px;
}

.label .romaji { font-size: 10px; color: #666; font-variant: small-caps; }
.label .romaji.big { font-size: 15px; color: #111; }

.half { flex: 1; display: flex; gap: 4px; }

.head-row { border-bottom: 1px solid #111; padding-bottom: 2px; }
.head-row .half { justify-content: center; }
.cap { font-size: 11px; color: #555; letter-spacing: 0.08em; }

/* 田字格：淡灰十字輔助線，跟ㄅㄆㄇ練習紙同一個道理 */
.box {
  flex: 1;
  aspect-ratio: 1;
  min-height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid #bbb;
  background-image:
    linear-gradient(to right, transparent calc(50% - 0.5px), #e4e4e4 calc(50% - 0.5px), #e4e4e4 calc(50% + 0.5px), transparent calc(50% + 0.5px)),
    linear-gradient(to bottom, transparent calc(50% - 0.5px), #e4e4e4 calc(50% - 0.5px), #e4e4e4 calc(50% + 0.5px), transparent calc(50% + 0.5px));
}

.trace { font-size: 23px; color: #d3d3d3; }

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
    overflow: visible;
  }

  .sheet.break { break-before: page; }
  .rows { min-width: 0; }
  .box { min-height: 0; }
}
</style>
