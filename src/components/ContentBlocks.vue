<script setup lang="ts">
/**
 * 教材區塊的渲染。
 *
 * 教材是結構化資料不是 Markdown，換來的就是這裡：
 * 假名表的每一格都能點擊發音、羅馬字能被全域開關關掉。
 */
import type { ContentBlock, TableBlock, TableCell } from '../core/types'
import { sheetForTable } from '../data/reference'
import { useSettings } from '../composables/useSettings'
import { useSpeech } from '../composables/useSpeech'
import { stripMarkup } from '../core/inline'
import PitchAccent from './PitchAccent.vue'
import InlineText from './InlineText.vue'

const props = defineProps<{
  blocks: ContentBlock[]
  /**
   * 表格底下要不要顯示「速查區也有這張」。
   *
   * 預設關掉：速查頁和它的列印版本身就在速查區，再連一次是繞圈。
   * 課程頁才打開 —— 一個學到一半的人不會知道有速查區，要在他面前提一次。
   */
  linkToReference?: boolean
}>()

/** 這張表在速查區的位置；不在就回傳 undefined，不畫連結。 */
function refOf(block: TableBlock) {
  return props.linkToReference ? sheetForTable(block) : undefined
}

const { settings } = useSettings()
const { speak, supported } = useSpeech()

const clickable = (cell: TableCell) => Boolean(cell.speak)

/** 朗讀時要去掉振り仮名標記，否則會把括號也唸出來 */
const plain = (text: string) => stripMarkup(text)



function say(cell: TableCell) {
  if (cell.speak) speak(cell.speak)
}
</script>

