/**
 * 內容裡的行內標記。只有兩種，而且都是封閉語法：
 *
 *   `先生{せんせい}`  → 振り仮名
 *   `**這裡**`        → 強調
 *
 * 用自訂標記而不是直接寫 HTML，是因為內容資料不該含有標籤 ——
 * 一旦開了 v-html 的口，之後任何一筆資料都可能塞進腳本。
 * 這兩種標記解析成結構化的段落，元件照欄位渲染，永遠碰不到 innerHTML。
 *
 * 原本的設計是「不做行內強調，需要強調就拆成 warning 區塊」。
 * 寫完六章之後那條規則被推翻了：解說文字裡「**順接**：後面順著前面走」
 * 這種對照，拆成獨立區塊反而讀不動。規則錯了就改規則，不是把內容寫差。
 */

export interface InlineSegment {
  base: string
  /** 注音。沒有就是純文字。 */
  ruby?: string
  /** 是否加強 */
  bold?: boolean
}

/**
 * 注音標記的底字是大括號前的整個詞。
 *
 * 兩種寫法都支援，看你要標在哪裡：
 *   `食{た}べます`      → 只標漢字，送り仮名留在外面（部分ルビ）
 *   `食べます{たべます}` → 整個詞一起標（総ルビ）
 *
 * 底字只吃**日文字元**（漢字與假名），碰到標點就停。
 * 原本寫成 `[^\s{}]+`，結果「いいえ、食{た}べません」的 ruby
 * 會從句首的「いいえ、」一路蓋到「食」—— 只有詞與詞之間剛好有空白時才正確。
 *
 * 但**底字開頭是假名時，讀音要寫整個詞的**：
 * 寫 `ご飯{はん}` 的話，はん 會蓋在「ご飯」兩個字上面，位置是錯的；
 * 要寫 `ご飯{ごはん}`。`お名前{おなまえ}`、`あ行{あぎょう}` 同理。
 * lint 會把寫錯的抓出來。
 *
 * 漢字的範圍用 `\p{Script=Han}` 而不是寫死的 `一-鿿`：
 * 常用漢字表裡的「𠮟」是 Unicode 擴充 B 區（U+20B9F），落在那個區間外，
 * 結果它的注音整個不渲染，`{しか}` 原樣印在畫面上。
 */
const RUBY = /([\p{Script=Han}々ぁ-んァ-ヶー]+)\{([^{}]+)\}/gu

const BOLD = /\*\*([^*]+)\*\*/g

/** 把一段文字切成「粗體／非粗體」的區塊 */
function splitBold(text: string): { text: string; bold: boolean }[] {
  const out: { text: string; bold: boolean }[] = []
  let last = 0

  for (const m of text.matchAll(BOLD)) {
    const start = m.index ?? 0
    if (start > last) out.push({ text: text.slice(last, start), bold: false })
    out.push({ text: m[1], bold: true })
    last = start + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false })
  return out
}

/** 在一個區塊裡解析振り仮名 */
function splitRuby(text: string, bold: boolean): InlineSegment[] {
  const out: InlineSegment[] = []
  let last = 0

  for (const m of text.matchAll(RUBY)) {
    const start = m.index ?? 0
    if (start > last) out.push({ base: text.slice(last, start), bold })
    out.push({ base: m[1], ruby: m[2], bold })
    last = start + m[0].length
  }
  if (last < text.length) out.push({ base: text.slice(last), bold })
  return out
}

export function parseInline(text: string): InlineSegment[] {
  return splitBold(text).flatMap((chunk) => splitRuby(chunk.text, chunk.bold))
}

/**
 * 去掉所有標記，只留本文。
 * 朗讀前一定要跑這個，否則 TTS 會把括號和星號都唸出來。
 */
export function stripMarkup(text: string): string {
  return text.replace(BOLD, '$1').replace(RUBY, '$1')
}

/** 只留讀音：漢字換成它的假名。要餵給 TTS 或做讀音比對時用。 */
export function readingOf(text: string): string {
  return text.replace(BOLD, '$1').replace(RUBY, '$2')
}
