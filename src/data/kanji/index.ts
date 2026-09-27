/**
 * 漢字表。把產生的讀音資料（dict.ts）和手寫的中譯（zh.ts）合起來。
 *
 * 這一份**不要被主 bundle 靜態引用** —— 2,136 字約 113 KB，
 * 只有 /kanji 那個畫面用得到，讓 Vite 把它切進那條路由的 chunk 裡。
 * 課程和速查區都不碰它。
 */
import { readingOf, stripMarkup } from '../../core/inline'
import { KANJI_ROWS, KANJIDIC_VERSION } from './dict'
import { KANJI_ZH } from './zh'

export { KANJIDIC_VERSION }

export interface KanjiEntry {
  char: string
  /** 1-6 是教育漢字的學年，8 是中學以上。文部科學省的官方分級。 */
  grade: number
  strokes: number
  /** 常用頻度排序；0 表示不在頻度表內 */
  freq: number
  /**
   * 2010 年改制前的《出題基準》級別：4 最簡單、1 最難，0 表示沒有級別。
   *
   * **不換算成 N1〜N5。** JLPT 自 2010 年起不公布漢字表，
   * 市面上的「N3 漢字」清單全是各家自己畫的線。與其給一個看起來確定
   * 其實是猜的數字，不如照實呈現舊制級別並標明它是舊制。
   */
  oldJlpt: number
  on: Reading[]
  kun: Reading[]
  /** 中文字義。還沒補的字沒有這個欄位 —— 缺口要看得見，不要用空字串蓋過去。 */
  zh?: string
  /** 2〜4 個用例，刻意挑不同用法（音読み的詞 ＋ 訓読み的詞）。 */
  words?: KanjiWord[]
}

export interface KanjiWord {
  /** 含振り仮名標記，例如 `安{やす}い` */
  jp: string
  /** 由 jp 推導，不另存 —— 存兩份遲早會對不上 */
  reading: string
  zh: string
}

/**
 * 一個讀音。
 *
 * KANJIDIC 用 `い.きる` 表示「漢字唸い、きる是送り仮名」，
 * `なま-` 和 `-う` 則標出它只出現在詞頭或詞尾。
 * 原樣印出來是一串沒人看得懂的記號，所以拆開存，畫面自己決定怎麼呈現。
 */
export interface Reading {
  /** 漢字本身的讀音，例如 い */
  stem: string
  /** 送り仮名，例如 きる；沒有就是空字串 */
  okuri: string
  /** 完整讀音（stem + okuri），拿去餵 TTS 用 */
  full: string
  /**
   * 實際寫出來的樣子，含振り仮名標記，例如 `生{い}きる`。
   *
   * 只印讀音（いきる）是不夠的 —— 那是「怎麼唸」，不是「怎麼寫」。
   * 學習者要知道的是這個訓読み對應到 **生きる** 這個寫法，
   * 漢字佔哪幾個字、送り仮名從哪裡開始。
   */
  written: string
  /** 這個讀法只出現在詞尾（KANJIDIC 的前置 `-`） */
  suffixOnly: boolean
  /** 這個讀法只出現在詞頭（KANJIDIC 的後置 `-`） */
  prefixOnly: boolean
}

/**
 * 解析 KANJIDIC 的讀音記號，並把同一個讀音的變體去重。
 *
 * 「生」有 18 個訓読み，其中 う.まれる／うま.れる／う.まれ／うまれ 其實只是
 * 同一個讀音的不同標法。不去重的話畫面上會出現一整排看起來一樣的東西，
 * 而那正是使用者說「看不出什麼意思」的原因。
 */
function parseReadings(raw: string, char: string): Reading[] {
  const out: Reading[] = []
  const seen = new Set<string>()
  for (const item of raw ? raw.split('・') : []) {
    const suffixOnly = item.startsWith('-')
    const prefixOnly = item.endsWith('-')
    const body = item.replace(/^-/, '').replace(/-$/, '')
    const dot = body.indexOf('.')
    const stem = dot === -1 ? body : body.slice(0, dot)
    const okuri = dot === -1 ? '' : body.slice(dot + 1)
    const full = stem + okuri
    if (!full || seen.has(full)) continue
    seen.add(full)
    out.push({ stem, okuri, full, written: `${char}{${stem}}${okuri}`, suffixOnly, prefixOnly })
  }
  return out
}

export const KANJI_ALL: KanjiEntry[] = KANJI_ROWS.map(
  ([char, grade, strokes, freq, oldJlpt, on, kun]) => {
    const zh = KANJI_ZH[char]
    return {
      char,
      grade,
      strokes,
      freq,
      oldJlpt,
      on: parseReadings(on, char),
      kun: parseReadings(kun, char),
      ...(zh
        ? {
            zh: zh[0],
            words: zh[1].map(([jp, wzh]) => ({
              jp,
              reading: readingOf(jp),
              zh: wzh,
            })),
          }
        : {}),
    }
  },
)

/** 學年的顯示名稱。8 不是「八年級」，是「中學以上」。 */
export const GRADE_LABEL: Record<number, string> = {
  1: '小一',
  2: '小二',
  3: '小三',
  4: '小四',
  5: '小五',
  6: '小六',
  8: '中學以上',
}

export const GRADES = [1, 2, 3, 4, 5, 6, 8]

export interface KanjiFilter {
  /** 比對字本身、音読み、訓読み、中譯、代表詞 */
  q?: string
  grade?: number
  oldJlpt?: number
  /** 只看還沒補中譯的 */
  missingZh?: boolean
}

export function filterKanji(f: KanjiFilter): KanjiEntry[] {
  const q = f.q?.trim()
  return KANJI_ALL.filter((k) => {
    if (f.grade && k.grade !== f.grade) return false
    if (f.oldJlpt && k.oldJlpt !== f.oldJlpt) return false
    if (f.missingZh && k.zh) return false
    if (!q) return true
    return (
      k.char.includes(q) ||
      k.on.some((r) => r.full.includes(q)) ||
      k.kun.some((r) => r.full.includes(q)) ||
      (k.zh?.includes(q) ?? false) ||
      (k.words?.some(
        (w) => stripMarkup(w.jp).includes(q) || w.reading.includes(q) || w.zh.includes(q),
      ) ?? false)
    )
  })
}

/** 中譯補到哪裡了。缺口要能被量出來，不然「慢慢補」會變成「沒有人知道還差多少」。 */
export function zhProgress() {
  const done = KANJI_ALL.filter((k) => k.zh).length
  const byGrade = GRADES.map((g) => {
    const all = KANJI_ALL.filter((k) => k.grade === g)
    return { grade: g, total: all.length, done: all.filter((k) => k.zh).length }
  })
  return { done, total: KANJI_ALL.length, byGrade }
}
