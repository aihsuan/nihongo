/**
 * JLPT 的出題大題，以及我們的題型對應到哪幾個。
 *
 * 這個檔案存在的唯一理由是「讓洞看得見」。
 * 上一版大綱漏掉了考試四個科目裡的三個（文字語彙的漢字、讀解、聽解），
 * 而漏掉的原因就是沒有任何地方列出「考試到底考什麼」。
 *
 * 注意：JLPT 從 2010 年起不再公布官方文法表，官方只給「認定の目安」。
 * 大題形式則是公布的，所以這一份是有依據的，文法分級那一份沒有。
 */
import type { JlptLevel, QuestionType } from './types'

export type ExamSection = '文字・語彙' | '文法' | '讀解' | '聽解'

export interface ExamTask {
  id: string
  section: ExamSection
  title: string
  /** 哪些級別考這個大題 */
  levels: JlptLevel[]
  /** 我們用哪種題型練它；空陣列代表還沒有對應的題型 */
  questionTypes: QuestionType[]
  /**
   * 為什麼沒有涵蓋。只有 questionTypes 是空的才需要填。
   *
   * 「沒做」和「不做」是兩件事，畫面上要分得出來：
   * 插圖題是決定不做（考前請用官方問題集），中篇讀解是還沒寫。
   * 不寫明的話，使用者會以為只要等更新就好。
   */
  gap?: string
}

const ALL: JlptLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5']
const N5_UP: JlptLevel[] = ['N2', 'N3', 'N4', 'N5']

export const EXAM_TASKS: ExamTask[] = [
  { id: 'kanji-read', section: '文字・語彙', title: '漢字讀法', levels: ALL, questionTypes: ['choice'] },
  { id: 'kanji-write', section: '文字・語彙', title: '漢字書寫', levels: N5_UP, questionTypes: ['choice'] },
  { id: 'word-form', section: '文字・語彙', title: '詞語構成', levels: ['N2'], questionTypes: [], gap: '只有 N2 考，N2 大綱還沒編' },
  { id: 'context', section: '文字・語彙', title: '前後關係', levels: ALL, questionTypes: ['fill', 'choice'] },
  { id: 'paraphrase', section: '文字・語彙', title: '近義替換', levels: ALL, questionTypes: ['choice'] },
  { id: 'usage', section: '文字・語彙', title: '用法', levels: ['N1', 'N2', 'N3', 'N4'], questionTypes: ['choice'] },

  { id: 'grammar-form', section: '文法', title: '句子語法1（語法形式的判斷）', levels: ALL, questionTypes: ['choice', 'fill'] },
  { id: 'grammar-order', section: '文法', title: '句子語法2（句子的組織）', levels: ALL, questionTypes: ['reorder'] },
  { id: 'grammar-text', section: '文法', title: '文章語法', levels: ALL, questionTypes: ['passage'] },

  { id: 'read-short', section: '讀解', title: '內容理解（短篇）', levels: ALL, questionTypes: ['passage'] },
  // passage 型別做得到中篇，但目前寫的短文全是告示和三、四行的作文。
  // 只要有 passage 就打勾會高報成「已經練到」，所以這一格照實留空。
  { id: 'read-mid', section: '讀解', title: '內容理解（中篇）', levels: ALL, questionTypes: [], gap: '目前的短文都是短篇，中篇（約 250 字）還沒寫' },
  { id: 'read-long', section: '讀解', title: '內容理解（長篇）', levels: ['N1', 'N3'], questionTypes: ['passage'] },
  { id: 'read-integrate', section: '讀解', title: '綜合理解', levels: ['N1', 'N2'], questionTypes: [], gap: '只有 N1、N2 考，大綱還沒編' },
  { id: 'read-thesis', section: '讀解', title: '論點理解（長篇）', levels: ['N1', 'N2'], questionTypes: [], gap: '只有 N1、N2 考，大綱還沒編' },
  { id: 'read-search', section: '讀解', title: '信息檢索', levels: ALL, questionTypes: ['passage'] },

  { id: 'listen-task', section: '聽解', title: '問題理解', levels: ALL, questionTypes: ['listening'] },
  { id: 'listen-point', section: '聽解', title: '重點理解', levels: ALL, questionTypes: ['listening'] },
  { id: 'listen-gist', section: '聽解', title: '概要理解', levels: ['N1', 'N2', 'N3'], questionTypes: ['listening'] },
  // 語言表達（発話表現）是看圖選該說哪句話，整個大題建立在插圖上。
  // 本站不做圖片選項題（理由見 types.ts 的 ListeningQuestion），所以這一格空著，
  // 空著就會在覆蓋率畫面上顯示成缺口 —— 這比畫幾張劣圖假裝有練到誠實。
  { id: 'listen-express', section: '聽解', title: '語言表達', levels: ['N3', 'N4', 'N5'], questionTypes: [], gap: '選項是插圖，本站不做；考前請用官方問題集' },
  { id: 'listen-reply', section: '聽解', title: '即時應答', levels: ALL, questionTypes: ['listening'] },
  { id: 'listen-integrate', section: '聽解', title: '綜合理解', levels: ['N1', 'N2'], questionTypes: [], gap: '只有 N1、N2 考，大綱還沒編' },
]

export function tasksFor(level: JlptLevel): ExamTask[] {
  return EXAM_TASKS.filter((t) => t.levels.includes(level))
}

/** 一組題目涵蓋了該級別的哪些大題，以及還缺哪些。 */
export function examCoverage(level: JlptLevel, used: QuestionType[]) {
  const set = new Set(used)
  const tasks = tasksFor(level)
  const covered = tasks.filter(
    (t) => t.questionTypes.length > 0 && t.questionTypes.some((q) => set.has(q)),
  )
  return { tasks, covered, missing: tasks.filter((t) => !covered.includes(t)) }
}
