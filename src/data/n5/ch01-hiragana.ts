/**
 * N5 第 1 章：讀出平假名
 *
 * 46 音切成三課，每課約 15 個音。一次吞 46 個記不住，
 * 而每課結束都要能讀出幾個真的單字 —— 第 1 課結束就能讀「すし」，
 * 那是初學者的第一個成就感，比背完整張表重要。
 */
import type { Chapter, Lesson, Quiz, TableCell } from '../../core/types'
import { kana, romajiOf, rows } from './kana'
import {
  kanaMatchQ,
  kpOf,
  readQ,
  wordFillQ,
  wordListenQ,
  wordMatchQ,
  wordReadQ,
  writeQ,
} from './builders'

/** 假名表的一格。沒有字的位置（や行的 i、e 段）留空。 */
const cell = (hira: string | null): TableCell =>
  hira === null
    ? { text: '' }
    : {
        text: hira,
        romaji: kana(hira).romaji,
        speak: hira,
        hint: kana(hira).hint,
      }

const COLUMNS = ['', 'あ段 a', 'い段 i', 'う段 u', 'え段 e', 'お段 o']

const row = (label: string, chars: (string | null)[]): TableCell[] => [
  { text: label },
  ...chars.map(cell),
]

const kanaOf = (...names: string[]) => rows(...names).map((k) => k.hira)

const printKana = (chars: string[]) =>
  chars.map((c) => ({ char: c, romaji: kana(c).romaji }))

/**
 * 例句單字：[假名, 中譯, 重音核位置, 漢字]。
 *
 * accent 是高低アクセント的核位置（0 平板、1 頭高、n 為第 n 拍後下降）。
 * 這批數值照標準語（東京式）填，**課本到手後要拿《新明解日本語アクセント辞典》
 * 逐筆核對一次** —— 同一個詞在不同辭典偶爾會標不一樣，而聲調標錯比不標更糟。
 *
 * 漢字只餵給 TTS，畫面上不顯示：假名章的前提就是「你只認得假名」。
 */
const examples = (items: [string, string, number, string?][]) =>
  items.map(([jp, zh, accent, kanji]) => ({ jp, zh, accent, kanji, romaji: romajiOf(jp) }))

/* ── 第 1 課：あ行・か行・さ行 ─────────────────────────── */

