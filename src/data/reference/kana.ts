/**
 * 假名速查表。
 *
 * **不手寫表格內容** —— 全部從 kana.ts 的 KANA／VOICED／YOUON 生成。
 * 那份資料已經是教材、題目、練習紙三處的單一事實來源，
 * 速查再抄第四份的話，哪天改了字源提示就會有一處悄悄不同步。
 */
import type { TableBlock } from '../../core/types'
import { KANA, VOICED, YOUON } from '../n5/kana'
import { label, say } from '../cells'
import type { RefCategory, RefSheet } from './types'

type Script = 'hira' | 'kata'

/** あ段〜お段的欄位順序。拗音用另一組。 */
const VOWELS = ['a', 'i', 'u', 'e', 'o']

/**
 * 依**母音**把假名放進對應的段，空的段留白。
 *
 * 不能照順序填再把空格補在列尾 —— や行只有 や・ゆ・よ，
 * 補在後面就變成「や ゆ よ ＿ ＿」，ゆ 跑到い段、よ 跑到う段。
 * 五十音圖的全部價值就在段位對齊，對不齊的表比沒有表更糟。
 */
function grid(source: typeof KANA, script: Script, rowLabel: (row: string) => string): TableBlock['rows'] {
  const order: string[] = []
  for (const k of source) if (!order.includes(k.row)) order.push(k.row)

  return order.map((row) => {
    const items = source.filter((k) => k.row === row)
    const cells = VOWELS.map((v) => {
      // ん 不屬於任何段，單獨放在あ段那一格
      const hit = items.find((k) =>
        k.romaji === 'n' ? v === 'a' : k.romaji.endsWith(v),
      )
      return hit ? say(hit[script], hit.hira) : label('')
    })
    return [label(rowLabel(row)), ...cells]
  })
}

/** 拗音固定三欄，每行都剛好三個，不會有空格。 */
function youonGrid(script: Script): TableBlock['rows'] {
  const order: string[] = []
  for (const k of YOUON) if (!order.includes(k.row)) order.push(k.row)
  return order.map((row) => {
    const items = YOUON.filter((k) => k.row === row)
    return [label(`${row[0]}行`), ...items.map((k) => say(k[script], k.hira))]
  })
}

const seion = (script: Script): TableBlock => ({
  type: 'table',
  variant: 'kana',
  columns: ['', 'あ段', 'い段', 'う段', 'え段', 'お段'],
  rows: grid(KANA, script, (r) => (r === 'ん' ? '' : `${r}行`)),
})

const dakuon = (script: Script): TableBlock => ({
  type: 'table',
  variant: 'kana',
  columns: ['', 'あ段', 'い段', 'う段', 'え段', 'お段'],
  rows: grid(VOICED, script, (r) => `${r}行`),
})

const youon = (script: Script): TableBlock => ({
  type: 'table',
  variant: 'kana',
  columns: ['', 'ゃ', 'ゅ', 'ょ'],
  rows: youonGrid(script),
})

/** 羅馬字對照。考前想確認的是拼法，不是字形，所以單獨一張。 */
const romaji = (): TableBlock => ({
  type: 'table',
  // 這張表沒有列標題 —— 第一欄放的是假名本身，不是「あ行」那種標籤。
  // 不關掉的話第一欄會被畫成灰底的 th，而且點不出聲音。
  rowHeader: false,
  columns: ['假名', '羅馬字', '假名', '羅馬字', '假名', '羅馬字'],
  rows: (() => {
    const all = [...KANA, ...VOICED, ...YOUON]
    const out: TableBlock['rows'] = []
    for (let i = 0; i < all.length; i += 3) {
      const row: TableBlock['rows'][number] = []
      for (const k of all.slice(i, i + 3)) {
        row.push(say(`${k.hira}・${k.kata}`, k.hira), label(k.romaji))
      }
      while (row.length < 6) row.push(label(''))
      out.push(row)
    }
    return out
  })(),
})

const sheets: RefSheet[] = [
  {
    id: 'hira-seion',
    title: '平假名　清音 46',
    note: 'や行沒有 yi／ye，わ行只剩 わ 和 を —— 表上的空格不是漏印。',
    table: seion('hira'),
    taughtIn: { chapter: 1, lesson: 1 },
  },
  {
    id: 'kata-seion',
    title: '片假名　清音 46',
    note: 'シ／ツ、ソ／ン 的差別在起筆方向：シ・ン 由下往上，ツ・ソ 由上往下。',
    table: seion('kata'),
    taughtIn: { chapter: 2, lesson: 1 },
  },
  {
    id: 'dakuon',
    title: '濁音・半濁音',
    note: '濁點只加在 か・さ・た・は 四行；半濁點（゜）只有は行有。',
    table: dakuon('hira'),
    taughtIn: { chapter: 2, lesson: 4 },
  },
  {
    id: 'dakuon-kata',
    title: '濁音・半濁音（片假名）',
    table: dakuon('kata'),
    taughtIn: { chapter: 2, lesson: 4 },
  },
  {
    id: 'youon',
    title: '拗音',
    note: '兩個假名合起來**只有一拍**。「きょ」是一拍，「きよ」是兩拍，聽力常考這組。',
    table: youon('hira'),
    taughtIn: { chapter: 2, lesson: 5 },
  },
  {
    id: 'youon-kata',
    title: '拗音（片假名）',
    table: youon('kata'),
    taughtIn: { chapter: 2, lesson: 5 },
  },
  {
    id: 'romaji',
    title: '羅馬字對照',
    note: 'し＝shi 不是 si，ち＝chi 不是 ti，つ＝tsu，ふ＝fu。這四個最常拼錯。',
    table: romaji(),
    blankColumns: [1, 3, 5],
  },
]

export const kanaCategory: RefCategory = {
  id: 'kana',
  title: '假名',
  subtitle: '五十音、濁音半濁音、拗音、羅馬字對照',
  sheets,
}
