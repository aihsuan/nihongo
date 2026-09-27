<script setup lang="ts">
/**
 * 常用漢字 2,136 字。
 *
 * 這不是速查表 —— 2,136 列沒有人「一眼掃過去」，所以它有自己的路由、
 * 有搜尋和篩選，而不是塞進 /ref 底下。速查區的價值在密度，這裡的價值在找得到。
 *
 * 讀音來自 KANJIDIC2（CC BY-SA，見 data/kanji/ATTRIBUTION.md），
 * 中譯是自己寫的、逐步補。**還沒補的字會明講「中譯未補」**，
 * 不是留白裝作沒這回事 —— 缺口看得見，才知道還差多少。
 */
import { computed, ref } from 'vue'
import {
  GRADES,
  GRADE_LABEL,
  KANJIDIC_VERSION,
  filterKanji,
  zhProgress,
  type Reading,
} from '../data/kanji'
import { useSpeech } from '../composables/useSpeech'
import InlineText from '../components/InlineText.vue'

const q = ref('')
const grade = ref<number | undefined>()
const oldJlpt = ref<number | undefined>()
const missingZh = ref(false)

const { speak, supported } = useSpeech()

const progress = zhProgress()

const results = computed(() =>
  filterKanji({ q: q.value, grade: grade.value, oldJlpt: oldJlpt.value, missingZh: missingZh.value }),
)

/** 一次只畫這麼多列。2,136 個 DOM 節點一起塞會讓輸入框打字都卡。 */
const PAGE = 120
const shown = ref(PAGE)
const visible = computed(() => results.value.slice(0, shown.value))

function reset() {
  shown.value = PAGE
}

const toggleGrade = (g: number) => {
  grade.value = grade.value === g ? undefined : g
  reset()
}
const toggleJlpt = (j: number) => {
  oldJlpt.value = oldJlpt.value === j ? undefined : j
  reset()
}

/**
 * 讀音一次最多露幾個。
 *
 * 「生」有 15 個去重後的訓読み，全部印出來就是使用者說的「看不出什麼意思」。
 * 常用的幾乎都排在前面（KANJIDIC 的順序），所以截斷是有效的；
 * 但**截掉的要說有幾個**，不能裝作沒有。
 */
const CAP = 4
const expanded = ref(new Set<string>())
const isOpen = (c: string) => expanded.value.has(c)
function toggleReadings(c: string) {
  const next = new Set(expanded.value)
  next.has(c) ? next.delete(c) : next.add(c)
  expanded.value = next
}
const shownReadings = (list: Reading[], c: string) => (isOpen(c) ? list : list.slice(0, CAP))
</script>

