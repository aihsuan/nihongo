/**
 * 表格儲存格的建構器。
 *
 * 這兩個函式本來在 14 個章節檔裡各有一份一模一樣的定義。
 * 速查區（src/data/reference/）需要同一組，與其加到第 15 份，不如集中。
 * 它們只依賴型別，所以課程和速查兩邊都能引用，不會繞成循環。
 */
import type { TableCell } from '../core/types'

/**
 * 可朗讀的儲存格。
 * speak 預設等於顯示文字，但兩者常常要分開 ——
 * 畫面上要看到「書{か}きます → 書{か}いて」，唸出來卻不能唸箭頭。
 */
export const say = (text: string, speak = text): TableCell => ({ text, speak })

/** 純文字儲存格，點了不會唸。欄位標題、中文說明用這個。 */
export const label = (text: string): TableCell => ({ text })
