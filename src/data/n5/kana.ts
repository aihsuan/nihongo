/**
 * 平假名 46 音的單一事實來源。
 * 教材的假名表、題目的選項與誘答、列印練習紙的字形，三處都讀這一份 ——
 * 抄三份的下場是改了一處另外兩處悄悄不一致。
 */

import { morae } from '../../core/mora'

export interface Kana {
  hira: string
  kata: string
  romaji: string
  /** 字源或形狀記憶提示。記得住的是故事，不是表格。 */
  hint: string
  /** 所屬行，用來切課與出題 */
  row: string
}

export const KANA: Kana[] = [
  { hira: 'あ', kata: 'ア', romaji: 'a', row: 'あ', hint: '草寫自「安」，像 A 加一橫' },
  { hira: 'い', kata: 'イ', romaji: 'i', row: 'あ', hint: '來自「以」，兩撇像兩根筷子' },
  { hira: 'う', kata: 'ウ', romaji: 'u', row: 'あ', hint: '來自「宇」，像側臉的鼻子' },
  { hira: 'え', kata: 'エ', romaji: 'e', row: 'あ', hint: '來自「衣」，像一隻天鵝' },
  { hira: 'お', kata: 'オ', romaji: 'o', row: 'あ', hint: '來自「於」，跟あ很像但多一點' },

  { hira: 'か', kata: 'カ', romaji: 'ka', row: 'か', hint: '來自「加」，像一把刀' },
  { hira: 'き', kata: 'キ', romaji: 'ki', row: 'か', hint: '來自「幾」，像鑰匙 key' },
  { hira: 'く', kata: 'ク', romaji: 'ku', row: 'か', hint: '來自「久」，像鳥嘴' },
  { hira: 'け', kata: 'ケ', romaji: 'ke', row: 'か', hint: '來自「計」，像英文字母 k' },
  { hira: 'こ', kata: 'コ', romaji: 'ko', row: 'か', hint: '來自「己」，兩條線像兩片嘴唇' },

  { hira: 'さ', kata: 'サ', romaji: 'sa', row: 'さ', hint: '來自「左」，跟き方向相反' },
  { hira: 'し', kata: 'シ', romaji: 'shi', row: 'さ', hint: '來自「之」，像一根釣竿' },
  { hira: 'す', kata: 'ス', romaji: 'su', row: 'さ', hint: '來自「寸」，像游泳 swim 的漩渦' },
  { hira: 'せ', kata: 'セ', romaji: 'se', row: 'さ', hint: '來自「世」，像英文的 se' },
  { hira: 'そ', kata: 'ソ', romaji: 'so', row: 'さ', hint: '來自「曾」，像 Z 字折返' },

  { hira: 'た', kata: 'タ', romaji: 'ta', row: 'た', hint: '來自「太」，左半像 t' },
  { hira: 'ち', kata: 'チ', romaji: 'chi', row: 'た', hint: '來自「知」，跟さ左右相反' },
  { hira: 'つ', kata: 'ツ', romaji: 'tsu', row: 'た', hint: '來自「川」，像一道海浪' },
  { hira: 'て', kata: 'テ', romaji: 'te', row: 'た', hint: '來自「天」，像伸出的一隻手' },
  { hira: 'と', kata: 'ト', romaji: 'to', row: 'た', hint: '來自「止」，像腳趾 toe' },

  { hira: 'な', kata: 'ナ', romaji: 'na', row: 'な', hint: '來自「奈」，像打了個結 knot' },
  { hira: 'に', kata: 'ニ', romaji: 'ni', row: 'な', hint: '來自「仁」，像膝蓋 knee' },
  { hira: 'ぬ', kata: 'ヌ', romaji: 'nu', row: 'な', hint: '來自「奴」，像打結的麵條 noodle' },
  { hira: 'ね', kata: 'ネ', romaji: 'ne', row: 'な', hint: '來自「祢」，跟ぬ、れ是同一家' },
  { hira: 'の', kata: 'ノ', romaji: 'no', row: 'な', hint: '來自「乃」，像一個禁止符號 no' },

  { hira: 'は', kata: 'ハ', romaji: 'ha', row: 'は', hint: '來自「波」，像 H 加一豎' },
  { hira: 'ひ', kata: 'ヒ', romaji: 'hi', row: 'は', hint: '來自「比」，像一張笑臉' },
  { hira: 'ふ', kata: 'フ', romaji: 'fu', row: 'は', hint: '來自「不」，像一座富士山' },
  { hira: 'へ', kata: 'ヘ', romaji: 'he', row: 'は', hint: '來自「部」，像一座小山丘' },
  { hira: 'ほ', kata: 'ホ', romaji: 'ho', row: 'は', hint: '來自「保」，就是は多一橫' },

  { hira: 'ま', kata: 'マ', romaji: 'ma', row: 'ま', hint: '來自「末」，像媽媽在綁頭髮' },
  { hira: 'み', kata: 'ミ', romaji: 'mi', row: 'ま', hint: '來自「美」，像數字 21' },
  { hira: 'む', kata: 'ム', romaji: 'mu', row: 'ま', hint: '來自「武」，像一頭牛 moo' },
  { hira: 'め', kata: 'メ', romaji: 'me', row: 'ま', hint: '來自「女」，像一隻眼睛 me' },
  { hira: 'も', kata: 'モ', romaji: 'mo', row: 'ま', hint: '來自「毛」，像一支釣鉤' },

  { hira: 'や', kata: 'ヤ', romaji: 'ya', row: 'や', hint: '來自「也」，像犛牛 yak 的角' },
  { hira: 'ゆ', kata: 'ユ', romaji: 'yu', row: 'や', hint: '來自「由」，像一條魚' },
  { hira: 'よ', kata: 'ヨ', romaji: 'yo', row: 'や', hint: '來自「與」，像瑜珈 yoga 的姿勢' },

  { hira: 'ら', kata: 'ラ', romaji: 'ra', row: 'ら', hint: '來自「良」，像一隻兔子的耳朵' },
  { hira: 'り', kata: 'リ', romaji: 'ri', row: 'ら', hint: '來自「利」，像兩片葉子' },
  { hira: 'る', kata: 'ル', romaji: 'ru', row: 'ら', hint: '來自「留」，就是ろ多打一個結' },
  { hira: 'れ', kata: 'レ', romaji: 're', row: 'ら', hint: '來自「礼」，像一個人跪坐' },
  { hira: 'ろ', kata: 'ロ', romaji: 'ro', row: 'ら', hint: '來自「呂」，就是る不打結' },

  { hira: 'わ', kata: 'ワ', romaji: 'wa', row: 'わ', hint: '來自「和」，跟れ、ね是同一家' },
  { hira: 'を', kata: 'ヲ', romaji: 'wo', row: 'わ', hint: '來自「遠」，只當助詞用，不出現在單字裡' },

  { hira: 'ん', kata: 'ン', romaji: 'n', row: 'ん', hint: '來自「无」，像小寫的 n' },
]

