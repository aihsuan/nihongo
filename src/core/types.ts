/**
 * NihonGo 核心型別
 * 這一層不依賴 Vue、不依賴瀏覽器 API，之後手機端可以原樣帶走。
 */

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

/** 知識點分類 */
export type KnowledgeKind = 'kana' | 'vocab' | 'grammar' | 'kanji'

/**
 * 全站所有內容都指向知識點。這是整個系統的樞紐：
 * 教材說「我教了這些」，題目說「我考這些」，SRS 追蹤的也是這些。
 */
export interface KnowledgePoint {
  id: string
  kind: KnowledgeKind
  level: JlptLevel
  /** 顯示用短標籤，例如「〜てください」 */
  label: string
}

/* ── 教材內容 ───────────────────────────────────────────── */

/**
 * 教材是結構化區塊，不是 Markdown。
 * 理由有二：假名表要能點擊發音（Markdown 塞不進互動），
 * 以及程式要知道這一課教了哪些知識點才抽得出題。
 */
export type ContentBlock =
  | NoteBlock
  | TableBlock
  | ExamplesBlock
  | SentencesBlock
  | KanjiBlock
  | WarningBlock

export interface NoteBlock {
  type: 'note'
  heading?: string
  /**
   * 每個元素是一段。可以用兩種行內標記：
   * `先生{せんせい}` 振り仮名、`**這裡**` 強調。
   * 兩種都由 `src/core/inline.ts` 解析成結構化段落，不是 HTML。
   */
  paragraphs: string[]
}

/** 假名表／活用表。儲存格可帶 speak 欄位，點了就唸。 */
export interface TableBlock {
  type: 'table'
  heading?: string
  columns: string[]
  rows: TableCell[][]
  /**
   * 'kana' 是五十音那種字形表，格子用 28px 的大字。
   * 其他表格（活用、例句、規則對照）用內文字級。
   *
   * 這個欄位本來是用「文字長度」猜的，但兩個方向都會猜錯 ——
   * 「そして」三個字被當成假名放大，「きゃ・キャ」五個字被當成句子縮小。
   * 猜不準的事就讓資料明說。
   */
  variant?: 'kana' | 'text'
  /**
   * 第一欄是不是「列標題」（あ行、量詞、類別…）。預設是。
   *
   * 列標題會畫成 th：灰底、不可點、也不會有發音按鈕。
   * 但有些表的第一欄是真的內容 —— 羅馬字對照表第一欄放的就是假名，
   * 被當成列標題的話那一整欄就啞了，而且和同一列其他欄長得不一樣。
   *
   * 這個欄位本來是用「第 0 欄」硬猜的。猜錯的代價是使用者以為畫面壞了，
   * 而且不會有任何檢查抓到 —— 跟 variant 當初用文字長度猜字級是同一種錯。
   */
  rowHeader?: boolean
}

export interface TableCell {
  /** 主要顯示的字 */
  text: string
  /** 羅馬字。受全域羅馬字開關控制，關掉就不顯示。 */
  romaji?: string
  /** 點擊朗讀的內容；沒有這個欄位的儲存格不可點 */
  speak?: string
  /** 字源記憶提示，例如「め 像女生的眼睛」 */
  hint?: string
}

export interface ExamplesBlock {
  type: 'examples'
  heading?: string
  items: ExampleItem[]
  /**
   * 以「漢字＋振り仮名」呈現，而不是只給假名。
   * 假名兩章維持 false（那兩章的前提就是你只認得假名），
   * 第 3 章起打開 —— 從那裡開始才有漢字可教。
   */
  furigana?: boolean
}

export interface ExampleItem {
  /** 日文原句／單字（假名） */
  jp: string
  romaji?: string
  /** 中譯 */
  zh: string
  /**
   * 漢字寫法。假名章不顯示它 —— 那幾章的前提就是「你只認得假名」，
   * 突然冒出「傘」會讓人以為自己漏學了東西。
   * 它存在是為了朗讀：把漢字餵給 TTS，字典才挑得到正確的聲調。
   * 純假名的「はし」它只會猜一個讀法，箸和橋分不出來。
   */
  kanji?: string
  /**
   * 高低アクセント的重音核位置：0 平板、1 頭高、n 為第 n 拍後下降。
   * 這個欄位現在就要填，不是因為現在要教 —— 是因為等 45 課寫完才回頭補，
   * 那是回頭改幾百筆資料。
   */
  accent?: number
}

/**
 * 例句。從第 3 章起這是教材的主力 —— 前兩章教的是字，之後教的是句子。
 * jp 用振り仮名標記（`先生{せんせい}`），漢字讀不出來不該卡住文法的學習。
 */
export interface SentencesBlock {
  type: 'sentences'
  heading?: string
  items: SentenceItem[]
}

export interface SentenceItem {
  /** 日文句子，含振り仮名標記 */
  jp: string
  /** 中譯 */
  zh: string
  /** 補充說明，例如「這裡的は唸 wa」 */
  note?: string
}

