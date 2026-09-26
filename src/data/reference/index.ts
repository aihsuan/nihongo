/**
 * 速查區的入口。
 *
 * 一個分類就是一頁，該類的表全部疊在上面 —— 不做巢狀導覽。
 * 這是 cheat sheet 不是課程：使用者要的是「一眼掃到」，
 * 多一層點擊就等於考前多翻一次頁。
 */
import type { TableBlock } from '../../core/types'
import type { RefCategory, RefCategoryId, RefSheet } from './types'
import { kanaCategory } from './kana'
import { numberCategory } from './number'
import { timeCategory } from './time'
import { kosoadoCategory } from './kosoado'
import { verbCategory } from './verb'
import { adjectiveCategory } from './adjective'
import { keigoCategory } from './keigo'
import { politeFormTable } from './verb'
import { countersIntroTable, hundredThousandTable } from './number'

export type { RefCategory, RefCategoryId, RefSheet } from './types'

/** 顯示順序：照學習順序排，不是照字母。 */
export const CATEGORIES: RefCategory[] = [
  kanaCategory,
  numberCategory,
  timeCategory,
  kosoadoCategory,
  verbCategory,
  adjectiveCategory,
  keigoCategory,
]

export function findCategory(id: unknown): RefCategory | undefined {
  return CATEGORIES.find((c) => c.id === String(id))
}

/**
 * 從一張表反查它在速查區的位置。
 *
 * 靠的是**物件 identity**：章節 import 的就是速查匯出的那一個常數，
 * 不是複製品。所以 `===` 就夠了，不必再維護一份 id 對照表 ——
 * 那種對照表是下一個會過期的東西。
 */
const BY_TABLE = new Map<TableBlock, { category: RefCategory; sheet: RefSheet }>()
for (const category of CATEGORIES) {
  for (const sheet of category.sheets) BY_TABLE.set(sheet.table, { category, sheet })
}

/**
 * 課程用的切片版要另外登記。
 *
 * 有幾張表章節看到的是簡化版（第 5 章只有兩列時態、第 4 章只有 1〜3 的助数詞），
 * 它們是從速查那份**算出來的新物件**，identity 對不上。
 * 但學習者要的正是「這張表的完整版在哪」，所以手動指過去。
 */
const ALIASES: [TableBlock, string][] = [
  [politeFormTable, 'tense'],
  [countersIntroTable, 'counters'],
  [hundredThousandTable, 'hundreds'],
]
for (const [table, id] of ALIASES) {
  const hit = findSheetById(id)
  if (hit) BY_TABLE.set(table, hit)
}

/**
 * 章 → 速查分類的對照。
 *
 * 給 identity 對不上的章用。目前只有假名那兩章：速查的五十音表是從
 * kana.ts **生成**的，不是章節共用的那個物件，所以 sheetForTable() 找不到。
 * 而那兩章又正好是最需要指向速查的地方 —— 手寫練習紙在那裡。
 *
 * 其餘章節不必列，它們的表是真的共用同一個物件，逐張連得更準。
 */
export const CHAPTER_CATEGORY: Record<number, RefCategoryId> = {
  1: 'kana',
  2: 'kana',
}

export function sheetForTable(table: TableBlock) {
  return BY_TABLE.get(table)
}

function findSheetById(id: string): { category: RefCategory; sheet: RefSheet } | undefined {
  for (const category of CATEGORIES) {
    const sheet = category.sheets.find((s) => s.id === id)
    if (sheet) return { category, sheet }
  }
  return undefined
}

export function findSheet(id: string): { category: RefCategory; sheet: RefSheet } | undefined {
  for (const category of CATEGORIES) {
    const sheet = category.sheets.find((s) => s.id === id)
    if (sheet) return { category, sheet }
  }
  return undefined
}

export const allSheets = (): RefSheet[] => CATEGORIES.flatMap((c) => c.sheets)
