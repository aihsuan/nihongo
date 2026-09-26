/**
 * 速查區的型別。
 *
 * 速查區不是第二套課程：**沒有進度、沒有 SRS、沒有完成打勾**。
 * 它是考前抓起來看的一張紙，衡量它的標準是「密度」和「找得到」，
 * 不是「學到哪裡」。加了進度條就會變成和左邊課程大綱競爭的第二條主線。
 *
 * 內容一律**不自己寫一份**：假名表從 kana.ts 生成，其餘從章節搬過來、
 * 章節反過來引用這裡。兩份一樣的表遲早會不一樣，而且不會有任何東西報錯。
 */
import type { TableBlock } from '../../core/types'

export type RefCategoryId =
  | 'kana'
  | 'number'
  | 'time'
  | 'kosoado'
  | 'verb'
  | 'adjective'
  | 'keigo'

export interface RefSheet {
  id: string
  title: string
  /** 一句話：什麼時候用得上、哪裡容易錯。沒有就不顯示。 */
  note?: string
  table: TableBlock
  /**
   * 教這張表的課，速查頁用它連回去。
   * 存純數字而不是 Lesson 物件 —— 速查一旦 import 章節，
   * 章節又 import 速查，就繞成循環了。
   */
  taughtIn?: { chapter: number; lesson: number }
  /**
   * 填空版列印要挖掉哪幾欄（0 起算）。不填就只印乾淨版 ——
   * 有些表（五十音圖）挖哪一欄都不成立。
   *
   * 是**陣列**不是單一數字：像「幾點」那種「數字／唸法」重複三組的表，
   * 只挖第 1 欄會把另外兩欄的答案留在紙上，那份考卷等於送分。
   */
  blankColumns?: number[]
}

export interface RefCategory {
  id: RefCategoryId
  title: string
  /** 一句話說明這一類在考場上幫你什麼 */
  subtitle: string
  /**
   * 超出 N5 的分類要標出來，例如敬語（N4 以上）。
   *
   * 寫成欄位而不是塞在 subtitle 裡：這是個**事實**，畫面要能一眼看到，
   * 而且這一類不會有「教它的那一課」可以連 —— 課程根本還沒教。
   * 不標的話，一個在學 N5 的人會以為自己漏學了一整類東西。
   */
  scope?: string
  sheets: RefSheet[]
}
