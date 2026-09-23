/**
 * 間隔複習。MVP 用固定間隔，之後可換成 FSRS 而不動其他地方。
 * 純函式，沒有副作用 —— 這是它能被手機端共用的原因。
 */

/** 固定間隔（天）。熟悉度 0 到 5 對應索引。 */
const INTERVALS = [1, 3, 7, 14, 30, 90] as const

export type Familiarity = 0 | 1 | 2 | 3 | 4 | 5

export interface ReviewRecord {
  kpId: string
  familiarity: Familiarity
  /** ISO 日期字串 */
  nextReviewAt: string
  streak: number
}

const DAY_MS = 86_400_000

function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * DAY_MS).toISOString()
}

/** 答對往後推，答錯拉回來。答錯不歸零，退一級就好 —— 歸零會讓人放棄。 */
export function review(
  record: ReviewRecord,
  correct: boolean,
  now: Date = new Date(),
): ReviewRecord {
  const next = correct
    ? (Math.min(record.familiarity + 1, 5) as Familiarity)
    : (Math.max(record.familiarity - 1, 0) as Familiarity)

  return {
    kpId: record.kpId,
    familiarity: next,
    nextReviewAt: addDays(now, INTERVALS[next]),
    streak: correct ? record.streak + 1 : 0,
  }
}

export function createRecord(kpId: string, now: Date = new Date()): ReviewRecord {
  return { kpId, familiarity: 0, nextReviewAt: addDays(now, INTERVALS[0]), streak: 0 }
}

/**
 * 今天到期的知識點。
 *
 * 目前沒有畫面在用它 —— 原本的「今日複習」已經換成「練習試題」，
 * 因為學習者要複習會自己回去點那一課，系統排程的每日複習是多餘的一層。
 * 熟悉度本身還在用（練習試題優先抽生疏的、階段驗收抽舊題），
 * 這個函式留著是因為它是純函式、沒有成本，而且排程式複習之後可能會回來。
 */
export function due(records: ReviewRecord[], now: Date = new Date()): ReviewRecord[] {
  return records.filter((r) => new Date(r.nextReviewAt) <= now)
}