<template>
  <div class="page">
    <header class="head">
      <h1>常用漢字</h1>
      <p class="sub">
        2,136 字．讀音與學年來自 KANJIDIC2．中譯逐步補寫中
      </p>
      <p class="progress">
        中譯已補 <strong>{{ progress.done }}</strong> / {{ progress.total }} 字
        <span class="bygrade">
          <span v-for="g in progress.byGrade" :key="g.grade" :class="{ full: g.done === g.total }">
            {{ GRADE_LABEL[g.grade] }} {{ g.done }}/{{ g.total }}
          </span>
        </span>
      </p>
    </header>

    <div class="controls">
      <input
        v-model="q"
        class="search"
        type="search"
        placeholder="搜尋：漢字、讀音、中文意思、詞"
        @input="reset"
      />

      <div class="chips">
        <span class="chip-label">學年</span>
        <button
          v-for="g in GRADES"
          :key="g"
          class="chip"
          :class="{ on: grade === g }"
          @click="toggleGrade(g)"
        >
          {{ GRADE_LABEL[g] }}
        </button>
      </div>

      <div class="chips">
        <span class="chip-label">
          舊制 JLPT
          <em class="why">2010 年改制前的級別；現行 N1–N5 官方沒有漢字表</em>
        </span>
        <button
          v-for="j in [4, 3, 2, 1]"
          :key="j"
          class="chip"
          :class="{ on: oldJlpt === j }"
          @click="toggleJlpt(j)"
        >
          {{ j }} 級
        </button>
        <label class="toggle">
          <input v-model="missingZh" type="checkbox" @change="reset" />
          只看中譯未補
        </label>
      </div>
    </div>

    <p class="count">{{ results.length }} 字</p>

    <ul class="grid">
      <li v-for="k in visible" :key="k.char" class="card" :class="{ nozh: !k.zh }">
        <div class="glyph-row">
          <button
            v-if="supported"
            class="glyph"
            :title="`唸出 ${k.char}`"
            @click="speak(k.words?.[0]?.reading ?? k.kun[0]?.full ?? k.on[0]?.full ?? k.char)"
          >
            {{ k.char }}
          </button>
          <span v-else class="glyph">{{ k.char }}</span>
          <span class="tags">
            <span class="tag">{{ GRADE_LABEL[k.grade] }}</span>
            <span v-if="k.oldJlpt" class="tag">舊 {{ k.oldJlpt }} 級</span>
            <span class="tag dim">{{ k.strokes }} 畫</span>
          </span>
        </div>

        <!--
          不印「中文字義」那一行。
          大字已經是那個漢字了，底下再寫一次「年 → 年」是重複；
          而字有多少意思，用例自己會講（生 → 学生・生きる・生まれる・生なま）。
          zh 欄位還留在資料裡供搜尋用，只是不佔畫面。
        -->
        <p v-if="!k.words" class="todo">中譯未補</p>

        <ul v-else class="words">
          <li v-for="w in k.words" :key="w.jp">
            <button v-if="supported" class="wjp" :title="`唸出 ${w.reading}`" @click="speak(w.reading)">
              <InlineText :text="w.jp" />
            </button>
            <span v-else class="wjp"><InlineText :text="w.jp" /></span>
            <span class="wzh">{{ w.zh }}</span>
          </li>
        </ul>

        <div class="readings">
          <!--
            音読み印片假名（辭典慣例，它本來就不單獨成詞）；
            訓読み印**寫出來的樣子**：生{い}きる 而不是いきる。
            只給讀音等於只講了一半 —— 還要知道漢字佔哪幾個字、送り仮名從哪開始。
          -->
          <div class="rrow">
            <span class="rlabel">音</span>
            <span v-if="k.on.length === 0" class="rnone">—</span>
            <span v-else class="rlist">
              <button
                v-for="x in shownReadings(k.on, k.char)"
                :key="x.full"
                class="reading"
                :title="`唸出 ${x.full}`"
                @click="speak(x.full)"
              >
                {{ x.full }}
              </button>
              <button v-if="k.on.length > CAP" class="more-r" @click="toggleReadings(k.char)">
                {{ isOpen(k.char) ? '收起' : `＋${k.on.length - CAP}` }}
              </button>
            </span>
          </div>

          <div class="rrow">
            <span class="rlabel">訓</span>
            <span v-if="k.kun.length === 0" class="rnone">—</span>
            <span v-else class="rlist">
              <button
                v-for="x in shownReadings(k.kun, k.char)"
                :key="x.full"
                class="reading kunr"
                :title="`唸出 ${x.full}`"
                @click="speak(x.full)"
              >
                <span v-if="x.suffixOnly" class="fix">〜</span>
                <InlineText :text="x.written" />
                <span v-if="x.prefixOnly" class="fix">〜</span>
              </button>
              <button v-if="k.kun.length > CAP" class="more-r" @click="toggleReadings(k.char)">
                {{ isOpen(k.char) ? '收起' : `＋${k.kun.length - CAP}` }}
              </button>
            </span>
          </div>
        </div>
      </li>
    </ul>

    <button v-if="shown < results.length" class="more" @click="shown += PAGE">
      再看 {{ Math.min(PAGE, results.length - shown) }} 字（還有 {{ results.length - shown }}）
    </button>

    <p v-if="results.length === 0" class="empty">沒有符合的字。</p>

    <footer class="foot">
      讀音、學年、筆畫與舊制級別來自
      <a href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project" target="_blank" rel="noopener">
        KANJIDIC2
      </a>
      （EDRDG，CC BY-SA 4.0），資料庫版本 {{ KANJIDIC_VERSION }}。中文翻譯與代表詞為本站自寫。
    </footer>
  </div>
</template>

<style scoped>
.page { max-width: 980px; margin: 0 auto; }

.head { margin-bottom: var(--s-5); }
h1 { margin: 0 0 var(--s-1); font-size: 32px; }
.sub { margin: 0 0 var(--s-2); color: var(--text-2); font-size: var(--t-md); }