/**
 * 漢字卡。音読み片假名、訓読み平假名，照辭典慣例。
 * 資料由 data 層從 kanji.ts 展開後帶進來，元件不自己去查表。
 */
export interface KanjiBlock {
  type: 'kanji'
  heading?: string
  items: KanjiItem[]
}

export interface KanjiItem {
  char: string
  zh: string
  on: string[]
  kun: string[]
  /** 用到這個字的詞 */
  words: { jp: string; reading: string; zh: string }[]
}

export interface WarningBlock {
  type: 'warning'
  heading?: string
  paragraphs: string[]
}

/* ── 題目 ───────────────────────────────────────────────── */

/**
 * 六種題型，全部有實作。
 *
 * 其中 reorder／passage／listening 是照 JLPT 的大題做的：
 * reorder 對「句子語法2 句子的組織」、passage 對「文章語法」與「讀解」、
 * listening 對「聽解」。它們曾經是只定義不實作的空殼，
 * 留著空殼是對的 —— 上一版連空殼都沒有，整份大綱就漏掉了考試四個科目裡的三個。
 *
 * match 和 fill 不是 JLPT 的形式（考試全部都是四選一），但學的時候有用，
 * 所以留在隨堂練習；階段驗收從第 3 章起只出考試會出現的形式。
 */
export type QuestionType =
  | 'match'
  | 'choice'
  | 'fill'
  | 'reorder'
  | 'passage'
  | 'listening'

export interface BaseQuestion {
  id: string
  /** 這題考哪些知識點。SRS 與加權抽題都看這個欄位。 */
  knowledgePoints: string[]
  /** 答錯時顯示的解析。每一題都必須有，沒有解析的題目只是在罰人。 */
  explanation: string
}

/** 四選一 */
export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice'
  prompt: string
  /** 題幹要朗讀的內容，例如聽音選字 */
  speak?: string
  options: string[]
  answerIndex: number
}

/** 連線配對：左欄對右欄 */
export interface MatchQuestion extends BaseQuestion {
  type: 'match'
  prompt: string
  pairs: { left: string; right: string; speak?: string }[]
}

/**
 * 填空。作答方式是「從候選中點選填入」而非打字 ——
 * 使用者的電腦不一定裝了日文輸入法，打字會直接卡死初學者。
 */
export interface FillQuestion extends BaseQuestion {
  type: 'fill'
  /** 用 ___ 標示空格的句子 */
  prompt: string
  /** 候選字，含正解與誘答 */
  bank: string[]
  /** 依序填入每個空格的正解 */
  answers: string[]
}

/**
 * 句子組織。對應 JLPT「句子語法2」（もんだい2）。
 *
 * 這不是一般的拖曳排序 —— JLPT 的作答方式很特別，而且會影響判分：
 * 題幹有四個空格，其中一格印著 ★；你要先把四個選項排成通順的句子，
 * 然後回答「★ 那一格是幾號」。**計分只看星號那一格**，排錯其他格不扣分，
 * 全部排對卻看錯星號位置一樣算錯。
 *
 * 所以它實際上仍是四選一，只是要先在腦中排完句子才選得出來。
 * 這裡照考試的規則判分；訂正畫面會把完整正確語序顯示出來，該教的還是有教到。
 */
export interface ReorderQuestion extends BaseQuestion {
  type: 'reorder'
  /** 題幹。用 ＿＿ 標出空格，數量必須等於 segments 的長度。 */
  prompt: string
  /** 四個選項，依畫面上印的 1〜4 順序。 */
  segments: string[]
  /** 正確語序，值是 segments 的索引。例如 [2, 0, 1, 3]。 */
  order: number[]
  /** ★ 落在第幾個空格（0 起算）。正解就是 order[starIndex]。 */
  starIndex: number
}

/**
 * 短文閱讀。對應「文章語法」「內容理解」與「信息檢索」。
 *
 * 文章語法（もんだい3）是一篇短文挖好幾個空格，每格各自四選一。
 * 這裡讓每一題各自帶完整的短文，而不是把一篇文章和五題綁成一組 ——
 * 試題是隨機抽的，綁成一組的話抽中一題就得整組帶進來，
 * 一份 12 題的卷子會突然變成 16 題。短文裡的空格全部標號，
 * 題幹指名問哪一格，所以單獨出現也讀得通。
 */
export interface PassageQuestion extends BaseQuestion {
  type: 'passage'
  /** 短文本體。含振り仮名標記；挖空處用（1）（2）標號。 */
  passage: string
  /** 短文的標題或情境說明，例如「Aクラスの みなさんへ」 */
  passageTitle?: string
  prompt: string
  options: string[]
  answerIndex: number
}

