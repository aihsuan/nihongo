/**
 * N5 第 2 章：讀出片假名與變音
 *
 * 六課，不是三課。這一章要涵蓋片假名 46 音、濁音半濁音、長音、促音、拗音
 * 與外來語轉寫規則 —— 六件事塞進三課，第三課會變成一堂塞了四個新概念的怪物課。
 *
 * 片假名的教法跟平假名不同：學習者已經知道這些音了，要練的是「同一個音的
 * 另一種字形」，所以主力題型是兩套文字互相配對，不是重新記一次讀音。
 *
 * 前三課的例詞受限於「只能用已經教過的假名」，而外來語幾乎都要用到長音與促音，
 * 所以真正像樣的單字量要到第 5 課之後才進得來。這是刻意的順序，不是偷懶。
 */
import type { Chapter, Lesson, Quiz, TableCell } from '../../core/types'
import { kana, romajiOf, rows } from './kana'
import {
  customChoiceQ,
  kanaMatchQ,
  kataReadQ,
  kataWriteQ,
  loanFillQ,
  loanMatchQ,
  scriptMatchQ,
  wordListenQ,
} from './builders'

const kataKp = (c: string) => `kata.${kana(c).kata}`

/** 片假名表的一格：片假名當主角，平假名退到提示裡。 */
const kataCell = (c: string | null): TableCell =>
  c === null
    ? { text: '' }
    : {
        text: kana(c).kata,
        romaji: kana(c).romaji,
        speak: kana(c).hira,
        hint: `平假名 ${kana(c).hira}`,
      }

/** 變音表：兩套文字並列，因為濁音對平假名也是新的。 */
const bothCell = (c: string | null): TableCell =>
  c === null
    ? { text: '' }
    : {
        text: `${kana(c).hira}・${kana(c).kata}`,
        romaji: kana(c).romaji,
        speak: kana(c).hira,
        hint: kana(c).hint,
      }

const COLUMNS = ['', 'ア段 a', 'イ段 i', 'ウ段 u', 'エ段 e', 'オ段 o']
const YOUON_COLUMNS = ['', '＋ゃ', '＋ゅ', '＋ょ']

const kataRow = (label: string, chars: (string | null)[]): TableCell[] => [
  { text: label },
  ...chars.map(kataCell),
]

const bothRow = (label: string, chars: (string | null)[]): TableCell[] => [
  { text: label },
  ...chars.map(bothCell),
]

const printKata = (chars: string[]) =>
  chars.map((c) => ({ char: kana(c).kata, romaji: kana(c).romaji }))

/** 外來語：[片假名, 中譯, 重音核]。外來語不用漢字，所以沒有 kanji 欄。 */
const loans = (items: [string, string, number][]) =>
  items.map(([jp, zh, accent]) => ({ jp, zh, accent, romaji: romajiOf(jp) }))

const kpOfRows = (...names: string[]) => rows(...names).map((k) => kataKp(k.hira))

/* ── 第 1 課：ア行・カ行・サ行 ─────────────────────────── */

