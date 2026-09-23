/**
 * 內容檢查。純函式，不依賴 Vue 或瀏覽器。
 *
 * 型別檢查抓不到的是「內容寫錯」：選項重複、正解不在候選裡、
 * 題幹三個空格但只給兩個正解、題庫不夠重抽用。
 * 這些錯誤要等到使用者做到那一題才會發現，所以開發模式下每次啟動就跑一次。
 */
import type { Chapter, Level, Question } from '../core/types'
import { morae } from '../core/mora'
import { LESSON_QUESTIONS, QUIZ_EVERY } from '../core/progress'
import { THEMES, THEME_LABEL, THEME_STATUS, VOCAB, vocabKp, byTheme } from './n5/vocab'
import { KANJI, hasKanji } from './n5/kanji'

/** 題庫要大於抽題數，重考才抽得出不重複的題目 */
const MIN_BANK = 18

/**
 * 內容裡不該出現的文字系統。
 *
 * 這條檢查是踩到坑之後才加的：第 13 章的例句裡混進了西里爾字母
 *（「музыкを 聞きます」），型別檢查、建置、渲染全部沒有異常 ——
 * 它就只是靜靜地錯在那裡，等使用者讀到。
 * 介面是繁中、內容是日文，其他文字系統一律是打錯字。
 */
const FOREIGN_SCRIPT = /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F\uAC00-\uD7AF]/

function checkText(text: string, where: string, push: (m: string) => void) {
  const m = text.match(FOREIGN_SCRIPT)
  if (m) push(`${where}：內容含有不該出現的文字「${m[0]}」（${text.slice(0, 30)}…）`)
}

function checkQuestion(q: Question, seen: Set<string>, push: (m: string) => void) {
  if (seen.has(q.id)) push(`重複的題目 id：${q.id}`)
  seen.add(q.id)

  if (!q.explanation || q.explanation.length < 5) push(`${q.id}：解析太短或沒有`)
  checkText(q.explanation, q.id, push)
  if ('prompt' in q) checkText(q.prompt, q.id, push)
  if ('options' in q) q.options.forEach((o) => checkText(o, q.id, push))
  if (q.knowledgePoints.length === 0) push(`${q.id}：沒有標知識點，SRS 與抽題都會漏掉它`)

  switch (q.type) {
    case 'choice':
    case 'listening':
    case 'passage': {
      if (q.options.length !== 4) push(`${q.id}：選項 ${q.options.length} 個，應為 4`)
      if (new Set(q.options).size !== q.options.length) push(`${q.id}：選項有重複`)
      if (q.answerIndex < 0 || q.answerIndex >= q.options.length) push(`${q.id}：answerIndex 越界`)
      break
    }
    case 'fill': {
      if (new Set(q.bank).size !== q.bank.length) push(`${q.id}：候選字有重複`)
      for (const a of q.answers) {
        if (!q.bank.includes(a)) push(`${q.id}：正解「${a}」不在候選裡，這題永遠答不對`)
      }
      const blanks = (q.prompt.match(/___/g) ?? []).length
      if (blanks !== q.answers.length) {
        push(`${q.id}：題幹有 ${blanks} 個空格，正解卻有 ${q.answers.length} 個`)
      }
      break
    }
    case 'match': {
      const lefts = q.pairs.map((p) => p.left)
      const rights = q.pairs.map((p) => p.right)
      if (new Set(lefts).size !== lefts.length) push(`${q.id}：左欄有重複`)
      if (new Set(rights).size !== rights.length) push(`${q.id}：右欄有重複，會有兩個格子都對`)
      if (q.pairs.length < 3) push(`${q.id}：配對少於 3 組，猜也會中`)
      break
    }
    case 'reorder': {
      const n = q.segments.length
      if (n !== 4) push(`${q.id}：句子組織題固定四個選項，這題有 ${n} 個`)
      if (q.order.length !== n) push(`${q.id}：正解長度與選項數不符`)
      if (new Set(q.order).size !== n || q.order.some((i) => i < 0 || i >= n)) {
        push(`${q.id}：order 不是 segments 的一個排列`)
      }
      if (q.starIndex < 0 || q.starIndex >= n) push(`${q.id}：starIndex 超出範圍`)
      const blanks = q.prompt.split('＿＿').length - 1
      if (blanks !== n) push(`${q.id}：題幹有 ${blanks} 個 ＿＿，但有 ${n} 個選項`)
      // 選項照正解順序印出來的話，不用排也知道答案 —— 這是寫題目時最容易犯的錯
      if (q.order.every((v, i) => v === i)) push(`${q.id}：選項就照正解順序排，等於送分`)
      break
    }
    case 'passage': {
      if (q.options.length !== 4) push(`${q.id}：讀解題固定四個選項`)
      if (q.passage.length < 40) push(`${q.id}：短文太短（${q.passage.length} 字），撐不起閱讀題`)
      break
    }
    case 'listening': {
      if (q.options.length !== 4) push(`${q.id}：聽解題固定四個選項`)
      if (!q.script && !q.speak.trim()) push(`${q.id}：沒有要唸的內容`)
      if (q.script && q.script.length < 2) push(`${q.id}：對話題至少要兩句`)
      // 正解出現在音檔裡是正常的（課題理解本來就是聽出對方說了什麼），
      // 但出現在**題目文字**裡就是把答案印在螢幕上了。
      if (q.options.some((o) => q.prompt.includes(o))) push(`${q.id}：選項文字出現在題目文字裡`)
      break
    }
  }
}

