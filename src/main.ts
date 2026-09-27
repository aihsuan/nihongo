import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')

// 內容錯誤（選項重複、正解不在候選裡、題庫不夠重抽）型別檢查抓不到，
// 而且要等使用者做到那一題才會發現。開發模式下每次啟動就報一次。
if (import.meta.env.DEV) {
  void Promise.all([import('./data/lint'), import('./data/levels')]).then(
    ([{ lintContent, lintKanji, vocabCoverage, vocabSummary, kanjiProgress }, { levels }]) => {
      const problems = lintContent(levels)
      if (problems.length > 0) {
        console.warn(`[NihonGo] 內容檢查發現 ${problems.length} 個問題：`)
        problems.forEach((p) => console.warn('  ·', p))
      }
      // 漢字表在另一個 chunk 裡，動態載入才不會把 113 KB 拉進主 bundle
      void Promise.all([import('./data/kanji'), import('./data/kanji/zh')]).then(
        ([{ KANJI_ALL, zhProgress }, { KANJI_ZH }]) => {
          const bad = lintKanji(KANJI_ALL, KANJI_ZH)
          bad.forEach((m) => console.warn('  ·', m))
          const p = zhProgress()
          console.info(`[NihonGo] 常用漢字 ${p.total} 字，中譯已補 ${p.done}`)
        },
      )

      const k = kanjiProgress(levels)
      console.info(
        `[NihonGo] ${vocabSummary(levels)}　漢字 ${k.written}/${k.declared}（還缺 ${k.missing.length} 個字的資料）`,
      )
      console.table(
        vocabCoverage(levels).map((r) => ({
          主題: r.label,
          已練: `${r.practised}/${r.total}`,
          清單: r.status === 'draft' ? '未收齊' : '已收齊',
        })),
      )
    },
  )
}
