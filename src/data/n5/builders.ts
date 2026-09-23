/**
 * 題目建構器。
 *
 * 假名題的骨架高度重複（看字選音、聽音選字、字音配對），
 * 手打 36 題近乎一樣的物件只會製造錯字。所以骨架由函式生成，
 * 誘答則一律由呼叫端明確指定 —— 誘答的品質就是題目的品質，
 * 隨機挑會挑出「あ vs ん」這種毫無鑑別力的選項。
 */
import type {
  ChoiceQuestion,
  FillQuestion,
  KanjiBlock,
  ListeningQuestion,
  MatchQuestion,
  PassageQuestion,
  ReorderQuestion,
} from '../../core/types'
import { kana, lookup, romajiOf, spell } from './kana'
import { morae } from '../../core/mora'
import { kanji } from './kanji'
import { VOCAB, vocabKp } from './vocab'
import { readingOf, stripMarkup } from '../../core/inline'

export const kpOf = (hira: string) => `kana.${hira}`
export const wordKp = vocabKp

/** 看假名選羅馬字 */
export function readQ(id: string, hira: string, wrong: string[]): ChoiceQuestion {
  const k = kana(hira)
  const options = [k.romaji, ...wrong]
  return {
    id,
    type: 'choice',
    knowledgePoints: [kpOf(hira)],
    prompt: `「${hira}」怎麼唸？`,
    speak: hira,
    options,
    answerIndex: 0,
    explanation: `${hira} 唸作 ${k.romaji}。${k.hint}。`,
  }
}

/**
 * 聽詞選假名。
 *
 * **不要出「聽一個孤立的假名，選出它」這種題。** 單獨一拍聽不清楚 ——
 * 沒有前後音可以對照，え／い、す／つ、ん的鼻音長度全都糊在一起，
 * 而且日語的無聲化母音（です的す）單獨唸時根本聽不到。
 * 放進一個真的詞裡，節奏和前後音就成了線索，這才是真實的聽辨情境。
 *
 * 題目顯示挖掉一拍的詞（ね◯），播放整個詞（ねこ），選出空格裡的那一拍。
 */
export function wordListenQ(
  id: string,
  word: string,
  blankAt: number,
  wrong: string[],
  zh: string,
): ChoiceQuestion {
  const parts = morae(word)
  const answer = parts[blankAt]
  if (!answer) throw new Error(`${word} 沒有第 ${blankAt} 拍`)

  const shown = parts.map((m, i) => (i === blankAt ? '◯' : m)).join('')
  const k = lookup(answer)

  return {
    id,
    type: 'choice',
    knowledgePoints: [kpOf(answer)],
    // 不寫出中譯 —— 知道意思就能默寫出拼法，那就變成背單字而不是聽辨了
    prompt: `聽發音，選出空格裡的假名：${shown}`,
    speak: word,
    options: [answer, ...wrong],
    answerIndex: 0,
    explanation:
      `這個詞是「${word}」（${romajiOf(word)}），意思是${zh}。空格是「${answer}」` +
      (k ? `，唸 ${k.romaji}。${k.hint}。` : '。'),
  }
}

/** 看羅馬字選假名 */
export function writeQ(id: string, hira: string, wrong: string[]): ChoiceQuestion {
  const k = kana(hira)
  return {
    id,
    type: 'choice',
    knowledgePoints: [kpOf(hira)],
    prompt: `${k.romaji} 是哪一個假名？`,
    options: [hira, ...wrong],
    answerIndex: 0,
    explanation: `${k.romaji} 寫作 ${hira}。${k.hint}。`,
  }
}

/** 假名與羅馬字配對 */
export function kanaMatchQ(id: string, chars: string[]): MatchQuestion {
  return {
    id,
    type: 'match',
    knowledgePoints: chars.map(kpOf),
    prompt: '把假名和它的讀音配起來',
    pairs: chars.map((c) => ({ left: c, right: kana(c).romaji, speak: c })),
    explanation: chars.map((c) => `${c} = ${kana(c).romaji}`).join('、') + '。',
  }
}

/**
 * 單字填空：挖掉其中一個假名，從候選中點選填回去。
 * 不用打字 —— 使用者的電腦不一定裝了日文輸入法。
 */
export function wordFillQ(
  id: string,
  word: string,
  zh: string,
  blankAt: number,
  wrong: string[],
): FillQuestion {
  const chars = Array.from(word)
  const answer = chars[blankAt]
  const shown = chars.map((c, i) => (i === blankAt ? '___' : c)).join('')
  return {
    id,
    type: 'fill',
    knowledgePoints: [kpOf(answer), wordKp(word)],
    prompt: `${shown}（${zh}）`,
    bank: [answer, ...wrong],
    answers: [answer],
    explanation: `正確寫法是「${word}」，唸作 ${romajiOf(word)}，意思是${zh}。`,
  }
}