function checkChapter(chapter: Chapter, seen: Set<string>, prints: Set<string>, push: (m: string) => void) {
  if (chapter.pending) {
    if (chapter.lessons.length > 0 || chapter.quizzes.length > 0) {
      push(`${chapter.id}：標記為準備中，卻有課或試題`)
    }
    return
  }

  if (chapter.lessons.length % QUIZ_EVERY !== 0) {
    push(`${chapter.id}：${chapter.lessons.length} 課，不是 ${QUIZ_EVERY} 的倍數`)
  }
  const expected = chapter.lessons.length / QUIZ_EVERY
  if (chapter.quizzes.length !== expected) {
    push(`${chapter.id}：有 ${chapter.quizzes.length} 個試題段，應為 ${expected}`)
  }

  for (const lesson of chapter.lessons) {
    if (lesson.questions.length !== LESSON_QUESTIONS) {
      push(`${lesson.id}：${lesson.questions.length} 題，應為 ${LESSON_QUESTIONS}`)
    }
    lesson.questions.forEach((q) => checkQuestion(q, seen, push))

    if (lesson.printSet) {
      if (prints.has(lesson.printSet.id)) push(`${lesson.id}：printSet id 重複`)
      prints.add(lesson.printSet.id)
      if (lesson.printSet.kana.length === 0) push(`${lesson.id}：printSet 沒有任何假名`)
    }

    checkText(lesson.title, lesson.id, push)
    checkText(lesson.goal, lesson.id, push)

    for (const block of lesson.blocks) {
      if (block.heading) checkText(block.heading, lesson.id, push)
      if (block.type === 'note' || block.type === 'warning') {
        block.paragraphs.forEach((p) => checkText(p, lesson.id, push))
      }
      if (block.type === 'sentences') {
        block.items.forEach((it) => {
          checkText(it.jp, lesson.id, push)
          checkText(it.zh, lesson.id, push)
        })
      }
      if (block.type === 'table') {
        block.rows.flat().forEach((c) => checkText(c.text, lesson.id, push))
      }
      if (block.type !== 'examples') continue
      for (const item of block.items) {
        if (item.accent === undefined) continue
        const n = morae(item.jp).length
        if (item.accent < 0 || item.accent > n) {
          push(`${lesson.id}：「${item.jp}」的 accent ${item.accent} 超出拍數 ${n}`)
        }
      }
    }
  }

  // 已經有內容的章，宣告的漢字必須都有資料，否則漢字卡會在打開課頁時炸掉
  for (const char of chapter.kanji ?? []) {
    if (!hasKanji(char)) push(`${chapter.id}：宣告了漢字「${char}」，但 kanji.ts 裡還沒有它的資料`)
  }

  for (const quiz of chapter.quizzes) {
    if (quiz.bank.length < MIN_BANK) {
      push(`${quiz.id}：題庫只有 ${quiz.bank.length} 題，重考會抽到同一份（需要 ${MIN_BANK} 題以上）`)
    }
    quiz.bank.forEach((q) => checkQuestion(q, seen, push))
  }
}

export function lintContent(levels: Level[]): string[] {
  const problems: string[] = []
  const seenIds = new Set<string>()
  const seenPrints = new Set<string>()
  const push = (m: string) => problems.push(m)

  for (const level of levels) {
    for (const chapter of level.chapters) {
      checkChapter(chapter, seenIds, seenPrints, push)
    }
  }
  return problems
}

