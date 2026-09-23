/**
 * 網址與課程結構的對應。
 *
 * 網址用序號（/n5/8/2）而不是內部 id（/n5/n5-c8/n5-c8-l2）：
 * 前者看得懂、打得出來、貼給別人也知道是第幾章第幾課。
 */
import type { Chapter, Lesson, Level, Quiz } from '../core/types'
import { levels } from './levels'

export const levelPath = (level: Level) => `/${level.id.toLowerCase()}`

export const chapterPath = (level: Level, chapter: Chapter) =>
  `${levelPath(level)}/${chapter.order}`

export const lessonPath = (level: Level, chapter: Chapter, lesson: Lesson) =>
  `${chapterPath(level, chapter)}/${chapter.lessons.indexOf(lesson) + 1}`

export const quizPath = (level: Level, chapter: Chapter, quiz: Quiz) =>
  `${chapterPath(level, chapter)}/quiz/${chapter.quizzes.indexOf(quiz) + 1}`

export function findLevel(param: string | string[]): Level | undefined {
  const id = String(param).toUpperCase()
  return levels.find((l) => l.id === id)
}

export function findChapter(level: Level | undefined, param: string | string[]) {
  return level?.chapters.find((c) => c.order === Number(param))
}

export function findLesson(chapter: Chapter | undefined, param: string | string[]) {
  return chapter?.lessons[Number(param) - 1]
}

export function findQuiz(chapter: Chapter | undefined, param: string | string[]) {
  return chapter?.quizzes[Number(param) - 1]
}
