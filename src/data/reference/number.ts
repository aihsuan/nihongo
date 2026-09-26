/**
 * 數字速查表。
 *
 * 這些表原本寫在章節裡，搬到這裡之後**章節反過來引用**它們 ——
 * 速查區自己抄一份的話，改了其中一邊不會有任何東西報錯。
 *
 * 數字本身不難，難的是音變（３００ さんびゃく、６００ ろっぴゃく）和助数詞配哪個東西。
 */
import type { TableBlock } from '../../core/types'
import { label, say } from '../cells'
import type { RefCategory, RefSheet } from './types'

export const oneToTenTable: TableBlock = {
  type: 'table',
  heading: '1 到 10',
  columns: ['數字', '音読み', '訓読み（個數）'],
  rows: [
    [label('一'), say('いち'), say('ひとつ')],
    [label('二'), say('に'), say('ふたつ')],
    [label('三'), say('さん'), say('みっつ')],
    [label('四'), say('よん・し'), say('よっつ')],
    [label('五'), say('ご'), say('いつつ')],
    [label('六'), say('ろく'), say('むっつ')],
    [label('七'), say('なな・しち'), say('ななつ')],
    [label('八'), say('はち'), say('やっつ')],
    [label('九'), say('きゅう・く'), say('ここのつ')],
    [label('十'), say('じゅう'), say('とお')],
  ],
}

/**
 * 百與千的完整唸法。
 *
 * 上一版只列了會變音的五個，配一句「其餘照規則唸」。教學上那樣是對的，
 * 但**速查的時候你要的是整排掃過去確認**，而不是自己推規則。
 * 所以資料列完整，章節那一版由它過濾出變音的幾個，兩邊不抄兩份。
 */
const HUNDREDS: [n: string, reading: string, note: string][] = [
  ['200', 'にひゃく', ''],
  ['300', '**さんびゃく**', 'ひゃく → びゃく'],
  ['400', 'よんひゃく', ''],
  ['500', 'ごひゃく', ''],
  ['600', '**ろっぴゃく**', 'ろく → ろっ、ひゃく → ぴゃく'],
  ['700', 'ななひゃく', ''],
  ['800', '**はっぴゃく**', 'はち → はっ、ひゃく → ぴゃく'],
  ['900', 'きゅうひゃく', ''],
  ['1000', 'せん', ''],
  ['2000', 'にせん', ''],
  ['3000', '**さんぜん**', 'せん → ぜん'],
  ['8000', '**はっせん**', 'はち → はっ'],
  ['何百', '**なんびゃく**', 'ひゃく → びゃく'],
  ['何千', '**なんぜん**', 'せん → ぜん'],
]

const strip = (s: string) => s.replace(/\*\*/g, '')

/** 速查版：全部列出來，掃一遍就確認完。 */
export const hundredsTable: TableBlock = {
  type: 'table',
  rowHeader: false,
  heading: '百與千　完整唸法',
  columns: ['數字', '唸法', '注意'],
  rows: HUNDREDS.map(([n, r, note]) => [
    label(n),
    say(r, strip(r)),
    label(note || '照規則'),
  ]),
}

/** 第 4 章第 4 課用：只留會變音的，其餘照規則唸。 */
export const hundredThousandTable: TableBlock = {
  type: 'table',
  heading: '百與千的音變',
  columns: ['數字', '唸法', '注意'],
  rows: HUNDREDS.filter(([, , note]) => note).map(([n, r, note]) => [
    label(n),
    say(strip(r), strip(r)),
    label(note),
  ]),
}

/**
 * 助数詞的完整對照。
 *
 * 只印 1、2、3 是不夠的 —— 那三格剛好把 ろっぽん、はっぽん、じゅっぽん 全藏起來，
 * 而助数詞唯一的難點就是音變。所以欄位挑「會變的那幾個數」：
 * 1、3、6、8、10 是促音與半濁音的集中地，4 是〜人 的例外（よにん 不是よんにん），
 * 「何」則是實際對話裡最常用到的一格。5、7、9 一律規則，省下來換版面寬度。
 *
 * 會變的格子用 **粗體** 標出來，speak 另外給乾淨的讀音，不然 TTS 會把星號唸進去。
 */
