/**
 * 指示詞速查表。
 *
 * 這些表原本寫在章節裡，搬到這裡之後**章節反過來引用**它們 ——
 * 速查區自己抄一份的話，改了其中一邊不會有任何東西報錯。
 *
 * 指示詞的規律是「こ近・そ中・あ遠・ど疑問」，四列背下來就不用一個一個記。
 */
import type { TableBlock } from '../../core/types'
import { label, say } from '../cells'
import type { RefCategory, RefSheet } from './types'

export const konoSoreAreTable: TableBlock = {
  type: 'table',
  heading: 'これ・それ・あれ・どれ',
  columns: ['', '離我近', '離你近', '離兩人都遠', '疑問'],
  rows: [
    [label('事物'), say('これ'), say('それ'), say('あれ'), say('どれ')],
  ],
}

export const kosoadoFullTable: TableBlock = {
  type: 'table',
  heading: 'こそあど 完整表',
  columns: ['', '近（こ）', '中（そ）', '遠（あ）', '疑問（ど）'],
  rows: [
    [label('事物'), say('これ'), say('それ'), say('あれ'), say('どれ')],
    [label('接名詞'), say('この'), say('その'), say('あの'), say('どの')],
    [label('場所'), say('ここ'), say('そこ'), say('あそこ'), say('どこ')],
    [label('方向・客氣'), say('こちら'), say('そちら'), say('あちら'), say('どちら')],
  ],
}

export const questionWordsTable: TableBlock = {
  type: 'table',
  rowHeader: false,
  heading: '常用疑問詞',
  columns: ['疑問詞', '問什麼'],
  rows: [
    [say('何{なに}・何{なん}', 'なに'), label('什麼')],
    [say('だれ'), label('誰')],
    [say('どこ'), label('哪裡')],
    [say('いつ'), label('什麼時候')],
    [say('どれ'), label('哪一個')],
    [say('いくつ'), label('幾個')],
    [say('いくら'), label('多少錢')],
  ],
}

const sheets: RefSheet[] = [
  {
    id: 'konoSoreAre',
    title: '① これ・それ・あれ・どれ',
    note: '距離是以**說話的兩個人**為準：これ 在我這邊、それ 在你那邊、あれ 兩邊都搆不到。不是以物品大小或遠近公尺數決定。',
    table: konoSoreAreTable,
    taughtIn: { chapter: 4, lesson: 1 },
  },
  {
    id: 'kosoadoFull',
    title: '② こそあど 完整表',
    note: '**四列一起背比一個一個背快得多**：開頭的こ・そ・あ・ど 決定遠近，後面的 れ・の・こ・ちら 決定詞性。「こちら」是客氣版的「こっち」，問路和接待客人都用它。',
    table: kosoadoFullTable,
    taughtIn: { chapter: 4, lesson: 2 },
  },
  {
    id: 'questionWords',
    title: '③ 常用疑問詞',
    note: 'いくつ 問個數、いくら 問價錢，這兩個最常搞混。',
    table: questionWordsTable,
    taughtIn: { chapter: 4, lesson: 3 },
    blankColumns: [1],
  },
]

export const kosoadoCategory: RefCategory = {
  id: 'kosoado',
  title: '指示詞',
  subtitle: '距離 → 四系列全表 → 疑問詞',
  sheets,
}