/* ── 單字涵蓋率 ─────────────────────────────────────────── */

export interface ThemeCoverage {
  theme: string
  label: string
  /** 清單本身收齊了沒。draft 的涵蓋率不能當最終數字看。 */
  status: 'draft' | 'complete'
  total: number
  practised: number
  /** 還沒在任何一課出現過的字 */
  missing: string[]
}

/** 一個字算「練過」的條件：有題目指向它的知識點，或出現在某課的例詞裡。 */
function practisedWords(levels: Level[]): Set<string> {
  const hit = new Set<string>()

  const scanQuestion = (q: Question) => {
    for (const kp of q.knowledgePoints) hit.add(kp)
  }

  for (const level of levels) {
    for (const chapter of level.chapters) {
      for (const lesson of chapter.lessons) {
        lesson.questions.forEach(scanQuestion)
        for (const block of lesson.blocks) {
          if (block.type !== 'examples') continue
          for (const item of block.items) hit.add(vocabKp(item.jp))
        }
      }
      for (const quiz of chapter.quizzes) quiz.bank.forEach(scanQuestion)
    }
  }
  return hit
}

/**
 * 十個主題各練到幾個字。
 *
 * 這份報告的用途跟 exam.ts 一樣 —— 讓洞看得見。
 * 目標是十個主題全部練過一輪，不做這個報告的話，
 * 寫到第十章才會發現「服裝」那組從頭到尾沒出現過。
 */
export function vocabCoverage(levels: Level[]): ThemeCoverage[] {
  const hit = practisedWords(levels)

  return THEMES.map((theme) => {
    const words = byTheme(theme)
    const missing = words.filter((v) => !hit.has(vocabKp(v.kana))).map((v) => v.kana)
    return {
      theme,
      label: THEME_LABEL[theme],
      status: THEME_STATUS[theme],
      total: words.length,
      practised: words.length - missing.length,
      missing,
    }
  })
}

/**
 * 假名相同的單字（はな＝鼻／花）。
 * 它們共用同一個知識點 `word.はな` —— 對 SRS 來說可以接受（同音詞一起複習合理），
 * 但涵蓋率會把兩個算成一個，而且 vocabMatchQ 用假名會挑錯，所以要看得見。
 */
export function duplicateKana(): { kana: string; words: string[] }[] {
  const byKana = new Map<string, string[]>()
  for (const v of VOCAB) {
    byKana.set(v.kana, [...(byKana.get(v.kana) ?? []), v.kanji ?? v.zh])
  }
  return [...byKana.entries()]
    .filter(([, ws]) => ws.length > 1)
    .map(([kana, words]) => ({ kana, words }))
}

/**
 * 漢字寫法相同的單字。
 * `vocabMatchQ` 允許用漢字當選擇器，所以漢字撞名會讓選擇器失效
 * （兩個都對到，只好拋錯）。同音詞可以共存，同形詞不行。
 */
export function duplicateKanji(): { kanji: string; words: string[] }[] {
  const byKanji = new Map<string, string[]>()
  for (const v of VOCAB) {
    if (!v.kanji) continue
    byKanji.set(v.kanji, [...(byKanji.get(v.kanji) ?? []), v.kana])
  }
  return [...byKanji.entries()]
    .filter(([, ws]) => ws.length > 1)
    .map(([kanji, words]) => ({ kanji, words }))
}

export function vocabSummary(levels: Level[]): string {
  const rows = vocabCoverage(levels)
  const practised = rows.reduce((n, r) => n + r.practised, 0)
  const drafts = rows.filter((r) => r.status === 'draft').length
  return (
    `單字涵蓋率 ${practised} / ${VOCAB.length}` +
    (drafts > 0 ? `（${drafts} 個主題的清單本身還沒收齊，這個比例會再變動）` : '')
  )
}

/* ── 漢字進度 ───────────────────────────────────────────── */

/**
 * 大綱宣告了幾個漢字、實際寫了幾個。
 * 準備中的章宣告了字卻還沒寫資料是正常的，所以這是進度報告不是錯誤。
 */
export function kanjiProgress(levels: Level[]) {
  const declared = new Set<string>()
  for (const level of levels) {
    for (const chapter of level.chapters) {
      for (const char of chapter.kanji ?? []) declared.add(char)
    }
  }
  const missing = [...declared].filter((c) => !hasKanji(c))
  return { declared: declared.size, written: KANJI.length, missing }
}
