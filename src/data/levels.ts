/**
 * 五個級別的組裝點。
 *
 * N4 到 N1 目前沒有大綱 —— 等實體課本到手再編，先用空殼佔位。
 * 憑印象生一份 60 章的假大綱只會製造「看起來有內容」的錯覺，
 * 之後每一章都要推翻重寫。
 */
import type { Level } from '../core/types'
import { chapter1 } from './n5/ch01-hiragana'
import { chapter2 } from './n5/ch02-katakana'
import { chapter3 } from './n5/ch03-noun-sentence'
import { chapter4 } from './n5/ch04-demonstratives'
import { chapter5 } from './n5/ch05-verbs-and-day'
import { chapter6 } from './n5/ch06-invitation'
import { chapter7 } from './n5/ch07-adjectives'
import { chapter8 } from './n5/ch08-location'
import { chapter9 } from './n5/ch09-giving'
import { chapter10 } from './n5/ch10-te-form'
import { chapter11 } from './n5/ch11-te-usage'
import { chapter12 } from './n5/ch12-nai-ta'
import { chapter13 } from './n5/ch13-dictionary-form'
import { chapter14 } from './n5/ch14-transitivity'
import { chapter15 } from './n5/ch15-plain-form'
import { chapter16 } from './n5/ch16-comparison'
import { chapter17 } from './n5/ch17-conversation'

export const n5: Level = {
  id: 'N5',
  title: 'N5',
  subtitle: '從零到讀得懂基本句子',
  hue: 160,
  chapters: [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9, chapter10, chapter11, chapter12, chapter13, chapter14, chapter15, chapter16, chapter17],
}

const placeholder = (
  id: Level['id'],
  subtitle: string,
  hue: number,
): Level => ({
  id,
  title: id,
  subtitle,
  hue,
  chapters: [],
  pending: true,
})

export const levels: Level[] = [
  n5,
  placeholder('N4', '日常對話與基本讀寫', 186),
  placeholder('N3', '銜接初級與中級', 212),
  placeholder('N2', '看得懂報導與說明', 258),
  placeholder('N1', '接近母語者的理解力', 292),
]

export const levelById = new Map(levels.map((l) => [l.id, l]))

/** 側欄與路由都要用「級別 → 章 → 節點」查找，先建好索引省得每次遍歷。 */
export const chapterById = new Map(
  levels.flatMap((l) => l.chapters.map((c) => [c.id, { level: l, chapter: c }] as const)),
)

export const lessonById = new Map(
  levels.flatMap((l) =>
    l.chapters.flatMap((c) =>
      c.lessons.map((lesson) => [lesson.id, { level: l, chapter: c, lesson }] as const),
    ),
  ),
)

export const quizById = new Map(
  levels.flatMap((l) =>
    l.chapters.flatMap((c) =>
      c.quizzes.map((quiz) => [quiz.id, { level: l, chapter: c, quiz }] as const),
    ),
  ),
)

/** 抽舊題用：某個試題之前的所有試題（跨章，依大綱順序）。 */
export function quizzesBefore(quizId: string) {
  const all = levels.flatMap((l) => l.chapters.flatMap((c) => c.quizzes))
  const i = all.findIndex((q) => q.id === quizId)
  return i <= 0 ? [] : all.slice(0, i)
}

/** 錯題本要跨所有題庫找題目 */
export function allQuestions() {
  return levels.flatMap((l) =>
    l.chapters.flatMap((c) => [
      ...c.lessons.flatMap((lesson) => lesson.questions),
      ...c.quizzes.flatMap((q) => q.bank),
    ]),
  )
}

/** 列印練習紙用：從所有課裡找出指定的 printSet。 */
export function findPrintSet(id: string) {
  for (const level of levels) {
    for (const chapter of level.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.printSet?.id === id) return { lesson, chapter, level, set: lesson.printSet }
      }
    }
  }
  return undefined
}