const lesson1: Lesson = {
  id: 'n5-c1-l1',
  title: '讀出あ行到さ行',
  goal: '看到 15 個假名能唸出來，並讀出「すし」「かさ」這些真的單字。',
  knowledgePoints: kanaOf('あ', 'か', 'さ').map(kpOf),
  minutes: 10,
  blocks: [
    {
      type: 'note',
      heading: '先學平假名，不是片假名',
      paragraphs: [
        '日文有三套文字。平假名是骨幹——助詞、動詞語尾、最基本的單字全部是它，不會平假名就一個句子也讀不了。',
        '平假名一共 46 個音，排成五個母音（a・i・u・e・o）乘上九個子音。這一課先拿下前三行，15 個音。',
        '每個假名下面都有記憶提示。點一下假名可以聽發音，跟著唸出聲——只用眼睛看，明天就忘了。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'あ行・か行・さ行',
      columns: COLUMNS,
      rows: [
        row('あ行{あぎょう}', ['あ', 'い', 'う', 'え', 'お']),
        row('か行{かぎょう}', ['か', 'き', 'く', 'け', 'こ']),
        row('さ行{さぎょう}', ['さ', 'し', 'す', 'せ', 'そ']),
      ],
    },
    {
      type: 'warning',
      heading: '兩個會唸錯的地方',
      paragraphs: [
        'さ行的第二個字是「し」，唸 shi 不是 si。這是日文的規則例外，不是你看錯。',
        '「す」在句尾常常被弱化成幾乎只剩 s 的氣音，例如「です」聽起來像 des。現在先照 su 唸沒關係。',
      ],
    },
    {
      type: 'examples',
      heading: '只用這 15 個音就能讀的單字',
      items: examples([
        ['あい', '愛', 1, '愛'],
        ['いえ', '家', 2, '家'],
        ['あお', '藍色', 1, '青'],
        ['かさ', '雨傘', 1, '傘'],
        ['すし', '壽司', 2, '寿司'],
        ['えき', '車站', 1, '駅'],
        ['こえ', '聲音', 1, '声'],
        ['いす', '椅子', 0, '椅子'],
      ]),
    },
  ],
  questions: [
    kanaMatchQ('n5-c1-l1-q1', ['あ', 'か', 'さ', 'き', 'す']),
    wordListenQ('n5-c1-l1-q2', 'こえ', 0, ['そ', 'く', 'き'], '聲音'),
    readQ('n5-c1-l1-q3', 'し', ['si', 'chi', 'su']),
    writeQ('n5-c1-l1-q4', 'せ', ['さ', 'そ', 'き']),
    wordFillQ('n5-c1-l1-q5', 'かさ', '雨傘', 1, ['き', 'せ', 'そ']),
    wordMatchQ('n5-c1-l1-q6', [
      { word: 'あい', zh: '愛', kanji: '愛' },
      { word: 'いえ', zh: '家', kanji: '家' },
      { word: 'えき', zh: '車站', kanji: '駅' },
      { word: 'すし', zh: '壽司', kanji: '寿司' },
    ]),
  ],
  printSet: {
    id: 'n5-c1-l1',
    title: '平假名練習紙：あ行・か行・さ行',
    kana: printKana(['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ']),
  },
}

/* ── 第 2 課：た行・な行・は行 ─────────────────────────── */

const lesson2: Lesson = {
  id: 'n5-c1-l2',
  title: '讀出た行到は行',
  goal: '再拿下 15 個音，能讀出「ねこ」「ちかてつ」這類日常單字。',
  knowledgePoints: kanaOf('た', 'な', 'は').map(kpOf),
  minutes: 10,
  blocks: [
    {
      type: 'note',
      heading: '接下來三行',
      paragraphs: [
        '這 15 個音裡有三個不照規則走，它們是日文發音最常被唸錯的地方，先記住就不會養成壞習慣。',
        '一樣，點假名聽發音，跟著唸出來。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'た行・な行・は行',
      columns: COLUMNS,
      rows: [
        row('た行{たぎょう}', ['た', 'ち', 'つ', 'て', 'と']),
        row('な行{なぎょう}', ['な', 'に', 'ぬ', 'ね', 'の']),
        row('は行{はぎょう}', ['は', 'ひ', 'ふ', 'へ', 'ほ']),
      ],
    },
    {
      type: 'warning',
      heading: '三個不照規則的音',
      paragraphs: [
        '「ち」唸 chi 不是 ti。「つ」唸 tsu 不是 tu，那個 ts 是一個音，像中文的「ㄘ」。',
        '「ふ」唸 fu，但不是英文那種咬下唇的 f，而是吹蠟燭的氣音，介於 f 和 h 之間。',
        '「ぬ」和「ね」長得很像，差別在ぬ的尾巴打了一個結。這兩個混淆是初學者最常見的錯。',
      ],
    },
    {
      type: 'examples',
      heading: '現在能讀的單字變多了',
      items: examples([
        ['ねこ', '貓', 1, '猫'],
        ['ふね', '船', 1, '船'],
        ['はな', '花', 2, '花'],
        ['ひと', '人', 0, '人'],
        ['なつ', '夏天', 2, '夏'],
        ['くつ', '鞋子', 2, '靴'],
        ['ほし', '星星', 0, '星'],
        ['ちかてつ', '地鐵', 0, '地下鉄'],
      ]),
    },
  ],
  questions: [
    kanaMatchQ('n5-c1-l2-q1', ['た', 'に', 'ふ', 'ね', 'ほ']),
    wordListenQ('n5-c1-l2-q2', 'くつ', 1, ['す', 'し', 'ち'], '鞋子'),
    readQ('n5-c1-l2-q3', 'ふ', ['hu', 'bu', 'ho']),
    writeQ('n5-c1-l2-q4', 'ぬ', ['ね', 'の', 'に']),
    wordFillQ('n5-c1-l2-q5', 'ねこ', '貓', 0, ['ぬ', 'の', 'に']),
    wordMatchQ('n5-c1-l2-q6', [
      { word: 'ふね', zh: '船', kanji: '船' },
      { word: 'はな', zh: '花', kanji: '花' },
      { word: 'ひと', zh: '人', kanji: '人' },
      { word: 'なつ', zh: '夏天', kanji: '夏' },
    ]),
  ],
  printSet: {
    id: 'n5-c1-l2',
    title: '平假名練習紙：た行・な行・は行',
    kana: printKana(['た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ']),
  },
}

/* ── 第 3 課：ま行・や行・ら行・わ行・ん ───────────────── */

const lesson3: Lesson = {
  id: 'n5-c1-l3',
  title: '讀出ま行到ん',
  goal: '補完最後 16 個音，平假名 46 音全部讀得出來。',
  knowledgePoints: kanaOf('ま', 'や', 'ら', 'わ', 'ん').map(kpOf),
  minutes: 12,
  blocks: [
    {
      type: 'note',
      heading: '最後 16 個',
      paragraphs: [
        'や行只有三個音（ya・yu・yo），ら行五個，わ行兩個，再加一個單獨的「ん」。這 16 個拿下，平假名就完整了。',
        'や行缺的兩格不是被省略，是日文裡本來就沒有 yi 和 ye 這兩個音。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'ま行・や行・ら行・わ行・ん',
      columns: COLUMNS,
      rows: [
        row('ま行{まぎょう}', ['ま', 'み', 'む', 'め', 'も']),
        row('や行{やぎょう}', ['や', null, 'ゆ', null, 'よ']),
        row('ら行{らぎょう}', ['ら', 'り', 'る', 'れ', 'ろ']),
        row('わ行{わぎょう}', ['わ', null, null, null, 'を']),
        row('ん', ['ん', null, null, null, null]),
      ],
    },
    {
      type: 'warning',
      heading: '「を」和「ん」是特別的',
      paragraphs: [
        '「を」唸起來就是 o，跟「お」一模一樣。它只當助詞用，不會出現在單字裡——看到を，那一定是文法，不是字。',
        '「ん」是唯一不含母音的假名，也是唯一不能放在單字開頭的假名。日文接龍輸掉的人就是接出ん結尾的字。',
        '「る」和「ろ」的差別只在最後有沒有打那個結，跟「ぬ・ね」一樣是高頻混淆組。',
      ],
    },
    {
      type: 'examples',
      heading: '46 音全通之後',
      items: examples([
        ['やま', '山', 2, '山'],
        ['みみ', '耳朵', 2, '耳'],
        ['ゆき', '雪', 2, '雪'],
        ['ほん', '書', 1, '本'],
        ['みかん', '橘子', 1],
        ['くるま', '車子', 0, '車'],
        ['とり', '鳥', 0, '鳥'],
        ['よる', '晚上', 1, '夜'],
      ]),
    },
  ],
  questions: [
    kanaMatchQ('n5-c1-l3-q1', ['ま', 'ゆ', 'ら', 'れ', 'ん']),
    wordListenQ('n5-c1-l3-q2', 'くるま', 1, ['ろ', 'れ', 'ね'], '車子'),
    readQ('n5-c1-l3-q3', 'を', ['o', 'wa', 'ho']),
    writeQ('n5-c1-l3-q4', 'み', ['め', 'も', 'ま']),
    wordFillQ('n5-c1-l3-q5', 'やま', '山', 1, ['み', 'む', 'も']),
    wordMatchQ('n5-c1-l3-q6', [
      { word: 'ゆき', zh: '雪', kanji: '雪' },
      { word: 'ほん', zh: '書', kanji: '本' },
      { word: 'とり', zh: '鳥', kanji: '鳥' },
      { word: 'よる', zh: '晚上', kanji: '夜' },
    ]),
  ],
  printSet: {
    id: 'n5-c1-l3',
    title: '平假名練習紙：ま行・や行・ら行・わ行・ん',
    kana: printKana(['ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん']),
  },
}

/* ── 章尾試題 ───────────────────────────────────────────── */

/**
 * 題庫 18 題，每次抽 12 題（第一段沒有「舊內容」可抽，12 題全部來自這裡）。
 * 題庫要大於抽題數，重考才不會抽到同一份 —— 否則重考三次記住的是
 * 「第 3 題選 C」而不是假名。
 */
const quiz1: Quiz = {
  id: 'n5-c1-quiz1',
  title: '平假名 46 音驗收',
  lessonIds: [lesson1.id, lesson2.id, lesson3.id],
  bank: [
    kanaMatchQ('n5-c1-quiz1-b01', ['あ', 'き', 'す', 'て', 'の']),
    kanaMatchQ('n5-c1-quiz1-b02', ['は', 'み', 'ゆ', 'ろ', 'ん']),
    kanaMatchQ('n5-c1-quiz1-b03', ['え', 'く', 'そ', 'な', 'ま']),
    wordListenQ('n5-c1-quiz1-b04', 'こえ', 1, ['い', 'お', 'あ'], '聲音'),
    wordListenQ('n5-c1-quiz1-b05', 'ちかてつ', 0, ['し', 'つ', 'き'], '地鐵'),
    wordListenQ('n5-c1-quiz1-b06', 'ほし', 0, ['は', 'ま', 'も'], '星星'),
    wordListenQ('n5-c1-quiz1-b07', 'とり', 1, ['ろ', 'る', 'れ'], '鳥'),
    wordListenQ('n5-c1-quiz1-b08', 'みみ', 0, ['め', 'む', 'も'], '耳朵'),
    readQ('n5-c1-quiz1-b09', 'つ', ['tu', 'chi', 'su']),
    readQ('n5-c1-quiz1-b10', 'し', ['si', 'chi', 'su']),
    readQ('n5-c1-quiz1-b11', 'ふ', ['hu', 'bu', 'ho']),
    readQ('n5-c1-quiz1-b12', 'を', ['o', 'wa', 'ho']),
    writeQ('n5-c1-quiz1-b13', 'ぬ', ['ね', 'め', 'の']),
    writeQ('n5-c1-quiz1-b14', 'そ', ['ろ', 'る', 'さ']),
    writeQ('n5-c1-quiz1-b15', 'き', ['さ', 'ち', 'せ']),
    wordFillQ('n5-c1-quiz1-b16', 'すし', '壽司', 0, ['し', 'せ', 'そ']),
    wordFillQ('n5-c1-quiz1-b17', 'ちかてつ', '地鐵', 2, ['と', 'た', 'ち']),
    wordReadQ('n5-c1-quiz1-b18', 'くるま', '車子', ['電車', '腳踏車', '飛機'], '車'),
  ],
}

export const chapter1: Chapter = {
  id: 'n5-c1',
  order: 1,
  title: '讀出平假名',
  goal: '把 46 個平假名全部讀出來，並能讀出由它們組成的基本單字。',
  covers: ['平假名 46 音', '五十音圖的行與段', '高頻混淆組（ぬ・ね／る・ろ）', '「を」與「ん」的特殊性'],
  lessons: [lesson1, lesson2, lesson3],
  quizzes: [quiz1],
}