<template>
  <div class="blocks">
    <template v-for="(block, i) in blocks" :key="i">
      <section v-if="block.type === 'note'" class="note">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <p v-for="(p, j) in block.paragraphs" :key="j"><InlineText :text="p" /></p>
      </section>

      <section v-else-if="block.type === 'warning'" class="warn">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <p v-for="(p, j) in block.paragraphs" :key="j"><InlineText :text="p" /></p>
      </section>

      <section v-else-if="block.type === 'table'" class="table-wrap">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <p v-if="supported" class="tip">點任何一個假名可以聽發音。</p>
        <p v-if="refOf(block)" class="ref-note">
          這張表在
          <RouterLink :to="`/ref/${refOf(block)!.category.id}`">
            速查・{{ refOf(block)!.category.title }}
          </RouterLink>
          也有，<RouterLink :to="`/print/ref/${refOf(block)!.category.id}`">可以列印</RouterLink>。
        </p>
        <div class="scroller">
          <table>
            <thead>
              <tr>
                <th
                  v-for="(c, j) in block.columns"
                  :key="j"
                  :class="{ corner: j === 0 && block.rowHeader !== false }"
                >
                  <InlineText :text="c" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, r) in block.rows" :key="r">
                <template v-for="(cell, c) in row" :key="c">
                  <th v-if="c === 0 && block.rowHeader !== false" scope="row">
                    <InlineText :text="cell.text" />
                  </th>
                  <td v-else :class="{ empty: !cell.text }">
                    <button
                      v-if="clickable(cell)"
                      class="kana"
                      :class="{ phrase: block.variant !== 'kana' }"
                      :title="cell.hint"
                      @click="say(cell)"
                    >
                      <span class="glyph"><InlineText :text="cell.text" /></span>
                      <span v-if="settings.romaji && cell.romaji" class="romaji">{{ cell.romaji }}</span>
                      <span v-if="cell.hint" class="hint">{{ cell.hint }}</span>
                    </button>
                    <!--
                      有字但不可點的格子要照樣顯示文字。
                      只有真的空白的格子（や行的 i、e 段）才畫破折號。
                    -->
                    <span v-else-if="cell.text" class="plain"><InlineText :text="cell.text" /></span>
                    <span v-else class="dash" aria-hidden="true">—</span>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else-if="block.type === 'sentences'" class="sentences">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <ul>
          <li v-for="(item, j) in block.items" :key="j">
            <button class="line" :disabled="!supported" @click="speak(plain(item.jp))">
              <InlineText class="jp" :text="item.jp" />
            </button>
            <p class="zh">{{ item.zh }}</p>
            <p v-if="item.note" class="note">{{ item.note }}</p>
          </li>
        </ul>
      </section>

      <section v-else-if="block.type === 'kanji'" class="kanji">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <ul>
          <li v-for="item in block.items" :key="item.char">
            <button class="char" :disabled="!supported" @click="speak(item.char)">
              {{ item.char }}
            </button>
            <div class="body">
              <p class="meaning">{{ item.zh }}</p>
              <p class="readings">
                <span class="tag">音</span>{{ item.on.join('・') }}
                <span class="tag kun">訓</span>{{ item.kun.join('・') }}
              </p>
              <ul class="words">
                <li v-for="wd in item.words" :key="wd.jp">
                  <button :disabled="!supported" @click="speak(wd.jp)">
                    <ruby>{{ wd.jp }}<rt>{{ wd.reading }}</rt></ruby>
                  </button>
                  <span>{{ wd.zh }}</span>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </section>

      <section v-else class="examples">
        <h2 v-if="block.heading"><InlineText :text="block.heading" /></h2>
        <p v-if="block.items.some((i) => i.accent !== undefined)" class="tip">
          字上方的線是高低音，數字是下降的位置。現在不用背，之後會專門教。
        </p>
        <ul>
          <li v-for="(item, j) in block.items" :key="j">
            <!-- 朗讀餵漢字：純假名丟給 TTS，它只會照字典猜一個讀法 -->
            <button class="word" :disabled="!supported" @click="speak(item.kanji ?? item.jp)">
              <!-- 第 3 章起：漢字當主角，讀音標在上面 -->
              <span v-if="block.furigana && item.kanji" class="jp">
                <ruby>{{ item.kanji }}<rt>{{ item.jp }}</rt></ruby>
              </span>
              <PitchAccent
                v-if="block.furigana && item.kanji"
                :word="item.jp"
                :accent="item.accent"
                number-only
              />
              <PitchAccent
                v-else
                class="jp"
                :word="item.jp"
                :accent="item.accent"
                show-number
              />
              <span v-if="settings.romaji && item.romaji" class="romaji">{{ item.romaji }}</span>
            </button>
            <span class="zh">{{ item.zh }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.blocks { display: grid; gap: var(--s-6); }

/* grid 子項預設 min-width:auto，會被 520px 的假名表撐開而把整頁推寬。
   寬內容要自己橫捲，頁面本體不准橫向捲動。 */
.blocks > * { min-width: 0; }

h2 {
  margin: 0 0 var(--s-3);
  font-size: var(--t-lg);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.note p,
.warn p {
  margin: 0 0 var(--s-3);
  font-size: var(--t-md);
  line-height: 1.75;
  color: var(--text-2);
}
.note p:last-child, .warn p:last-child { margin-bottom: 0; }

.warn {
  padding: var(--s-4) var(--s-5);
  border-radius: var(--r-md);
  border-left: 3px solid hsl(38 80% 48%);
  background: color-mix(in srgb, hsl(38 80% 48%) 9%, transparent);
}

.tip { margin: calc(var(--s-3) * -1) 0 var(--s-3); font-size: var(--t-xs); color: var(--muted); }

/* 寬表格自己捲，頁面本體不准橫向捲動 */
.scroller { overflow-x: auto; min-width: 0; }

/* 變音表的格子是「が・ガ」兩套文字並列，比清音表寬。
   但表格本身不准超出容器 —— 超過的部分由 .scroller 橫捲。 */
table { border-collapse: collapse; width: 100%; min-width: 560px; table-layout: auto; }

th, td {
  border: 1px solid var(--edge);
  padding: 0;
  text-align: center;
}

thead th {
  padding: var(--s-2);
  background: var(--surface-2);
  font-size: var(--t-xs);
  font-weight: 600;
  color: var(--muted);
}
thead th.corner { background: transparent; border-color: transparent; }

tbody th {
  width: 60px;
  background: var(--surface-2);
  font-size: var(--t-sm);
  color: var(--text-2);
}

td.empty { background: var(--surface-2); }
.dash { color: var(--trail); }

.plain {
  display: block;
  padding: var(--s-3) var(--s-2);
  font-size: var(--t-sm);
  line-height: 1.6;
  color: var(--text-2);
}

.kana {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-height: 78px;
  padding: var(--s-2) var(--s-1);
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: background var(--dur-fast);
}
.kana:hover { background: color-mix(in srgb, var(--brand-solid) 9%, transparent); }

.glyph {
  font-size: 28px;
  line-height: 1.1;
  /* 「が・ガ」不准從中間斷行，寧可讓表格變寬去捲 */
  white-space: nowrap;
}

/* 整句的格子回到內文字級，而且允許換行 */
.kana.phrase { padding: var(--s-3); }
.kana.phrase .glyph { font-size: var(--t-md); line-height: 2; white-space: normal; }
.romaji { font-size: var(--t-xs); color: var(--muted); font-variant: small-caps; }

.ref-note {
  margin: 0 0 var(--s-2);
  font-size: var(--t-xs);
  color: var(--muted);
}
.ref-note a { color: var(--brand-solid); text-decoration: none; }
.ref-note a:hover { text-decoration: underline; }
.hint { font-size: 11px; color: var(--muted); line-height: 1.3; }

.examples ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: var(--s-2);
}

.examples li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  /* 高低音的線畫在字的上方，這一列要多留一點垂直空間 */
  padding: var(--s-3) var(--s-3) var(--s-2);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
}