/* ── 濁音・半濁音 ───────────────────────────────────────── */

/** 清音加兩點（濁點）或一個圈（半濁點）。不是新字，是同一個字換聲帶。 */
export const VOICED: Kana[] = [
  { hira: 'が', kata: 'ガ', romaji: 'ga', row: 'が', hint: 'か 加兩點' },
  { hira: 'ぎ', kata: 'ギ', romaji: 'gi', row: 'が', hint: 'き 加兩點' },
  { hira: 'ぐ', kata: 'グ', romaji: 'gu', row: 'が', hint: 'く 加兩點' },
  { hira: 'げ', kata: 'ゲ', romaji: 'ge', row: 'が', hint: 'け 加兩點' },
  { hira: 'ご', kata: 'ゴ', romaji: 'go', row: 'が', hint: 'こ 加兩點' },

  { hira: 'ざ', kata: 'ザ', romaji: 'za', row: 'ざ', hint: 'さ 加兩點' },
  { hira: 'じ', kata: 'ジ', romaji: 'ji', row: 'ざ', hint: 'し 加兩點，唸 ji 不是 zi' },
  { hira: 'ず', kata: 'ズ', romaji: 'zu', row: 'ざ', hint: 'す 加兩點' },
  { hira: 'ぜ', kata: 'ゼ', romaji: 'ze', row: 'ざ', hint: 'せ 加兩點' },
  { hira: 'ぞ', kata: 'ゾ', romaji: 'zo', row: 'ざ', hint: 'そ 加兩點' },

  { hira: 'だ', kata: 'ダ', romaji: 'da', row: 'だ', hint: 'た 加兩點' },
  { hira: 'ぢ', kata: 'ヂ', romaji: 'ji', row: 'だ', hint: 'ち 加兩點，唸法跟 じ 一樣，現代幾乎不用' },
  { hira: 'づ', kata: 'ヅ', romaji: 'zu', row: 'だ', hint: 'つ 加兩點，唸法跟 ず 一樣，現代幾乎不用' },
  { hira: 'で', kata: 'デ', romaji: 'de', row: 'だ', hint: 'て 加兩點' },
  { hira: 'ど', kata: 'ド', romaji: 'do', row: 'だ', hint: 'と 加兩點' },

  { hira: 'ば', kata: 'バ', romaji: 'ba', row: 'ば', hint: 'は 加兩點' },
  { hira: 'び', kata: 'ビ', romaji: 'bi', row: 'ば', hint: 'ひ 加兩點' },
  { hira: 'ぶ', kata: 'ブ', romaji: 'bu', row: 'ば', hint: 'ふ 加兩點' },
  { hira: 'べ', kata: 'ベ', romaji: 'be', row: 'ば', hint: 'へ 加兩點' },
  { hira: 'ぼ', kata: 'ボ', romaji: 'bo', row: 'ば', hint: 'ほ 加兩點' },

  { hira: 'ぱ', kata: 'パ', romaji: 'pa', row: 'ぱ', hint: 'は 加一個圈' },
  { hira: 'ぴ', kata: 'ピ', romaji: 'pi', row: 'ぱ', hint: 'ひ 加一個圈' },
  { hira: 'ぷ', kata: 'プ', romaji: 'pu', row: 'ぱ', hint: 'ふ 加一個圈' },
  { hira: 'ぺ', kata: 'ペ', romaji: 'pe', row: 'ぱ', hint: 'へ 加一個圈' },
  { hira: 'ぽ', kata: 'ポ', romaji: 'po', row: 'ぱ', hint: 'ほ 加一個圈' },
]