const COUNTERS: [label: string, use: string, forms: string[]][] = [
  ['〜つ', '一般東西（只到十）', ['**ひとつ**', '**ふたつ**', '**みっつ**', '**よっつ**', '**むっつ**', '**やっつ**', '**とお**', '**いくつ**']],
  ['〜人{にん}', '人', ['**ひとり**', '**ふたり**', 'さんにん', '**よにん**', 'ろくにん', 'はちにん', 'じゅうにん', 'なんにん']],
  ['〜本{ほん}', '細長的（筆、傘、瓶）', ['**いっぽん**', 'にほん', '**さんぼん**', 'よんほん', '**ろっぽん**', '**はっぽん**', '**じゅっぽん**', '**なんぼん**']],
  ['〜枚{まい}', '扁平的（紙、襯衫、盤）', ['いちまい', 'にまい', 'さんまい', 'よんまい', 'ろくまい', 'はちまい', 'じゅうまい', 'なんまい']],
  ['〜冊{さつ}', '書本', ['**いっさつ**', 'にさつ', 'さんさつ', 'よんさつ', 'ろくさつ', '**はっさつ**', '**じゅっさつ**', 'なんさつ']],
  ['〜台{だい}', '機器、車輛', ['いちだい', 'にだい', 'さんだい', 'よんだい', 'ろくだい', 'はちだい', 'じゅうだい', 'なんだい']],
  ['〜個{こ}', '小東西', ['**いっこ**', 'にこ', 'さんこ', 'よんこ', '**ろっこ**', '**はっこ**', '**じゅっこ**', 'なんこ']],
]

const clean = (s: string) => s.replace(/\*\*/g, '')

export const countersTable: TableBlock = {
  type: 'table',
  heading: '助数詞　完整對照',
  columns: ['量詞', '用於', '1', '2', '3', '4', '6', '8', '10', '何'],
  // 量詞名稱本身不可點：振り仮名已經把讀音寫出來了，
  // 單獨唸一個「ほん」也幫不上忙 —— 要聽的是它配上數字之後怎麼變。
  rows: COUNTERS.map(([name, use, forms]) => [
    label(name),
    label(use),
    ...forms.map((f) => say(f, clean(f))),
  ]),
}

/**
 * 第 4 章第 5 課用的入門版：同一份資料只切前三個數。
 *
 * 初學者第一次看到助数詞就給十欄會直接放棄，但課本和速查也不能各寫一份 ——
 * 兩邊講的是同一組讀音，抄兩份遲早會有一格不一樣。切片是唯一不會分岔的做法。
 */
export const countersIntroTable: TableBlock = {
  type: 'table',
  heading: '七個常用助数詞',
  columns: ['量詞', '用於', '1', '2', '3'],
  rows: COUNTERS.map(([name, use, forms]) => [
    label(name),
    label(use),
    ...forms.slice(0, 3).map((f) => say(clean(f))),
  ]),
}

const sheets: RefSheet[] = [
  {
    id: 'oneToTen',
    title: '① 1 到 10（兩套唸法）',
    note: '日文的數字有**兩套**：音読み（いち・に・さん）用在計數、電話、價錢；訓読み（ひとつ〜とお）只到十，用在數東西的個數。**4・7・9 各有兩種唸法**，時間和日期偏好哪一種是固定的，別自己選。',
    table: oneToTenTable,
    taughtIn: { chapter: 4, lesson: 4 },
    blankColumns: [2],
  },
  {
    id: 'hundredThousand',
    title: '② 百與千　完整唸法',
    note:
      '粗體是會變音的。**只有這幾個要背：300 びゃく、600 ろっぴゃく、800 はっぴゃく、' +
      '3000 さんぜん、8000 はっせん**，其餘照數字直接接。問「幾百」「幾千」時同樣會變音。',
    table: hundredsTable,
    taughtIn: { chapter: 4, lesson: 4 },
    blankColumns: [1],
  },
  {
    id: 'counters',
    title: '③ 助数詞完整對照',
    note: '粗體是會變音的格子。規律是 1・6・8・10 容易出現促音，其後的 は行 再變成半濁音（ぽ・ぴ）。5、7、9 一律規則，所以沒印。',
    table: countersTable,
    taughtIn: { chapter: 4, lesson: 5 },
  },
]

export const numberCategory: RefCategory = {
  id: 'number',
  title: '數字',
  subtitle: '兩套數字 → 音變 → 助数詞',
  sheets,
}
