/**
 * 從 KANJIDIC2 產生 src/data/kanji/dict.ts。
 *
 * 用法：node scripts/build-kanji.mjs
 * 會下載 KANJIDIC2（約 1.4 MB gz）到暫存目錄再解析，原始檔不進 repo（15 MB）。
 *
 * **產生出來的檔案不要手改** —— 下次重跑會覆蓋。
 * 中文翻譯與詞例寫在 src/data/kanji/zh.ts，那是另一個檔案，重跑不會動到它。
 * 這個分離是刻意的：讀音是別人維護的事實資料，中譯是我們自己的成果。
 *
 * 資料來源：KANJIDIC2 / Electronic Dictionary Research and Development Group
 * 授權：CC BY-SA 4.0 —— 見 src/data/kanji/ATTRIBUTION.md
 */
import { createWriteStream } from 'node:fs'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createGunzip } from 'node:zlib'
import { Readable } from 'node:stream'

const URL_GZ = 'http://www.edrdg.org/kanjidic/kanjidic2.xml.gz'

async function fetchXml() {
  const dir = await mkdtemp(join(tmpdir(), 'kanjidic-'))
  const xml = join(dir, 'kanjidic2.xml')
  const res = await fetch(URL_GZ)
  if (!res.ok) throw new Error(`下載失敗：${res.status}`)
  await pipeline(Readable.fromWeb(res.body), createGunzip(), createWriteStream(xml))
  return xml
}

/** 只取需要的欄位。用正則而不是 XML parser：這份檔案結構固定，省一個相依。 */
function parse(xml) {
  const out = []
  for (const block of xml.split('<character>').slice(1)) {
    const char = block.match(/<literal>(.*?)<\/literal>/)?.[1]
    const grade = Number(block.match(/<grade>(\d+)<\/grade>/)?.[1] ?? 0)
    if (!char || !grade || grade > 8) continue // 只要常用漢字（1-6 教育漢字、8 中學以上）
    const strokes = Number(block.match(/<stroke_count>(\d+)<\/stroke_count>/)?.[1] ?? 0)
    const freq = Number(block.match(/<freq>(\d+)<\/freq>/)?.[1] ?? 0)
    const jlpt = Number(block.match(/<jlpt>(\d+)<\/jlpt>/)?.[1] ?? 0)
    const group = block.match(/<rmgroup>([\s\S]*?)<\/rmgroup>/)?.[1] ?? ''
    const read = (type) =>
      [...group.matchAll(new RegExp(`<reading r_type="${type}"[^>]*>(.*?)</reading>`, 'g'))].map(
        (m) => m[1],
      )
    out.push([char, grade, strokes, freq, jlpt, read('ja_on').join('・'), read('ja_kun').join('・')])
  }
  return out.sort((a, b) => a[1] - b[1] || (a[3] || 9999) - (b[3] || 9999))
}

const xml = await readFile(await fetchXml(), 'utf8')
const rows = parse(xml)
const version = xml.match(/<database_version>(.*?)<\/database_version>/)?.[1] ?? '?'

const body = rows.map((r) => '  ' + JSON.stringify(r)).join(',\n')
await writeFile(
  new URL('../src/data/kanji/dict.ts', import.meta.url),
  `/**
 * 常用漢字 ${rows.length} 字的讀音資料。**這個檔案是產生的，不要手改。**
 * 重跑 \`node scripts/build-kanji.mjs\` 會整份覆蓋。
 *
 * 中文翻譯與詞例在 zh.ts，那是手寫的，重跑不會動到。
 *
 * 來源：KANJIDIC2（EDRDG），資料庫版本 ${version}
 * 授權：CC BY-SA 4.0 —— 見 ATTRIBUTION.md
 *
 * 欄位：[字, 學年, 筆畫, 頻序, 舊制JLPT, 音読み, 訓読み]
 * 學年 1-6 是教育漢字，8 是中學以上；頻序 0 表示不在常用頻度表內；
 * 舊制JLPT 0 表示沒有級別（多半是 2010 年新增的那批字）。
 */
export type KanjiRow = [
  char: string,
  grade: number,
  strokes: number,
  freq: number,
  oldJlpt: number,
  on: string,
  kun: string,
]

export const KANJI_ROWS: KanjiRow[] = [
${body},
]

export const KANJIDIC_VERSION = '${version}'
`,
  'utf8',
)
console.log(`寫出 ${rows.length} 字 → src/data/kanji/dict.ts（KANJIDIC ${version}）`)