/**
 * 單字與中文配對。
 * kanji 只影響朗讀：教材唸「傘」、練習唸「かさ」的話聲調會不一樣，
 * 同一個字在兩個地方唸法不同比唸錯更糟。
 */
export function wordMatchQ(
  id: string,
  items: { word: string; zh: string; kanji?: string }[],
): MatchQuestion {
  return {
    id,
    type: 'match',
    knowledgePoints: items.map((i) => wordKp(i.word)),
    prompt: '把單字和它的意思配起來',
    pairs: items.map((i) => ({ left: i.word, right: i.zh, speak: i.kanji ?? i.word })),
    explanation: items
      .map((i) => `${i.word}（${romajiOf(i.word)}）＝ ${i.zh}`)
      .join('、') + '。',
  }
}

/** 讀出整個單字：看假名選中文 */
export function wordReadQ(
  id: string,
  word: string,
  zh: string,
  wrong: string[],
  kanji?: string,
): ChoiceQuestion {
  return {
    id,
    type: 'choice',
    knowledgePoints: [wordKp(word), ...spell(word).map((k) => kpOf(k.hira))],
    prompt: `「${word}」是什麼意思？`,
    speak: kanji ?? word,
    options: [zh, ...wrong],
    answerIndex: 0,
    explanation: `${word} 唸作 ${romajiOf(word)}，意思是${zh}。`,
  }
}

/* ── 片假名專用 ─────────────────────────────────────────── */

/**
 * 片假名的題目和平假名不一樣：學習者已經知道這些音了，
 * 要練的是「同一個音的另一種字形」。所以主力題型是兩套文字互相配對，
 * 而不是重新記一次讀音。
 */

/** 平假名與片假名配對 */
export function scriptMatchQ(id: string, chars: string[]): MatchQuestion {
  return {
    id,
    type: 'match',
    knowledgePoints: chars.map((c) => `kata.${kana(c).kata}`),
    prompt: '把片假名和相同讀音的平假名配起來',
    pairs: chars.map((c) => ({
      left: kana(c).kata,
      right: kana(c).hira,
      speak: kana(c).hira,
    })),
    explanation: chars.map((c) => `${kana(c).kata} = ${kana(c).hira}（${kana(c).romaji}）`).join('、') + '。',
  }
}

/** 看片假名選讀音 */
export function kataReadQ(id: string, char: string, wrong: string[]): ChoiceQuestion {
  const k = kana(char)
  return {
    id,
    type: 'choice',
    knowledgePoints: [`kata.${k.kata}`],
    prompt: `「${k.kata}」怎麼唸？`,
    speak: k.hira,
    options: [k.romaji, ...wrong],
    answerIndex: 0,
    explanation: `${k.kata} 是平假名的「${k.hira}」，唸 ${k.romaji}。${k.hint}。`,
  }
}

/** 看羅馬字選片假名 */
export function kataWriteQ(id: string, char: string, wrong: string[]): ChoiceQuestion {
  const k = kana(char)
  return {
    id,
    type: 'choice',
    knowledgePoints: [`kata.${k.kata}`],
    prompt: `${k.romaji} 的片假名是哪一個？`,
    options: [k.kata, ...wrong.map((w) => kana(w).kata)],
    answerIndex: 0,
    explanation: `${k.romaji} 的片假名是 ${k.kata}，平假名是 ${k.hira}。`,
  }
}



/** 外來語填空：挖掉一拍，從候選中點選填回去 */
export function loanFillQ(
  id: string,
  word: string,
  zh: string,
  blankAt: number,
  wrong: string[],
): FillQuestion {
  const parts = Array.from(word)
  const answer = parts[blankAt]
  const shown = parts.map((c, i) => (i === blankAt ? '___' : c)).join('')
  return {
    id,
    type: 'fill',
    knowledgePoints: [`kata.${answer}`, wordKp(word)],
    prompt: `${shown}（${zh}）`,
    bank: [answer, ...wrong],
    answers: [answer],
    explanation: `正確寫法是「${word}」，唸作 ${romajiOf(word)}，意思是${zh}。`,
  }
}

/** 外來語與中文配對 */
export function loanMatchQ(
  id: string,
  items: { word: string; zh: string }[],
): MatchQuestion {
  return {
    id,
    type: 'match',
    knowledgePoints: items.map((i) => wordKp(i.word)),
    prompt: '把外來語和它的意思配起來',
    pairs: items.map((i) => ({ left: i.word, right: i.zh, speak: i.word })),
    explanation: items.map((i) => `${i.word}（${romajiOf(i.word)}）＝ ${i.zh}`).join('、') + '。',
  }
}