/* ── 拗音 ───────────────────────────────────────────────── */

/** い段的字配上小さいゃゅょ。兩個假名合起來只有一拍 —— 這是拗音唯一的難點。 */
export const YOUON: Kana[] = [
  { hira: 'きゃ', kata: 'キャ', romaji: 'kya', row: 'きゃ', hint: 'き＋小ゃ，一拍' },
  { hira: 'きゅ', kata: 'キュ', romaji: 'kyu', row: 'きゃ', hint: 'き＋小ゅ，一拍' },
  { hira: 'きょ', kata: 'キョ', romaji: 'kyo', row: 'きゃ', hint: 'き＋小ょ，一拍' },
  { hira: 'しゃ', kata: 'シャ', romaji: 'sha', row: 'しゃ', hint: 'し＋小ゃ，唸 sha' },
  { hira: 'しゅ', kata: 'シュ', romaji: 'shu', row: 'しゃ', hint: 'し＋小ゅ，唸 shu' },
  { hira: 'しょ', kata: 'ショ', romaji: 'sho', row: 'しゃ', hint: 'し＋小ょ，唸 sho' },
  { hira: 'ちゃ', kata: 'チャ', romaji: 'cha', row: 'ちゃ', hint: 'ち＋小ゃ，唸 cha' },
  { hira: 'ちゅ', kata: 'チュ', romaji: 'chu', row: 'ちゃ', hint: 'ち＋小ゅ，唸 chu' },
  { hira: 'ちょ', kata: 'チョ', romaji: 'cho', row: 'ちゃ', hint: 'ち＋小ょ，唸 cho' },
  { hira: 'にゃ', kata: 'ニャ', romaji: 'nya', row: 'にゃ', hint: 'に＋小ゃ' },
  { hira: 'にゅ', kata: 'ニュ', romaji: 'nyu', row: 'にゃ', hint: 'に＋小ゅ' },
  { hira: 'にょ', kata: 'ニョ', romaji: 'nyo', row: 'にゃ', hint: 'に＋小ょ' },
  { hira: 'ひゃ', kata: 'ヒャ', romaji: 'hya', row: 'ひゃ', hint: 'ひ＋小ゃ' },
  { hira: 'ひゅ', kata: 'ヒュ', romaji: 'hyu', row: 'ひゃ', hint: 'ひ＋小ゅ' },
  { hira: 'ひょ', kata: 'ヒョ', romaji: 'hyo', row: 'ひゃ', hint: 'ひ＋小ょ' },
  { hira: 'みゃ', kata: 'ミャ', romaji: 'mya', row: 'みゃ', hint: 'み＋小ゃ' },
  { hira: 'みゅ', kata: 'ミュ', romaji: 'myu', row: 'みゃ', hint: 'み＋小ゅ' },
  { hira: 'みょ', kata: 'ミョ', romaji: 'myo', row: 'みゃ', hint: 'み＋小ょ' },
  { hira: 'りゃ', kata: 'リャ', romaji: 'rya', row: 'りゃ', hint: 'り＋小ゃ' },
  { hira: 'りゅ', kata: 'リュ', romaji: 'ryu', row: 'りゃ', hint: 'り＋小ゅ' },
  { hira: 'りょ', kata: 'リョ', romaji: 'ryo', row: 'りゃ', hint: 'り＋小ょ' },
  { hira: 'ぎゃ', kata: 'ギャ', romaji: 'gya', row: 'ぎゃ', hint: 'ぎ＋小ゃ' },
  { hira: 'ぎゅ', kata: 'ギュ', romaji: 'gyu', row: 'ぎゃ', hint: 'ぎ＋小ゅ' },
  { hira: 'ぎょ', kata: 'ギョ', romaji: 'gyo', row: 'ぎゃ', hint: 'ぎ＋小ょ' },
  { hira: 'じゃ', kata: 'ジャ', romaji: 'ja', row: 'じゃ', hint: 'じ＋小ゃ，唸 ja' },
  { hira: 'じゅ', kata: 'ジュ', romaji: 'ju', row: 'じゃ', hint: 'じ＋小ゅ，唸 ju' },
  { hira: 'じょ', kata: 'ジョ', romaji: 'jo', row: 'じゃ', hint: 'じ＋小ょ，唸 jo' },
  { hira: 'びゃ', kata: 'ビャ', romaji: 'bya', row: 'びゃ', hint: 'び＋小ゃ' },
  { hira: 'びゅ', kata: 'ビュ', romaji: 'byu', row: 'びゃ', hint: 'び＋小ゅ' },
  { hira: 'びょ', kata: 'ビョ', romaji: 'byo', row: 'びゃ', hint: 'び＋小ょ' },
  { hira: 'ぴゃ', kata: 'ピャ', romaji: 'pya', row: 'ぴゃ', hint: 'ぴ＋小ゃ' },
  { hira: 'ぴゅ', kata: 'ピュ', romaji: 'pyu', row: 'ぴゃ', hint: 'ぴ＋小ゅ' },
  { hira: 'ぴょ', kata: 'ピョ', romaji: 'pyo', row: 'ぴゃ', hint: 'ぴ＋小ょ' },
]

