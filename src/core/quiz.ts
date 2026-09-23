/**
 * 抽題與答案判定。純函式，沒有副作用。
 *
 * 試題是「加權累積」：本段的 3 課佔七成，先前學過的內容佔三成，
 * 而且舊題優先抽 SRS 熟悉度低的 —— 學完就忘的東西會自己回來找你。
 */
import type { Question, Quiz } from './types'
import type { ReviewRecord } from './srs'
import { QUIZ_QUESTIONS } from './progress'

/** 舊內容在一份試題裡佔幾題 */
export const CARRYOVER = 4

/** reorder 用 number[]（每個空格填第幾號選項），fill 用 string[]，match 用物件。 */
export type Answer = number | number[] | string[] | Record<string, string>

/* ── 洗牌 ───────────────────────────────────────────────── */

/**
 * 每次重考都重抽，不重複上一份。
 * 考卷式測驗重考三次之後，人記住的是「第 3 題選 C」而不是文法。
 */
function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 熟悉度越低排越前面。沒有紀錄的視為最生疏，優先考。 */
function byWeakness(questions: Question[], records: Map<string, ReviewRecord>): Question[] {
  const score = (q: Question) => {
    const levels = q.knowledgePoints.map((kp) => records.get(kp)?.familiarity ?? 0)
    return levels.length === 0 ? 0 : Math.min(...levels)
  }
  return questions.slice().sort((a, b) => score(a) - score(b))
}

export interface DrawInput {
  quiz: Quiz
  /** 這個試題之前的所有試題，用來抽舊題 */
  priorQuizzes: Quiz[]
  records: Map<string, ReviewRecord>
  rand?: () => number
}

/**
 * 抽出一份 12 題的試卷。
 * 舊題不足時（例如第一個試題段根本沒有「以前」）由本段補滿，
 * 不會因此少出題 —— 一份 12 題的卷子就該有 12 題。
 */
export function drawQuiz({
  quiz,
  priorQuizzes,
  records,
  rand = Math.random,
}: DrawInput): Question[] {
  const fresh = shuffle(quiz.bank, rand)

  const priorPool = priorQuizzes.flatMap((q) => q.bank)
  // 先照生疏度排序，再在同級之間洗牌，避免每次都抽到同幾題
  const weak = byWeakness(shuffle(priorPool, rand), records)
  const carry = weak.slice(0, Math.min(CARRYOVER, weak.length))

  const need = QUIZ_QUESTIONS - carry.length
  const picked = [...fresh.slice(0, need), ...carry]

  return shuffle(picked, rand)
}

/** 「只練上次錯的」用：從題庫裡撈出指定 id。 */
export function questionsById(banks: Question[], ids: string[]): Question[] {
  const index = new Map(banks.map((q) => [q.id, q]))
  return ids.map((id) => index.get(id)).filter((q): q is Question => Boolean(q))
}

/* ── 判定 ───────────────────────────────────────────────── */

export function checkAnswer(question: Question, answer: Answer | undefined): boolean {
  if (answer === undefined) return false

  switch (question.type) {
    case 'choice':
      return answer === question.answerIndex

    case 'fill': {
      if (!Array.isArray(answer)) return false
      if (answer.length !== question.answers.length) return false
      return question.answers.every((correct, i) => answer[i] === correct)
    }

    case 'match': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false
      return question.pairs.every((p) => answer[p.left] === p.right)
    }

    // 照 JLPT 的規則：只看 ★ 那一格填對沒有，其他格排錯不扣分。
    case 'reorder': {
      if (!Array.isArray(answer)) return false
      return answer[question.starIndex] === question.order[question.starIndex]
    }

    // 讀解與聽解目前都是四選一的外框，判定跟 choice 一樣
    case 'passage':
    case 'listening':
      return answer === question.answerIndex
  }
}

/** 一份答案卷的得分，0 到 1。 */
export function scoreOf(questions: Question[], answers: Map<string, Answer>): number {
  if (questions.length === 0) return 0
  const correct = questions.filter((q) => checkAnswer(q, answers.get(q.id))).length
  return correct / questions.length
}

export function wrongIds(questions: Question[], answers: Map<string, Answer>): string[] {
  return questions.filter((q) => !checkAnswer(q, answers.get(q.id))).map((q) => q.id)
}

/* ── 穩定洗牌 ───────────────────────────────────────────── */

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 依題目 id 決定的固定洗牌。
 *
 * 建構器產出的選項一律把正解放在第一個，所以顯示前必須打散；
 * 但不能用 Math.random —— 每次重繪選項就跳一次位置，
 * 使用者的滑鼠會點到剛剛看到的那一格已經換掉的選項。
 */
export function shuffleStable<T>(items: T[], seed: string): T[] {
  return shuffle(items, mulberry32(hash(seed)))
}

/** 答案是否已經填完整（填完才輪得到判定對錯）。 */
export function isComplete(question: Question, answer: Answer | undefined): boolean {
  if (answer === undefined) return false
  switch (question.type) {
    case 'choice':
      return typeof answer === 'number'
    case 'fill':
      return Array.isArray(answer) && answer.filter(Boolean).length === question.answers.length
    case 'match':
      return (
        typeof answer === 'object' &&
        !Array.isArray(answer) &&
        question.pairs.every((p) => Boolean(answer[p.left]))
      )
    // 星號那格填了就算填完是不夠的 —— 那等於鼓勵亂猜而不排句子。
    case 'reorder':
      return (
        Array.isArray(answer) &&
        answer.length === question.segments.length &&
        answer.every((v) => typeof v === 'number' && v >= 0)
      )
    case 'passage':
    case 'listening':
      return typeof answer === 'number'
  }
}