const lesson1: Lesson = {
  id: 'n5-c2-l1',
  title: '讀出ア行到サ行',
  goal: '認出前 15 個片假名，並讀出「アイス」「ココア」這些外來語。',
  knowledgePoints: kpOfRows('あ', 'か', 'さ'),
  minutes: 10,
  blocks: [
    {
      type: 'note',
      heading: '片假名是同一批音的另一種寫法',
      paragraphs: [
        '好消息：你不必重新學發音。片假名和平假名是同一套 46 個音，只是字形不同——ア 就是 あ，カ 就是 か。要記的只有字形。',
        '片假名專門用來寫外來語（コーヒー、テレビ）、外國人名地名、擬聲擬態語，以及要強調的字。看到一串片假名，多半是從英文或其他語言搬過來的詞，唸出來常常就猜得到意思。',
        '字形比平假名硬、直線多——平假名是草書來的，片假名是取漢字的一個部件，所以稜角分明。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'ア行・カ行・サ行',
      columns: COLUMNS,
      rows: [
        kataRow('ア行{あぎょう}', ['あ', 'い', 'う', 'え', 'お']),
        kataRow('カ行{かぎょう}', ['か', 'き', 'く', 'け', 'こ']),
        kataRow('サ行{さぎょう}', ['さ', 'し', 'す', 'せ', 'そ']),
      ],
    },
    {
      type: 'warning',
      heading: '這一批最容易混的兩組',
      paragraphs: [
        'ア 和 マ（下一課會學到）長得很像，差別在 ア 的第二筆是往左下撇，マ 是往右下。',
        'シ 和 ツ（下一課）是初學者第一個大坑：シ 的兩點在左上、最後一筆由下往上挑；ツ 的兩點在上方、最後一筆由上往下撇。方向相反。',
      ],
    },
    {
      type: 'examples',
      heading: '只用這 15 個音就能讀的外來語',
      items: loans([
        ['アイス', '冰、冰淇淋', 1],
        ['ココア', '可可、熱可可', 0],
        ['カカオ', '可可豆', 0],
        ['スイス', '瑞士', 1],
        ['オアシス', '綠洲', 1],
        ['アクセス', '存取、連線', 1],
      ]),
    },
  ],
  questions: [
    scriptMatchQ('n5-c2-l1-q1', ['あ', 'か', 'さ', 'き', 'す']),
    wordListenQ('n5-c2-l1-q2', 'ココア', 0, ['ソ', 'ク', 'キ'], '可可'),
    kataReadQ('n5-c2-l1-q3', 'し', ['si', 'chi', 'su']),
    kataWriteQ('n5-c2-l1-q4', 'せ', ['さ', 'そ', 'き']),
    loanFillQ('n5-c2-l1-q5', 'アイス', '冰淇淋', 1, ['エ', 'オ', 'ウ']),
    loanMatchQ('n5-c2-l1-q6', [
      { word: 'ココア', zh: '可可' },
      { word: 'スイス', zh: '瑞士' },
      { word: 'カカオ', zh: '可可豆' },
      { word: 'アイス', zh: '冰淇淋' },
    ]),
  ],
  printSet: {
    id: 'n5-c2-l1',
    title: '片假名練習紙：ア行・カ行・サ行',
    kana: printKata(['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ']),
  },
}

/* ── 第 2 課：タ行・ナ行・ハ行 ─────────────────────────── */

const lesson2: Lesson = {
  id: 'n5-c2-l2',
  title: '讀出タ行到ハ行',
  goal: '再拿下 15 個片假名，並分辨 シ・ツ 和 ソ・ン 這兩組經典陷阱。',
  knowledgePoints: kpOfRows('た', 'な', 'は'),
  minutes: 12,
  blocks: [
    {
      type: 'note',
      heading: '接下來三行',
      paragraphs: [
        '這 15 個裡有兩個是片假名最惡名昭彰的混淆組。先把它們的筆順方向記住，之後就不會每次都要猜。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'タ行・ナ行・ハ行',
      columns: COLUMNS,
      rows: [
        kataRow('タ行{たぎょう}', ['た', 'ち', 'つ', 'て', 'と']),
        kataRow('ナ行{なぎょう}', ['な', 'に', 'ぬ', 'ね', 'の']),
        kataRow('ハ行{はぎょう}', ['は', 'ひ', 'ふ', 'へ', 'ほ']),
      ],
    },
    {
      type: 'warning',
      heading: 'シ・ツ 與 ソ・ン',
      paragraphs: [
        'シ（shi）的兩點在左側上下排開，第三筆從左下往右上挑。ツ（tsu）的兩點在上方並排，第三筆從右上往左下撇。記法：シ 的筆畫像在「往上」，ツ 像在「往下」。',
        'ソ（so）和 ン（n，下一課）同理：ソ 的第二筆由上往下撇，ン 由下往上挑。四個字其實是同一組規則的兩次應用。',
        'ヌ 和 ス 也常被搞混：ヌ 多一撇。',
      ],
    },
    {
      type: 'examples',
      heading: '現在能讀的外來語',
      items: loans([
        ['テスト', '測驗、考試', 1],
        ['テニス', '網球', 1],
        ['ネクタイ', '領帶', 1],
        ['ツナ', '鮪魚', 1],
        ['タイ', '泰國', 1],
        ['ハイテク', '高科技', 0],
      ]),
    },
  ],
  questions: [
    scriptMatchQ('n5-c2-l2-q1', ['た', 'に', 'ふ', 'ね', 'ほ']),
    wordListenQ('n5-c2-l2-q2', 'ツナ', 0, ['ス', 'シ', 'チ'], '鮪魚'),
    kataReadQ('n5-c2-l2-q3', 'ふ', ['hu', 'bu', 'ho']),
    kataWriteQ('n5-c2-l2-q4', 'ぬ', ['ね', 'の', 'に']),
    loanFillQ('n5-c2-l2-q5', 'テニス', '網球', 0, ['チ', 'ツ', 'ト']),
    loanMatchQ('n5-c2-l2-q6', [
      { word: 'テスト', zh: '測驗' },
      { word: 'ネクタイ', zh: '領帶' },
      { word: 'ツナ', zh: '鮪魚' },
      { word: 'タイ', zh: '泰國' },
    ]),
  ],
  printSet: {
    id: 'n5-c2-l2',
    title: '片假名練習紙：タ行・ナ行・ハ行',
    kana: printKata(['た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ']),
  },
}

/* ── 第 3 課：マ行・ヤ行・ラ行・ワ行・ン ───────────────── */

const lesson3: Lesson = {
  id: 'n5-c2-l3',
  title: '讀出マ行到ン',
  goal: '補完片假名 46 音，能讀出「ホテル」「カメラ」這類日常外來語。',
  knowledgePoints: kpOfRows('ま', 'や', 'ら', 'わ', 'ん'),
  minutes: 12,
  blocks: [
    {
      type: 'note',
      heading: '最後 16 個',
      paragraphs: [
        '補完這 16 個，片假名就完整了。ヲ 幾乎不會出現——助詞用平假名的を，片假名的ヲ 只在極少數設計性的場合看得到。',
        '這一課結束，你就能讀出街上招牌和菜單上大部分的外來語了。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: 'マ行・ヤ行・ラ行・ワ行・ン',
      columns: COLUMNS,
      rows: [
        kataRow('マ行{まぎょう}', ['ま', 'み', 'む', 'め', 'も']),
        kataRow('ヤ行{やぎょう}', ['や', null, 'ゆ', null, 'よ']),
        kataRow('ラ行{らぎょう}', ['ら', 'り', 'る', 'れ', 'ろ']),
        kataRow('ワ行{わぎょう}', ['わ', null, null, null, 'を']),
        kataRow('ン', ['ん', null, null, null, null]),
      ],
    },
    {
      type: 'warning',
      heading: '三組收尾的陷阱',
      paragraphs: [
        'ン（n）和 ソ（so）：ン 的第二筆由下往上挑，ソ 由上往下撇。跟上一課的 シ・ツ 是同一組規則。',
        'ロ（ro）和 口（漢字的「口」）字形一樣，靠上下文分辨。',
        'ル（ru）和 レ（re）差在 ル 多了左邊那一豎。',
      ],
    },
    {
      type: 'examples',
      heading: '46 音全通之後',
      items: loans([
        ['ホテル', '飯店', 1],
        ['トイレ', '廁所', 1],
        ['カメラ', '相機', 1],
        ['メロン', '哈密瓜', 1],
        ['レモン', '檸檬', 1],
        ['ワイン', '葡萄酒', 1],
        ['アニメ', '動畫', 0],
        ['メモ', '筆記、備忘', 1],
      ]),
    },
  ],
  questions: [
    scriptMatchQ('n5-c2-l3-q1', ['ま', 'ゆ', 'ら', 'れ', 'ん']),
    wordListenQ('n5-c2-l3-q2', 'ホテル', 2, ['ロ', 'レ', 'ネ'], '飯店'),
    kataReadQ('n5-c2-l3-q3', 'ん', ['m', 'nu', 'ni']),
    kataWriteQ('n5-c2-l3-q4', 'み', ['め', 'も', 'ま']),
    loanFillQ('n5-c2-l3-q5', 'メロン', '哈密瓜', 1, ['ラ', 'ル', 'レ']),
    loanMatchQ('n5-c2-l3-q6', [
      { word: 'ホテル', zh: '飯店' },
      { word: 'トイレ', zh: '廁所' },
      { word: 'ワイン', zh: '葡萄酒' },
      { word: 'カメラ', zh: '相機' },
    ]),
  ],
  printSet: {
    id: 'n5-c2-l3',
    title: '片假名練習紙：マ行・ヤ行・ラ行・ワ行・ン',
    kana: printKata(['ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'を', 'ん']),
  },
}

/* ── 第 4 課：濁音與半濁音 ─────────────────────────────── */

const lesson4: Lesson = {
  id: 'n5-c2-l4',
  title: '唸出濁音與半濁音',
  goal: '看到兩點或一個圈就知道聲帶要不要震動，讀出「テレビ」「パン」。',
  knowledgePoints: rows('が', 'ざ', 'だ', 'ば', 'ぱ').flatMap((k) => [`kana.${k.hira}`, kataKp(k.hira)]),
  minutes: 14,
  blocks: [
    {
      type: 'note',
      heading: '兩個符號，25 個新音',
      paragraphs: [
        '濁點（゛，兩點）和半濁點（゜，一個圈）不是新字，是加在已經會的字右上角的符號。か 加兩點變 が，は 加一個圈變 ぱ。',
        '規則對平假名和片假名完全一樣，所以這一課兩套文字一起學——字形你都已經認得了，要記的只有「哪幾行可以加」。',
        '可以加濁點的只有 か・さ・た・は 四行；半濁點只有 は 行能加。其他行沒有。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: '濁音・半濁音',
      columns: COLUMNS,
      rows: [
        bothRow('ガ行{がぎょう}', ['が', 'ぎ', 'ぐ', 'げ', 'ご']),
        bothRow('ザ行{ざぎょう}', ['ざ', 'じ', 'ず', 'ぜ', 'ぞ']),
        bothRow('ダ行{だぎょう}', ['だ', 'ぢ', 'づ', 'で', 'ど']),
        bothRow('バ行{ばぎょう}', ['ば', 'び', 'ぶ', 'べ', 'ぼ']),
        bothRow('パ行{ぱぎょう}', ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ']),
      ],
    },
    {
      type: 'warning',
      heading: '三個要注意的地方',
      paragraphs: [
        'じ 和 ぢ 現在唸法完全一樣（ji），ず 和 づ 也一樣（zu）。現代日文幾乎只用 じ 和 ず，ぢ・づ 只出現在少數複合詞裡（例如 はなぢ 鼻血）。先記 じ・ず 就好。',
        'は 行是唯一能加半濁點的一行，這是因為 h、b、p 在發音上本來就是同一個位置的三種狀態。',
        '平假名的濁音不需要另外練筆順——字形你已經會了，只是多兩點。所以這一課的練習紙只印片假名。',
      ],
    },
    {
      type: 'examples',
      heading: '有濁音半濁音才寫得出來的詞',
      items: loans([
        ['テレビ', '電視', 1],
        ['バス', '公車', 1],
        ['パン', '麵包', 1],
        ['ビル', '大樓', 1],
        ['ラジオ', '收音機', 1],
        ['ピアノ', '鋼琴', 0],
        ['ズボン', '長褲', 2],
        ['バナナ', '香蕉', 1],
      ]),
    },
  ],
  questions: [
    kanaMatchQ('n5-c2-l4-q1', ['が', 'ざ', 'だ', 'ば', 'ぱ']),
    scriptMatchQ('n5-c2-l4-q2', ['ぎ', 'じ', 'で', 'ぼ', 'ぷ']),
    customChoiceQ(
      'n5-c2-l4-q3',
      ['kana.ぱ', 'kana.ば'],
      '「は」加上一個圈（半濁點）會變成哪一個？',
      ['ぱ', 'ば', 'ほ', 'ぼ'],
      'は 加半濁點（゜）是 ぱ，加濁點（゛）才是 ば。半濁點只有は行能加。',
    ),
    kataReadQ('n5-c2-l4-q4', 'じ', ['zi', 'chi', 'di']),
    loanFillQ('n5-c2-l4-q5', 'テレビ', '電視', 2, ['ヒ', 'ピ', 'ミ']),
    loanMatchQ('n5-c2-l4-q6', [
      { word: 'バス', zh: '公車' },
      { word: 'パン', zh: '麵包' },
      { word: 'ピアノ', zh: '鋼琴' },
      { word: 'ラジオ', zh: '收音機' },
    ]),
  ],
  printSet: {
    id: 'n5-c2-l4',
    title: '片假名練習紙：濁音・半濁音',
    kana: printKata([
      'が', 'ぎ', 'ぐ', 'げ', 'ご',
      'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
      'だ', 'で', 'ど',
      'ば', 'び', 'ぶ', 'べ', 'ぼ',
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    ]),
  },
}

/* ── 第 5 課：長音與促音 ───────────────────────────────── */

const lesson5: Lesson = {
  id: 'n5-c2-l5',
  title: '唸出長音與促音',
  goal: '把「ビル」和「ビール」分開，把「カプ」和「カップ」分開——這兩組差一拍就是不同的字。',
  knowledgePoints: ['kana.ー', 'kana.っ', 'mora.length'],
  minutes: 14,
  blocks: [
    {
      type: 'note',
      heading: '日文是按「拍」在數的',
      paragraphs: [
        '日語的節奏單位叫「拍」（モーラ），每一拍長度相同。長音和促音的作用就是多佔一拍——它們不發出新的聲音，但那一拍必須存在。',
        '對中文母語者來說這是最難改的習慣：中文沒有這種等時長的拍子，所以我們很自然會把長音唸短、把促音吞掉，結果整個詞就變成另一個字。',
        '「ビル」（大樓，2 拍）和「ビール」（啤酒，3 拍）就是這樣。差的不是發音，是拍數。',
      ],
    },
    {
      type: 'table',
      heading: '兩個符號',
      columns: ['符號', '名稱', '作用', '例'],
      rows: [
        [
          { text: 'ー' },
          { text: '長音符' },
          { text: '把前一拍的母音拉長一拍' },
          { text: 'ビール', romaji: 'biiru', speak: 'ビール' },
        ],
        [
          { text: 'ッ' },
          { text: '促音（小{ちい}さいツ）' },
          { text: '停一拍，然後把下一個子音重複' },
          { text: 'カップ', romaji: 'kappu', speak: 'カップ' },
        ],
      ],
    },
    {
      type: 'warning',
      heading: '三條規則',
      paragraphs: [
        '片假名的長音一律寫成「ー」。平假名不用這個符號，平假名是把母音再寫一次（おかあさん、おとうさん）。',
        '促音的「ッ」要寫得比一般的「ツ」小，而且它永遠不會出現在詞的開頭或結尾。',
        '促音後面只接 か・さ・た・ぱ 行。你不會看到「ッな」或「ッま」這種組合。',
      ],
    },
    {
      type: 'examples',
      heading: '長音促音的日常詞',
      items: loans([
        ['コーヒー', '咖啡', 3],
        ['ノート', '筆記本', 1],
        ['ケーキ', '蛋糕', 1],
        ['チーズ', '起司', 1],
        ['スポーツ', '運動', 2],
        ['サッカー', '足球', 1],
        ['カップ', '杯子', 1],
        ['ベッド', '床', 1],
      ]),
    },
  ],
  questions: [
    customChoiceQ(
      'n5-c2-l5-q1',
      ['mora.length'],
      '「コーヒー」有幾拍？',
      ['4 拍', '3 拍', '5 拍', '2 拍'],
      'コ・ー・ヒ・ー，四拍。長音符自己就佔一拍，不能跟前一個字算成同一拍。',
      'コーヒー',
    ),
    customChoiceQ(
      'n5-c2-l5-q2',
      ['kana.っ'],
      '「カップ」裡的小「ッ」要怎麼唸？',
      ['停一拍，然後把下一個子音重複', '唸成 tsu', '不發音也不停頓', '把前面的母音拉長'],
      'ッ 不發出聲音，但要停滿一拍，然後下一個子音（這裡是 p）重複。カップ 是 ka-p-pu 三拍。',
      'カップ',
    ),
    loanFillQ('n5-c2-l5-q3', 'ケーキ', '蛋糕', 1, ['ッ', 'イ', 'エ']),
    loanFillQ('n5-c2-l5-q4', 'サッカー', '足球', 1, ['ツ', 'ー', 'ク']),
    customChoiceQ(
      'n5-c2-l5-q5',
      ['mora.length'],
      '「ビル」和「ビール」差在哪裡？',
      [
        'ビール 的第二拍要拉長，兩個是不同的字（大樓／啤酒）',
        '完全一樣，只是寫法不同',
        '只有重音不同，意思一樣',
        'ビル 才是要拉長的那一個',
      ],
      'ビル 是大樓（2 拍），ビール 是啤酒（3 拍）。把長音唸短是中文母語者最常犯的錯，而且會直接變成另一個字。',
    ),
    loanMatchQ('n5-c2-l5-q6', [
      { word: 'コーヒー', zh: '咖啡' },
      { word: 'ノート', zh: '筆記本' },
      { word: 'スポーツ', zh: '運動' },
      { word: 'ベッド', zh: '床' },
    ]),
  ],
}

/* ── 第 6 課：拗音與外來語規則 ─────────────────────────── */

const lesson6: Lesson = {
  id: 'n5-c2-l6',
  title: '唸出拗音，並看懂外來語的轉寫規則',
  goal: '把「きゃ」當成一拍而不是兩拍，並猜得出英文詞會被寫成什麼樣子。',
  knowledgePoints: rows('きゃ', 'しゃ', 'ちゃ', 'にゃ', 'ひゃ', 'みゃ', 'りゃ', 'ぎゃ', 'じゃ', 'びゃ', 'ぴゃ').map(
    (k) => `kana.${k.hira}`,
  ),
  minutes: 15,
  blocks: [
    {
      type: 'note',
      heading: '兩個假名，一拍',
      paragraphs: [
        '拗音是「イ段的字」加上小寫的ゃ・ゅ・ょ。き＋ゃ＝きゃ，寫起來兩個字，唸起來只有一拍。',
        '這是拗音唯一的難點。「きゃく（客）」是兩拍，「きやく（規約）」是三拍——寫法只差一個字的大小，意思完全不同。',
        '能接拗音的只有イ段：き・し・ち・に・ひ・み・り，加上它們的濁音半濁音 ぎ・じ・び・ぴ。',
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: '拗音（清音）',
      columns: YOUON_COLUMNS,
      rows: [
        bothRow('き', ['きゃ', 'きゅ', 'きょ']),
        bothRow('し', ['しゃ', 'しゅ', 'しょ']),
        bothRow('ち', ['ちゃ', 'ちゅ', 'ちょ']),
        bothRow('に', ['にゃ', 'にゅ', 'にょ']),
        bothRow('ひ', ['ひゃ', 'ひゅ', 'ひょ']),
        bothRow('み', ['みゃ', 'みゅ', 'みょ']),
        bothRow('り', ['りゃ', 'りゅ', 'りょ']),
      ],
    },
    {
      type: 'table',
      variant: 'kana',
      heading: '拗音（濁音・半濁音）',
      columns: YOUON_COLUMNS,
      rows: [
        bothRow('ぎ', ['ぎゃ', 'ぎゅ', 'ぎょ']),
        bothRow('じ', ['じゃ', 'じゅ', 'じょ']),
        bothRow('び', ['びゃ', 'びゅ', 'びょ']),
        bothRow('ぴ', ['ぴゃ', 'ぴゅ', 'ぴょ']),
      ],
    },
    {
      type: 'warning',
      heading: '外來語的四條轉寫規則',
      paragraphs: [
        '英文的 -er、-ar、-or 結尾變成長音「ー」：computer → コンピューター、guitar → ギター。',
        '英文的子音結尾要補一個母音：bus → バス、test → テスト。補哪個母音有慣例：t 和 d 補 o，其他多半補 u。',
        '英文的短促子音群常變成促音「ッ」：bed → ベッド、cup → カップ。',
        'L 和 R 在日文裡都變成ラ行：light 和 right 寫出來都是ライト。這是日本人學英文的痛點，反過來也是你猜外來語時的陷阱。',
      ],
    },
    {
      type: 'examples',
      heading: '拗音的外來語',
      items: loans([
        ['シャツ', '襯衫', 1],
        ['ジュース', '果汁', 1],
        ['キャベツ', '高麗菜', 1],
        ['ニュース', '新聞', 1],
        ['ジャム', '果醬', 1],
        ['シャワー', '淋浴', 1],
        ['チョコレート', '巧克力', 3],
        ['ミュージック', '音樂', 1],
      ]),
    },
  ],
  questions: [
    kanaMatchQ('n5-c2-l6-q1', ['きゃ', 'しゅ', 'ちょ', 'にゅ', 'りょ']),
    scriptMatchQ('n5-c2-l6-q2', ['じゃ', 'ぎゅ', 'びょ', 'ひゃ', 'みゅ']),
    customChoiceQ(
      'n5-c2-l6-q3',
      ['kana.きゃ', 'mora.length'],
      '「きゃく」和「きやく」差在哪裡？',
      [
        'きゃく 是兩拍，きやく 是三拍，是不同的字',
        '完全一樣，只是ゃ 寫大寫小而已',
        'きゃく 才是三拍',
        '只有重音不同',
      ],
      'きゃく（客）的き＋小ゃ 合成一拍，全詞兩拍；きやく（規約）的や 是正常大小，自己一拍，全詞三拍。',
    ),
    loanFillQ('n5-c2-l6-q4', 'ジュース', '果汁', 1, ['ユ', 'ョ', 'ャ']),
    customChoiceQ(
      'n5-c2-l6-q5',
      ['loan.rule'],
      '英文的 -er 結尾（例如 computer）在日文裡通常寫成什麼？',
      ['長音「ー」：コンピューター', '促音「ッ」', '拗音「ャ」', '撥音「ン」'],
      '-er、-ar、-or 這類結尾一律轉成長音符「ー」。這條規則讓你看到片假名時反推得回英文。',
    ),
    loanMatchQ('n5-c2-l6-q6', [
      { word: 'シャツ', zh: '襯衫' },
      { word: 'ニュース', zh: '新聞' },
      { word: 'キャベツ', zh: '高麗菜' },
      { word: 'チョコレート', zh: '巧克力' },
    ]),
  ],
  printSet: {
    id: 'n5-c2-l6',
    title: '片假名練習紙：拗音',
    kana: printKata([
      'きゃ', 'きゅ', 'きょ',
      'しゃ', 'しゅ', 'しょ',
      'ちゃ', 'ちゅ', 'ちょ',
      'にゅ', 'ひゃ', 'みゅ', 'りゅ',
      'ぎゅ', 'じゃ', 'じゅ', 'じょ', 'びょ', 'ぴょ',
    ]),
  },
}

/* ── 兩個階段驗收 ───────────────────────────────────────── */

const quiz1: Quiz = {
  id: 'n5-c2-quiz1',
  title: '片假名 46 音驗收',
  lessonIds: [lesson1.id, lesson2.id, lesson3.id],
  bank: [
    scriptMatchQ('n5-c2-quiz1-b01', ['あ', 'き', 'す', 'て', 'の']),
    scriptMatchQ('n5-c2-quiz1-b02', ['は', 'み', 'ゆ', 'ろ', 'ん']),
    scriptMatchQ('n5-c2-quiz1-b03', ['え', 'く', 'そ', 'な', 'ま']),
    wordListenQ('n5-c2-quiz1-b04', 'オアシス', 2, ['ツ', 'ソ', 'ン'], '綠洲'),
    wordListenQ('n5-c2-quiz1-b05', 'ツナ', 0, ['シ', 'ソ', 'ン'], '鮪魚'),
    wordListenQ('n5-c2-quiz1-b06', 'ワイン', 2, ['ソ', 'シ', 'ツ'], '葡萄酒'),
    wordListenQ('n5-c2-quiz1-b07', 'アニメ', 1, ['ヌ', 'メ', 'ミ'], '動畫'),
    wordListenQ('n5-c2-quiz1-b08', 'ホテル', 0, ['ハ', 'マ', 'モ'], '飯店'),
    kataReadQ('n5-c2-quiz1-b09', 'つ', ['tu', 'shi', 'su']),
    kataReadQ('n5-c2-quiz1-b10', 'ふ', ['hu', 'bu', 'ho']),
    kataReadQ('n5-c2-quiz1-b11', 'り', ['ru', 're', 'ra']),
    kataReadQ('n5-c2-quiz1-b12', 'ん', ['m', 'nu', 'ni']),
    kataWriteQ('n5-c2-quiz1-b13', 'そ', ['ん', 'し', 'つ']),
    kataWriteQ('n5-c2-quiz1-b14', 'る', ['ろ', 'れ', 'ね']),
    kataWriteQ('n5-c2-quiz1-b15', 'ね', ['ぬ', 'の', 'に']),
    loanFillQ('n5-c2-quiz1-b16', 'ホテル', '飯店', 2, ['レ', 'ロ', 'ラ']),
    loanFillQ('n5-c2-quiz1-b17', 'カメラ', '相機', 1, ['ヌ', 'ス', 'マ']),
    loanMatchQ('n5-c2-quiz1-b18', [
      { word: 'テニス', zh: '網球' },
      { word: 'トイレ', zh: '廁所' },
      { word: 'ワイン', zh: '葡萄酒' },
      { word: 'アニメ', zh: '動畫' },
    ]),
  ],
}

const quiz2: Quiz = {
  id: 'n5-c2-quiz2',
  title: '濁音・長音・促音・拗音驗收',
  lessonIds: [lesson4.id, lesson5.id, lesson6.id],
  bank: [
    kanaMatchQ('n5-c2-quiz2-b01', ['が', 'ざ', 'だ', 'ば', 'ぱ']),
    kanaMatchQ('n5-c2-quiz2-b02', ['きゃ', 'しゅ', 'ちょ', 'にゅ', 'りょ']),
    scriptMatchQ('n5-c2-quiz2-b03', ['ぎ', 'じ', 'で', 'ぼ', 'ぷ']),
    scriptMatchQ('n5-c2-quiz2-b04', ['じゃ', 'ぎゅ', 'びょ', 'ひゃ', 'みゅ']),
    kataReadQ('n5-c2-quiz2-b05', 'じ', ['zi', 'chi', 'di']),
    kataReadQ('n5-c2-quiz2-b06', 'ぷ', ['bu', 'fu', 'hu']),
    kataReadQ('n5-c2-quiz2-b07', 'しょ', ['syo', 'so', 'cho']),
    kataWriteQ('n5-c2-quiz2-b08', 'ぴ', ['び', 'ひ', 'み']),
    kataWriteQ('n5-c2-quiz2-b09', 'ちゅ', ['つ', 'ちょ', 'しゅ']),
    customChoiceQ(
      'n5-c2-quiz2-b10',
      ['mora.length'],
      '「スポーツ」有幾拍？',
      ['4 拍', '3 拍', '5 拍', '6 拍'],
      'ス・ポ・ー・ツ，四拍。長音符佔一拍。',
      'スポーツ',
    ),
    customChoiceQ(
      'n5-c2-quiz2-b11',
      ['mora.length'],
      '「ベッド」有幾拍？',
      ['3 拍', '2 拍', '4 拍', '1 拍'],
      'ベ・ッ・ド，三拍。促音不發聲，但要停滿一拍。',
      'ベッド',
    ),
    customChoiceQ(
      'n5-c2-quiz2-b12',
      ['kana.ぱ'],
      '半濁點（゜）可以加在哪一行？',
      ['は行', 'か行', 'さ行', 'た行'],
      '只有は行能加半濁點，變成ぱ行。か・さ・た・は 四行能加濁點，但半濁點只有は行。',
    ),
    customChoiceQ(
      'n5-c2-quiz2-b13',
      ['loan.rule'],
      '英文 bed 寫成日文是哪一個？',
      ['ベッド', 'ベド', 'ベード', 'ベット'],
      '短促的子音群轉成促音「ッ」，字尾的 d 補上母音 o，所以是ベッド。',
      'ベッド',
    ),
    customChoiceQ(
      'n5-c2-quiz2-b14',
      ['loan.rule'],
      'light 和 right 寫成片假名會是什麼情形？',
      ['兩個都寫成ライト', 'light 是ライト，right 是ライト以外', '兩個都寫成ラート', '日文不寫這兩個詞'],
      'L 和 R 在日文裡都歸到ラ行，所以 light 和 right 寫出來一模一樣，只能靠上下文分辨。',
    ),
    loanFillQ('n5-c2-quiz2-b15', 'コーヒー', '咖啡', 1, ['ッ', 'オ', 'ウ']),
    loanFillQ('n5-c2-quiz2-b16', 'キャベツ', '高麗菜', 1, ['ヤ', 'ュ', 'ョ']),
    loanFillQ('n5-c2-quiz2-b17', 'テレビ', '電視', 2, ['ヒ', 'ピ', 'ミ']),
    loanMatchQ('n5-c2-quiz2-b18', [
      { word: 'ジュース', zh: '果汁' },
      { word: 'サッカー', zh: '足球' },
      { word: 'ピアノ', zh: '鋼琴' },
      { word: 'シャツ', zh: '襯衫' },
    ]),
  ],
}

export const chapter2: Chapter = {
  id: 'n5-c2',
  order: 2,
  title: '讀出片假名與變音',
  goal: '讀得出外來語，並分辨濁音、半濁音、長音、促音與拗音。',
  covers: [
    '片假名 46 音',
    '濁音・半濁音',
    '長音（ー）',
    '促音（ッ）',
    '拗音（ゃゅょ）',
    '外來語的轉寫規則',
    '拍（モーラ）的概念',
  ],
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6],
  quizzes: [quiz1, quiz2],
}
