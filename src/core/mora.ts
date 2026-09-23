/**
 * 拍（モーラ）切分與高低アクセント的型樣計算。純函式。
 *
 * 日語不是聲調語言 —— 沒有中文那種四聲曲線。
 * 每一拍只有高、低兩段，而且一個詞最多只降一次；
 * 分型看的是「降在第幾拍之後」：0 型平板、1 型頭高、2 型、…、尾高。
 */

/** 拗音的小字：跟前一拍併成同一拍 */
const SMALL = 'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ'

/**
 * 切成拍。
 * 「きょ」是一拍，「っ」「ん」「ー」各自是獨立一拍 ——
 * 這跟「幾個假名」不一樣，而アクセント數的是拍不是假名。
 */
export function morae(word: string): string[] {
  const out: string[] = []
  for (const ch of word) {
    if (SMALL.includes(ch) && out.length > 0) {
      out[out.length - 1] += ch
    } else {
      out.push(ch)
    }
  }
  return out
}

export interface PitchShape {
  /** 每一拍是不是高音 */
  highs: boolean[]
  /** 下降發生在第幾拍之後（0-based 的最後一個高音拍）；平板是 null */
  dropAfter: number | null
  /**
   * 尾高：詞本身唸到最後都是高的，降落在後面的助詞上。
   * 「はな（花）」是尾高，所以「はなが」的が才是低的；
   * 平板的「はな（鼻）」則是連が都維持高音。這兩者光看詞本身分不出來。
   */
  tailFall: boolean
}

/**
 * accent 是重音核的位置：0 為平板，1 為頭高，n 表示第 n 拍之後下降。
 */
export function pitchShape(word: string, accent: number): PitchShape {
  const n = morae(word).length
  const highs: boolean[] = []

  for (let i = 0; i < n; i++) {
    if (accent === 0) {
      // 平板：第一拍低，之後一路高到底
      highs.push(i > 0)
    } else if (accent === 1) {
      // 頭高：只有第一拍高
      highs.push(i === 0)
    } else {
      // 中高／尾高：第一拍低，第 2 拍到第 accent 拍高
      highs.push(i > 0 && i < accent)
    }
  }

  return {
    highs,
    dropAfter: accent === 0 ? null : accent - 1,
    tailFall: accent !== 0 && accent === n,
  }
}