/** 清音 46 ＋ 濁音半濁音 25 ＋ 拗音 33 */
export const ALL: Kana[] = [...KANA, ...VOICED, ...YOUON]

/** 平假名與片假名都當鍵，查表時不必先判斷是哪一套文字 */
const BY_TEXT = new Map<string, Kana>()
for (const k of ALL) {
  BY_TEXT.set(k.hira, k)
  BY_TEXT.set(k.kata, k)
}

export function kana(text: string): Kana {
  const found = BY_TEXT.get(text)
  if (!found) throw new Error(`未知的假名：${text}`)
  return found
}

export function lookup(text: string): Kana | undefined {
  return BY_TEXT.get(text)
}

/** 取某幾行的假名，用來切課。 */
export function rows(...names: string[]): Kana[] {
  return ALL.filter((k) => names.includes(k.row))
}

/** 同一個音的片假名 */
export function kataOf(text: string): string {
  return kana(text).kata
}

/**
 * 把一個詞拆成拍，再查出每一拍的假名資料。
 * 長音「ー」與促音「っ」查不到 —— 它們不是音節而是修飾符號，直接略過。
 */
export function spell(word: string): Kana[] {
  return morae(word)
    .map(lookup)
    .filter((k): k is Kana => Boolean(k))
}

const SOKUON = 'っッ'
const CHOUON = 'ー'
const VOWELS = 'aiueo'

/**
 * 整個詞的羅馬字。
 * 促音把下一拍的子音重複一次（カップ → kappu），
 * 長音把前一拍的母音再拉一次（コーヒー → koohii）。
 * 不特別處理就會拼出 ka-pu、ko-hi，那正好是初學者最常犯的兩個錯。
 */
export function romajiOf(word: string): string {
  const parts = morae(word)
  const out: string[] = []

  parts.forEach((m, i) => {
    if (SOKUON.includes(m)) {
      const next = lookup(parts[i + 1] ?? '')
      if (next) out.push(next.romaji[0])
      return
    }
    if (m === CHOUON) {
      const prev = out[out.length - 1] ?? ''
      const lastVowel = [...prev].reverse().find((c) => VOWELS.includes(c))
      if (lastVowel) out.push(lastVowel)
      return
    }
    out.push(lookup(m)?.romaji ?? m)
  })

  return out.join('')
}
