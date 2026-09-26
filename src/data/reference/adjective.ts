/**
 * 形容詞速查表。
 *
 * 這些表原本寫在章節裡，搬到這裡之後**章節反過來引用**它們 ——
 * 速查區自己抄一份的話，改了其中一邊不會有任何東西報錯。
 *
 * 兩種形容詞的分水嶺在否定和過去：い形容詞自己變（高くない），な形容詞靠です 變（静かじゃない）。
 */
import type { TableBlock } from '../../core/types'
import { label, say } from '../cells'
import type { RefCategory, RefSheet } from './types'

export const adjBeforeNounTable: TableBlock = {
  type: 'table',
  heading: '接名詞的方式',
  columns: ['類別', '接名詞', '例'],
  rows: [
    [label('い形容詞'), label('直接接'), say('大{おお}きい 部屋{へや}', 'おおきいへや')],
    [label('な形容詞'), label('中間加 な'), say('静{しず}かな 部屋{へや}', 'しずかなへや')],
  ],
}

export const iAdjPoliteTable: TableBlock = {
  type: 'table',
  heading: 'い形容詞（高い）',
  columns: ['', '肯定', '否定'],
  rows: [
    [label('現在'), say('高{たか}いです', 'たかいです'), say('高{たか}くないです', 'たかくないです')],
    [label('過去'), say('高{たか}かったです', 'たかかったです'), say('高{たか}くなかったです', 'たかくなかったです')],
  ],
}

export const naAdjPoliteTable: TableBlock = {
  type: 'table',
  heading: 'な形容詞（静かだ）',
  columns: ['', '肯定', '否定'],
  rows: [
    [label('現在'), say('静{しず}かです', 'しずかです'), say('静{しず}かじゃありません', 'しずかじゃありません')],
    [label('過去'), say('静{しず}かでした', 'しずかでした'), say('静{しず}かじゃありませんでした', 'しずかじゃありませんでした')],
  ],
}

export const adjJoinTable: TableBlock = {
  type: 'table',
  heading: '連接形',
  columns: ['類別', '連接形', '例'],
  rows: [
    [label('い形容詞'), label('〜くて'), say('安{やす}くて おいしいです', 'やすくておいしいです')],
    [label('な形容詞'), label('〜で'), say('静{しず}かで きれいです', 'しずかできれいです')],
    [label('名詞'), label('〜で'), say('学生{がくせい}で 二十歳{はたち}です', 'がくせいではたちです')],
  ],
}

export const iAdjPlainTable: TableBlock = {
  type: 'table',
  heading: 'い形容詞（高い）',
  columns: ['', '丁寧形', '普通形'],
  rows: [
    [label('現在肯定'), say('高{たか}いです', 'たかいです'), say('高{たか}い', 'たかい')],
    [label('現在否定'), say('高{たか}くないです', 'たかくないです'), say('高{たか}くない', 'たかくない')],
    [label('過去肯定'), say('高{たか}かったです', 'たかかったです'), say('高{たか}かった', 'たかかった')],
    [label('過去否定'), say('高{たか}くなかったです', 'たかくなかったです'), say('高{たか}くなかった', 'たかくなかった')],
  ],
}

export const naAdjPlainTable: TableBlock = {
  type: 'table',
  heading: 'な形容詞・名詞（学生）',
  columns: ['', '丁寧形', '普通形'],
  rows: [
    [label('現在肯定'), say('学生{がくせい}です', 'がくせいです'), say('学生{がくせい}だ', 'がくせいだ')],
    [label('現在否定'), say('学生{がくせい}じゃありません', 'がくせいじゃありません'), say('学生{がくせい}じゃない', 'がくせいじゃない')],
    [label('過去肯定'), say('学生{がくせい}でした', 'がくせいでした'), say('学生{がくせい}だった', 'がくせいだった')],
    [label('過去否定'), say('学生{がくせい}じゃありませんでした', 'がくせいじゃありませんでした'), say('学生{がくせい}じゃなかった', 'がくせいじゃなかった')],
  ],
}

const sheets: RefSheet[] = [
  {
    id: 'adjKinds',
    title: '① 兩種形容詞怎麼分',
    note:
      '結尾是「い」的多半是**い形容詞**，其餘是**な形容詞**。' +
      '陷阱是 きれい・嫌{きら}い 這兩個 —— 它們結尾有い，卻是な形容詞（きれいな 人、嫌いな 食べ物）。' +
      '最可靠的判斷法不是看結尾，是**接名詞時要不要加な**。',
    table: adjBeforeNounTable,
    taughtIn: { chapter: 7, lesson: 1 },
  },
  {
    id: 'iAdjPolite',
    title: '② い形容詞活用（丁寧形）',
    note:
      '**い形容詞自己變，です 不動**：高い → 高くないです。' +
      '寫成「高いじゃありません」是最常見的錯，那是な形容詞的變法。',
    table: iAdjPoliteTable,
    taughtIn: { chapter: 7, lesson: 2 },
    blankColumns: [2],
  },
  {
    id: 'naAdjPolite',
    title: '③ な形容詞活用（丁寧形）',
    note: '**な形容詞自己不動，靠です 變**，和名詞完全一樣：静かです → 静かじゃありません。',
    table: naAdjPoliteTable,
    taughtIn: { chapter: 7, lesson: 2 },
    blankColumns: [2],
  },
  {
    id: 'adjJoin',
    title: '④ 兩個形容詞接在一起',
    note: 'い形容詞用〜くて，な形容詞和名詞都用〜で。只有最後一個才加です。',
    table: adjJoinTable,
    taughtIn: { chapter: 7, lesson: 3 },
    // 同上：例欄的「安くて おいしいです」就含著答案
    blankColumns: [1, 2],
  },
  {
    id: 'iAdjPlain',
    title: '⑤ い形容詞：丁寧形 vs 普通形',
    note: '普通形就是把です 拿掉，但過去否定要收成「高くなかった」，不是「高くないでした」。',
    table: iAdjPlainTable,
    taughtIn: { chapter: 15, lesson: 2 },
    // 這張沒有填空版：い形容詞的普通形就藏在丁寧形裡（高い ⊂ 高いです），
    // 挖哪一欄答案都在對面。只印乾淨版比印一張送分的考卷誠實。
  },
  {
    id: 'naAdjPlain',
    title: '⑥ な形容詞・名詞：丁寧形 vs 普通形',
    note: '普通形的現在肯定要加「だ」（学生だ）—— 這個字最常被漏掉。',
    table: naAdjPlainTable,
    taughtIn: { chapter: 15, lesson: 2 },
    blankColumns: [2],
  },
]

export const adjectiveCategory: RefCategory = {
  id: 'adjective',
  title: '形容詞',
  subtitle: '怎麼分 → 各自活用 → 連接 → 丁寧形與普通形',
  sheets,
}
