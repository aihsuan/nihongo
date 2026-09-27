# 漢字讀音資料的來源與授權

`dict.ts` 裡 2,136 個常用漢字的**讀音、學年、筆畫、頻序、舊制 JLPT 級別**
來自 **KANJIDIC2**，由 **Electronic Dictionary Research and Development Group (EDRDG)** 維護。

- 專案首頁：<https://www.edrdg.org/wiki/index.php/KANJIDIC_Project>
- 授權：**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**
  <https://creativecommons.org/licenses/by-sa/4.0/>

依 CC BY-SA 4.0 的要求：

1. 本專案的 `src/data/kanji/dict.ts` 是 KANJIDIC2 的**衍生資料**，
   一併以 CC BY-SA 4.0 釋出。
2. 該檔案由 `scripts/build-kanji.mjs` 自動產生，只抽取需要的欄位，內容未經人工修改。

## 不屬於這個授權的部分

`zh.ts` 裡的**中文翻譯與詞例選擇**是本專案自己寫的，不是 KANJIDIC2 的內容，
也不是任何中日辭典的翻譯。兩個檔案分開放就是為了讓這條界線清楚。

## 其他資料的依據

- **學年**來自文部科學省《学年別漢字配当表》（KANJIDIC2 的 grade 欄位轉載），是官方且穩定的分級。
- **舊制 JLPT 級別**來自 2010 年改制前的《日本語能力試験 出題基準》。
  **JLPT 自 2010 年起不再公布漢字表**，所以本專案不提供「這個字是 N3」這種說法，
  只呈現舊制級別並標明它是舊制。理由與 `src/core/exam.ts` 裡對文法分級的說明相同。