/** 自由題：題幹、選項、解析全部自己寫。拿來出規則辨析題。 */
export function customChoiceQ(
  id: string,
  kps: string[],
  prompt: string,
  options: string[],
  explanation: string,
  speak?: string,
): ChoiceQuestion {
  return { id, type: 'choice', knowledgePoints: kps, prompt, options, answerIndex: 0, explanation, speak }
}

/* ── 漢字與單字（第 3 章起） ─────────────────────────────── */


export const kanjiKp = (char: string) => `kanji.${char}`

/**
 * 漢字讀法。對應 JLPT 的「漢字讀法」大題。
 *
 * 目標詞**不標注音** —— 標了就等於把答案印在題目上。
 * 題幹裡的其他漢字才要標。
 */
export function kanjiReadQ(
  id: string,
  word: string,
  reading: string,
  wrong: string[],
  zh: string,
): ChoiceQuestion {
  return {
    id,
    type: 'choice',
    knowledgePoints: [...Array.from(word).filter((c) => c.trim()).map(kanjiKp), vocabKp(reading)],
    prompt: `「${word}」的讀音是？`,
    speak: word,
    options: [reading, ...wrong],
    answerIndex: 0,
    explanation: `${word} 唸作「${reading}」，意思是${zh}。`,
  }
}

/** 漢字書寫：看讀音選漢字。對應「漢字書寫」大題。 */
export function kanjiWriteQ(
  id: string,
  reading: string,
  word: string,
  wrong: string[],
  zh: string,
): ChoiceQuestion {
  return {
    id,
    type: 'choice',
    knowledgePoints: [...Array.from(word).map(kanjiKp), vocabKp(reading)],
    prompt: `「${reading}」（${zh}）寫成漢字是哪一個？`,
    speak: word,
    options: [word, ...wrong],
    answerIndex: 0,
    explanation: `「${reading}」寫作「${word}」，意思是${zh}。`,
  }
}

/**
 * 單字與中文配對。左欄用「漢字{假名}」標記，讀不出來不該卡住這一題。
 *
 * 選擇器可以是假名或漢字。同音詞（はな＝鼻／花）用假名會撞，
 * 這時候必須用漢字指定，否則直接拋錯 —— 靜默挑到錯的那個才是災難。
 */
/**
 * 用假名或漢字指定一個單字。
 *
 * 同音詞（はな＝鼻／花）用假名指定會拋錯而不是默默挑一個 ——
 * 這個守衛在寫第 13 章時真的擋下過一次挑錯字。
 */
function resolveWord(k: string) {
  const byKanji = VOCAB.filter((x) => x.kanji === k)
  if (byKanji.length === 1) return byKanji[0]

  const byKana = VOCAB.filter((x) => x.kana === k)
  if (byKana.length === 1) return byKana[0]
  if (byKana.length > 1) {
    throw new Error(`「${k}」對到多個單字（${byKana.map((x) => x.kanji ?? x.zh).join('／')}），請改用漢字指定`)
  }
  throw new Error(`單字庫裡沒有：${k}`)
}

/** 單字的顯示寫法：有漢字就標振り仮名 */
const wordLabel = (v: { kana: string; kanji?: string }) =>
  v.kanji ? `${v.kanji}{${v.kana}}` : v.kana

export function vocabMatchQ(id: string, selectors: string[]): MatchQuestion {
  const words = selectors.map(resolveWord)
  return {
    id,
    type: 'match',
    knowledgePoints: words.map((v) => vocabKp(v.kana)),
    prompt: '把單字和它的意思配起來',
    pairs: words.map((v) => ({
      left: wordLabel(v),
      right: v.zh,
      speak: v.kanji ?? v.kana,
    })),
    explanation: words.map((v) => `${v.kanji ?? v.kana}（${v.kana}）＝ ${v.zh}`).join('、') + '。',
  }
}

/**
 * 文法填空：從候選中點選填入。
 * prompt 可以含振り仮名標記，空格用 ___。
 */
export function grammarFillQ(
  id: string,
  kps: string[],
  prompt: string,
  answers: string[],
  wrong: string[],
  explanation: string,
): FillQuestion {
  return {
    id,
    type: 'fill',
    knowledgePoints: kps,
    prompt,
    bank: [...answers, ...wrong],
    answers,
    explanation,
  }
}

/** 漢字卡區塊：從 kanji.ts 展開，元件不必自己去查表。 */
export function kanjiBlock(heading: string, chars: string[]): KanjiBlock {
  return {
    type: 'kanji',
    heading,
    items: chars.map((c) => {
      const k = kanji(c)
      return {
        char: k.char,
        zh: k.zh,
        on: k.on,
        kun: k.kun,
        words: k.words.map(([jp, reading, zh]) => ({ jp, reading, zh })),
      }
    }),
  }
}