.progress { margin: 0; font-size: var(--t-xs); color: var(--muted); }
.progress strong { color: var(--text); font-variant-numeric: tabular-nums; }
.bygrade { display: inline-flex; flex-wrap: wrap; gap: var(--s-3); margin-left: var(--s-3); }
.bygrade .full { color: hsl(152 52% 45%); }

.controls { display: grid; gap: var(--s-3); margin-bottom: var(--s-4); }

.search {
  width: 100%;
  min-height: var(--tap);
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
}
.search:focus { outline: none; border-color: var(--brand-solid); }

.chips { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2); }
.chip-label { font-size: var(--t-xs); color: var(--muted); margin-right: var(--s-1); }
.why { display: block; font-style: normal; font-size: 10px; opacity: 0.8; }

.chip {
  min-height: 32px;
  padding: 0 var(--s-3);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--text-2);
  font: inherit;
  font-size: var(--t-xs);
  cursor: pointer;
}
.chip:hover { border-color: var(--brand-solid); }
.chip.on {
  border-color: var(--brand-solid);
  background: color-mix(in srgb, var(--brand-solid) 14%, transparent);
  color: var(--text);
  font-weight: 600;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  font-size: var(--t-xs);
  color: var(--text-2);
  cursor: pointer;
}

.count { margin: 0 0 var(--s-3); font-size: var(--t-xs); color: var(--muted); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: var(--s-3);
  margin: 0 0 var(--s-4);
  padding: 0;
  list-style: none;
}

.card {
  padding: var(--s-4);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  min-width: 0;
}
.card.nozh { border-style: dashed; }

.glyph-row { display: flex; align-items: center; gap: var(--s-3); margin-bottom: var(--s-2); }

.glyph {
  border: 0;
  background: none;
  padding: 0;
  color: var(--text);
  font-size: 40px;
  line-height: 1;
  cursor: pointer;
}
button.glyph:hover { color: var(--brand-solid); }

.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag {
  padding: 1px 6px;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 10px;
}
.tag.dim { color: var(--muted); }

.todo { margin: 0 0 var(--s-3); color: var(--muted); font-size: var(--t-xs); }

/* 用例：一行一個詞，左邊日文（含振り仮名）右邊中譯 */
.words { margin: 0 0 var(--s-3); padding: 0; list-style: none; display: grid; gap: 3px; }

.words li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  font-size: var(--t-sm);
  line-height: 2;
}

.wjp {
  border: 0;
  background: none;
  padding: 0;
  color: var(--text);
  font: inherit;
  font-size: var(--t-sm);
  text-align: left;
  cursor: pointer;
}
button.wjp:hover { color: var(--brand-solid); }
.wzh { flex: none; color: var(--muted); font-size: var(--t-xs); }

/* 讀音退到最下面，而且每一個都可以點來唸 */
.readings {
  display: grid;
  gap: 3px;
  padding-top: var(--s-2);
  border-top: 1px solid var(--edge);
  font-size: var(--t-xs);
}
.rrow { display: flex; align-items: baseline; gap: var(--s-2); }
.rlabel { flex: none; width: 14px; color: var(--muted); }
.rnone { color: var(--muted); }
.rlist { display: flex; flex-wrap: wrap; gap: 4px; }

.reading {
  border: 0;
  border-radius: var(--r-sm);
  background: var(--surface-2);
  padding: 1px 5px;
  color: var(--text-2);
  font: inherit;
  font-size: var(--t-xs);
  cursor: pointer;
}
.reading:hover { color: var(--text); }

/* 訓読み那排裡面有 ruby，行高要留得開一點，不然注音會疊到上一行 */
.kunr { line-height: 2.2; padding: 0 6px; }
.fix { opacity: 0.5; }

.more-r {
  border: 0;
  background: none;
  padding: 1px 3px;
  color: var(--brand-solid);
  font: inherit;
  font-size: var(--t-xs);
  cursor: pointer;
}

.more {
  display: block;
  width: 100%;
  min-height: var(--tap);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text-2);
  font: inherit;
  font-size: var(--t-sm);
  cursor: pointer;
}
.more:hover { border-color: var(--brand-solid); color: var(--text); }

.empty { color: var(--muted); text-align: center; padding: var(--s-6); }

.foot {
  margin: var(--s-6) 0 0;
  padding-top: var(--s-4);
  border-top: 1px solid var(--edge);
  font-size: var(--t-xs);
  color: var(--muted);
  line-height: 1.8;
}
.foot a { color: var(--brand-solid); }
</style>