/**
 * 聽力。對應「問題理解」「重點理解」「即時應答」。
 *
 * **選項一律是文字，不用圖片。** 考試的「問題理解」和「語言表達」有一部分
 * 是四張插圖選一張，那需要上百張原創插畫，不是寫程式補得起來的洞 ——
 * 與其畫幾張劣質的敷衍過去，不如明說本站不練那兩種，考前請用官方問題集。
 * exam.ts 裡那兩個大題的 questionTypes 會留空，讓洞留在畫面上。
 */
export interface ListeningQuestion extends BaseQuestion {
  type: 'listening'
  /** 唸出來的內容；畫面上不顯示，否則就變成閱讀測驗了 */
  speak: string
  /**
   * 對話題要分兩個人唸，語音才分得出誰在講。
   * 有這個欄位時忽略 speak，照陣列依序播放。
   */
  script?: { who: 'A' | 'B'; text: string }[]
  /** 題目文字，例如「男の人は なにを かいますか」。可以顯示，因為考試也會唸兩次。 */
  prompt: string
  options: string[]
  answerIndex: number
}

export type Question =
  | ChoiceQuestion
  | MatchQuestion
  | FillQuestion
  | ReorderQuestion
  | PassageQuestion
  | ListeningQuestion

/* ── 課程結構 ───────────────────────────────────────────── */

/** 一課：教材 + 6 題隨堂練習，約 10 分鐘。 */
export interface Lesson {
  id: string
  /** can-do 句，不是文法名稱 */
  title: string
  /** 一句話說明學完能做到什麼 */
  goal: string
  knowledgePoints: string[]
  blocks: ContentBlock[]
  /** 固定 6 題。門檻是最終全對。 */
  questions: Question[]
  /** 可列印練習紙的範圍；沒有這個欄位就不顯示列印入口 */
  printSet?: PrintSet
  minutes: number
  /**
   * 對應《完全掌握 N5 文法問題対策》的單元號，顯示在課名旁邊。
   * 大綱和課本對不上的話，這個平台就從學習主線退化成附屬練習工具。
   */
  bookUnit?: number
}

/** 列印練習紙：第一頁描紅、第二頁聽寫 */
export interface PrintSet {
  id: string
  title: string
  /** 要練的假名，依列印順序 */
  kana: { char: string; romaji: string }[]
}

/**
 * 每 3 課結尾的試題。12 題，本段約 8 題、舊內容 4 題。
 * bank 要有 18 題以上，重考才抽得出不重複的題目。
 */
export interface Quiz {
  id: string
  title: string
  /** 這個試題段涵蓋的課 */
  lessonIds: string[]
  bank: Question[]
}

/** 大綱上的一個可點節點 */
export type NodeKind = 'lesson' | 'quiz'

export interface Chapter {
  id: string
  order: number
  /** 章名用文法主題，例如「動詞分類與て形」 */
  title: string
  /** 一句話說明這章要解決什麼 */
  goal: string
  /** 涵蓋的文法清單，顯示在章首與「準備中」頁 */
  covers: string[]
  /**
   * 本章教的漢字。漢字跟著該章的單字走，不另開漢字章 ——
   * 脫離語境單獨背漢字是最沒效率的學法，而兩章一百個字會變成沒人想爬的山。
   */
  kanji?: string[]
  /** 本章涵蓋《完全掌握 N5》的哪幾個單元 */
  bookUnits?: number[]
  /**
   * 本章有、但《完全掌握 N5》沒有的項目。
   * 照書補齊還不夠 —— 那本書自己也漏了幾個標準 N5 項目
   * （てもいいです、てはいけません、なければなりません、比較、たら），
   * 所以「照書」是把書當骨幹，不是把書當上限。
   */
  beyondBook?: string[]
  /** 課數必為 3 的倍數；每 3 課結尾一個試題 */
  lessons: Lesson[]
  quizzes: Quiz[]
  /** 尚未撰寫內容的章。側欄標「準備中」，點進去是預告頁。 */
  pending?: true
}

export interface Level {
  id: JlptLevel
  title: string
  subtitle: string
  /** 側欄色票用的色相 */
  hue: number
  chapters: Chapter[]
  /** 整個級別都還沒編大綱（N4-N1 目前如此） */
  pending?: true
}

/* ── 進度 ───────────────────────────────────────────────── */

/** 一課的進度。完成條件是 6 題最終全對。 */
export interface LessonProgress {
  lessonId: string
  /** 首答答對題數，供自我檢視；不影響是否打勾 */
  firstTryCorrect: number
  total: number
  completedAt: string | null
}

/** 一個試題段的進度。門檻 80%，可無限重考取最高分。 */
export interface QuizProgress {
  quizId: string
  /** 歷來最高分，0 到 1 */
  bestScore: number
  attempts: number
  /** 最近一次答錯的題目 id，供「只練上次錯的」 */
  lastWrongIds: string[]
  completedAt: string | null
}

/** 側欄節點的兩種狀態。沒有 locked —— 全部可點是刻意的設計。 */
export type NodeState = 'completed' | 'open'