/** 題幹裡的漢字要標音，但不能把答案也標出去 —— 這個檢查給 lint 用。 */
export const promptReading = (prompt: string) => readingOf(prompt)
export const promptPlain = (prompt: string) => stripMarkup(prompt)

/* ── JLPT 形式（第 3 章起的階段驗收只用這些） ─────────────── */

/**
 * もんだい1 語法形式的判斷。考卷上的樣子是：
 *
 * 　　わたし（　）がくせいです。　1 は　2 を　3 に　4 で
 *
 * 跟 `customChoiceQ` 的差別只在題幹格式被固定住 —— 這個固定是重點，
 * 隨堂練習可以隨便問，驗收的題幹必須長得跟考卷一樣，
 * 不然「驗收」驗的就不是考試能力。
 */
export function jlptGrammarQ(
  id: string,
  kps: string[],
  sentence: string,
  answer: string,
  wrong: [string, string, string],
  explanation: string,
): ChoiceQuestion {
  return {
    id,
    type: 'choice',
    knowledgePoints: kps,
    prompt: sentence,
    options: [answer, ...wrong],
    answerIndex: 0,
    explanation,
  }
}

/**
 * もんだい2 句子的組織（★ 題）。
 *
 * @param prompt   題幹，四個空格用 ＿＿ 標出來
 * @param segments 四個選項，**照考卷上印的 1〜4 順序**（也就是打散過的順序）
 * @param order    正確語序，值是 segments 的索引
 * @param star     ★ 落在第幾個空格（0 起算）
 *
 * 判分只看 ★ 那格，解析要把整句正解寫出來 —— 只說「答案是 3」等於沒教。
 */
export function jlptReorderQ(
  id: string,
  kps: string[],
  prompt: string,
  segments: [string, string, string, string],
  order: [number, number, number, number],
  star: number,
  explanation: string,
): ReorderQuestion {
  return { id, type: 'reorder', knowledgePoints: kps, prompt, segments, order, starIndex: star, explanation }
}

/**
 * もんだい3 文章語法／讀解。
 *
 * 每一題各自帶完整短文，理由見 types.ts 的 PassageQuestion ——
 * 一篇文章綁五題的話，隨機抽題會把 12 題的卷子撐成 16 題。
 */
export function jlptPassageQ(
  id: string,
  kps: string[],
  passage: string,
  prompt: string,
  answer: string,
  wrong: [string, string, string],
  explanation: string,
  passageTitle?: string,
): PassageQuestion {
  return {
    id,
    type: 'passage',
    knowledgePoints: kps,
    passage,
    passageTitle,
    prompt,
    options: [answer, ...wrong],
    answerIndex: 0,
    explanation,
  }
}

/**
 * 聽解：唸一段話或一段對話，從四個**文字**選項選一個。
 *
 * script 有值就是對話題（A、B 兩個人輪流），沒有就是單人獨白。
 * 選項文字絕對不能出現在朗讀內容裡，否則這題就退化成閱讀測驗 —— lint 會擋。
 */
export function jlptListenQ(
  id: string,
  kps: string[],
  script: { who: 'A' | 'B'; text: string }[] | string,
  prompt: string,
  answer: string,
  wrong: [string, string, string],
  explanation: string,
): ListeningQuestion {
  const dialogue = typeof script === 'string' ? undefined : script
  return {
    id,
    type: 'listening',
    knowledgePoints: kps,
    speak: typeof script === 'string' ? script : script.map((l) => l.text).join('。'),
    script: dialogue,
    prompt,
    options: [answer, ...wrong],
    answerIndex: 0,
    explanation,
  }
}

/**
 * もんだい4 前後關係：句子挖一個空，從四個單字裡選。
 *
 * 這是配對題（把單字連到中文意思）的考試版替代品。差別不只是形式：
 * 配對題只要認得字就能連，前後關係要求你知道這個字**用在哪種句子**裡 ——
 * 「あまり」和「とても」兩個都認得的人，照樣會在「あまり 高くないです」上選錯。
 *
 * 誘答直接用同一個語義場的另外三個字（原本配對題的那三個），
 * 這比隨機挑誘答難，而且難在對的地方。
 */
export function jlptVocabQ(
  id: string,
  answer: string,
  others: [string, string, string],
  sentence: string,
  explanation: string,
): ChoiceQuestion {
  const right = resolveWord(answer)
  const wrong = others.map(resolveWord)
  return {
    id,
    type: 'choice',
    knowledgePoints: [right, ...wrong].map((v) => vocabKp(v.kana)),
    prompt: sentence,
    options: [wordLabel(right), ...wrong.map(wordLabel)],
    answerIndex: 0,
    explanation,
  }
}