.word {
  display: flex;
  align-items: baseline;
  gap: var(--s-2);
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  padding: 0;
  cursor: pointer;
  text-align: left;
}
.word:disabled { cursor: default; }

/* 日文例句放大，這是頁面上最該被看清楚的東西 */
.jp { font-size: var(--t-lg); }
.zh { font-size: var(--t-sm); color: var(--text-2); }

/* ── 例句 ── */
.sentences ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-3); }

.sentences li {
  padding: var(--s-3) var(--s-4);
  border-left: 3px solid var(--edge);
  background: var(--surface);
  border-radius: 0 var(--r-md) var(--r-md) 0;
}

.sentences .line {
  display: block;
  width: 100%;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  padding: 0;
  text-align: left;
  cursor: pointer;
}
.sentences .line:disabled { cursor: default; }
.sentences .jp { font-size: var(--t-lg); }
.sentences .zh { margin: var(--s-1) 0 0; }
.sentences .note { margin: var(--s-2) 0 0; font-size: var(--t-xs); color: var(--muted); }

/* ── 漢字卡 ── */
.kanji > ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-3); }

.kanji > ul > li {
  display: flex;
  gap: var(--s-4);
  padding: var(--s-4);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
}

.char {
  flex: none;
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface-2);
  color: inherit;
  font: inherit;
  font-size: 40px;
  cursor: pointer;
}
.char:disabled { cursor: default; }

.kanji .body { flex: 1; min-width: 0; }
.kanji .meaning { margin: 0 0 var(--s-1); font-weight: 700; }
.kanji .readings { margin: 0 0 var(--s-2); font-size: var(--t-sm); color: var(--text-2); }

.tag {
  display: inline-block;
  margin-right: var(--s-1);
  padding: 0 5px;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--brand-solid) 16%, transparent);
  font-size: 11px;
  font-weight: 700;
}
.tag.kun { margin-left: var(--s-3); background: color-mix(in srgb, hsl(152 52% 40%) 18%, transparent); }

.kanji .words { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); }
.kanji .words li { display: flex; align-items: baseline; gap: var(--s-2); font-size: var(--t-sm); }
.kanji .words button {
  border: 0; background: none; color: inherit; font: inherit; padding: 0; cursor: pointer;
}
.kanji .words button:disabled { cursor: default; }
.kanji .words span { font-size: var(--t-xs); color: var(--muted); }
</style>
