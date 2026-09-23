/**
 * 解鎖規則與進度計算。純函式。
 *
 * 這裡沒有「鎖」—— 所有課與試題永遠可點。大綱式課程平台靠進度條推動，
 * 不靠鎖；硬鎖會氣走有基礎的人，而軟鎖只是把同一件事做得比較囉嗦。
 */
import type {
  Chapter,
  Lesson,
  LessonProgress,
  Level,
  Quiz,
  QuizProgress,
} from './types'

/** 單課門檻：6 題最終全對。錯了可以當場訂正，但每一題都得弄懂。 */
export const LESSON_PASS = 1

/** 試題門檻：12 題答對 10 題。試題混了舊內容，要求全對沒有人達得到。 */
export const QUIZ_PASS = 0.8

/** 單課固定題數 */
export const LESSON_QUESTIONS = 6

/** 一個試題段的題數 */
export const QUIZ_QUESTIONS = 12

/** 每幾課結尾放一個試題 */
export const QUIZ_EVERY = 3

export interface Progress {
  lessons: Map<string, LessonProgress>
  quizzes: Map<string, QuizProgress>
}

export function emptyProgress(): Progress {
  return { lessons: new Map(), quizzes: new Map() }
}

export function isLessonDone(lesson: Lesson, p: Progress): boolean {
  return Boolean(p.lessons.get(lesson.id)?.completedAt)
}

export function isQuizDone(quiz: Quiz, p: Progress): boolean {
  return Boolean(p.quizzes.get(quiz.id)?.completedAt)
}

/**
 * 章進度的分母含試題。
 * 「第 8 章 6/7」會很刺眼，那個刺眼是對的 —— 它在說這三課你其實沒吸收。
 */
export function chapterTotal(chapter: Chapter): number {
  return chapter.lessons.length + chapter.quizzes.length
}

export function chapterDone(chapter: Chapter, p: Progress): number {
  const lessons = chapter.lessons.filter((l) => isLessonDone(l, p)).length
  const quizzes = chapter.quizzes.filter((q) => isQuizDone(q, p)).length
  return lessons + quizzes
}

export function chapterCompletion(chapter: Chapter, p: Progress): number {
  const total = chapterTotal(chapter)
  return total === 0 ? 0 : chapterDone(chapter, p) / total
}

export function levelTotal(level: Level): number {
  return level.chapters.reduce((n, c) => n + chapterTotal(c), 0)
}

export function levelDone(level: Level, p: Progress): number {
  return level.chapters.reduce((n, c) => n + chapterDone(c, p), 0)
}

export function levelCompletion(level: Level, p: Progress): number {
  const total = levelTotal(level)
  return total === 0 ? 0 : levelDone(level, p) / total
}

/** 課與試題依大綱順序交錯排出來，就是側欄那一串節點。 */
export type OutlineNode =
  | { kind: 'lesson'; lesson: Lesson; chapter: Chapter }
  | { kind: 'quiz'; quiz: Quiz; chapter: Chapter }

/** 每 QUIZ_EVERY 課後插入該段的試題。 */
export function chapterNodes(chapter: Chapter): OutlineNode[] {
  const out: OutlineNode[] = []
  chapter.lessons.forEach((lesson, i) => {
    out.push({ kind: 'lesson', lesson, chapter })
    const segment = (i + 1) / QUIZ_EVERY
    if (Number.isInteger(segment)) {
      const quiz = chapter.quizzes[segment - 1]
      if (quiz) out.push({ kind: 'quiz', quiz, chapter })
    }
  })
  return out
}

export function levelNodes(level: Level): OutlineNode[] {
  return level.chapters.flatMap(chapterNodes)
}

/** 總覽頁那顆「繼續學習」要跳去哪：第一個還沒完成的節點。 */
export function nextNode(level: Level, p: Progress): OutlineNode | null {
  const nodes = levelNodes(level)
  const found = nodes.find((n) =>
    n.kind === 'lesson' ? !isLessonDone(n.lesson, p) : !isQuizDone(n.quiz, p),
  )
  return found ?? null
}

/** 單課是否過關：最終全對。 */
export function lessonPassed(correct: number, total: number): boolean {
  return total > 0 && correct / total >= LESSON_PASS
}

/** 試題是否過關 */
export function quizPassed(score: number): boolean {
  return score >= QUIZ_PASS
}
