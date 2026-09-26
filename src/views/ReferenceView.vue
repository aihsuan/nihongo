<script setup lang="ts">
/**
 * 速查頁。一個分類一頁，該類的表全部疊在上面。
 *
 * 刻意不做巢狀導覽：這是 cheat sheet 不是課程，使用者要的是「一眼掃到」。
 * 多一層點擊，就等於考前多翻一次頁。
 *
 * 也刻意沒有進度、沒有打勾、沒有 SRS —— 那會變成和左邊課程競爭的第二條主線。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CATEGORIES, findCategory } from '../data/reference'
import { levels } from '../data/levels'
import ContentBlocks from '../components/ContentBlocks.vue'
import InlineText from '../components/InlineText.vue'

const route = useRoute()
const category = computed(() => findCategory(route.params.category))

/**
 * 表格自己也帶 heading（課程頁靠它當小標），但速查頁的 sheet 標題已經印過一次了。
 * 這裡把它拿掉，不然每張表的名字都會連著出現兩遍。
 */
const bare = (sheet: { table: import('../core/types').TableBlock }) => ({
  ...sheet.table,
  heading: undefined,
})

/** 「第 10 章第 2 課」要連回去，得把章序號換成實際的路由。 */
function lessonHref(chapter: number, lesson: number): string | null {
  const n5 = levels[0]
  const ch = n5.chapters.find((c) => c.order === chapter)
  if (!ch || !ch.lessons[lesson - 1]) return null
  return `/n5/${chapter}/${lesson}`
}
</script>

<template>
  <div v-if="category" class="page">
    <header class="head">
      <p class="eyebrow">速查</p>
      <h1>
        {{ category.title }}
        <span v-if="category.scope" class="scope">{{ category.scope }}</span>
      </h1>
      <p class="sub">{{ category.subtitle }}</p>
      <p class="tip">點表格裡的任何一格可以聽發音。</p>
    </header>

    <nav class="prints" aria-label="列印">
      <span class="prints-label">列印</span>
      <RouterLink :to="`/print/ref/${category.id}`" class="print-link strong">
        這一類的速查表
      </RouterLink>
      <template v-if="category.id === 'kana'">
        <span class="prints-label">手寫練習紙</span>
        <RouterLink to="/print/kana/seion" class="print-link">清音 46</RouterLink>
        <RouterLink to="/print/kana/dakuon" class="print-link">濁音・半濁音</RouterLink>
        <RouterLink to="/print/kana/youon" class="print-link">拗音</RouterLink>
        <RouterLink to="/print/kana/all" class="print-link">全部 104 音</RouterLink>
      </template>
    </nav>

    <nav class="tabs" aria-label="速查分類">
      <RouterLink
        v-for="c in CATEGORIES"
        :key="c.id"
        :to="`/ref/${c.id}`"
        class="tab"
        :class="{ on: c.id === category.id }"
      >
        {{ c.title }}
        <span class="n">{{ c.sheets.length }}</span>
      </RouterLink>
    </nav>

    <section v-for="sheet in category.sheets" :key="sheet.id" class="sheet">
      <header class="sheet-head">
        <h2><InlineText :text="sheet.title" /></h2>
        <RouterLink
          v-if="sheet.taughtIn && lessonHref(sheet.taughtIn.chapter, sheet.taughtIn.lesson)"
          class="taught"
          :to="lessonHref(sheet.taughtIn.chapter, sheet.taughtIn.lesson)!"
        >
          第 {{ sheet.taughtIn.chapter }} 章第 {{ sheet.taughtIn.lesson }} 課 ›
        </RouterLink>
      </header>
      <p v-if="sheet.note" class="note"><InlineText :text="sheet.note" /></p>

      <!-- 表格的畫法和課程頁共用，速查不另寫一套渲染 -->
      <ContentBlocks :blocks="[bare(sheet)]" />
    </section>
  </div>

  <p v-else class="missing">找不到這個速查分類。</p>
</template>

<style scoped>
.page { max-width: 860px; margin: 0 auto; }

.head { margin-bottom: var(--s-5); }
.eyebrow {
  margin: 0 0 var(--s-1);
  font-size: var(--t-xs);
  letter-spacing: 0.12em;
  color: var(--muted);
}
h1 { margin: 0 0 var(--s-1); font-size: 32px; }

/* 超出 N5 的分類要一眼看到 —— 不標的話，學 N5 的人會以為自己漏學了一整類 */
.scope {
  display: inline-block;
  vertical-align: middle;
  margin-left: var(--s-3);
  padding: 3px var(--s-3);
  border: 1px solid var(--edge);
  border-radius: var(--r-pill);
  color: var(--muted);
  font-size: var(--t-xs);
  font-weight: 400;
}
.sub { margin: 0; color: var(--text-2); font-size: var(--t-md); }

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
  margin-bottom: var(--s-6);
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--edge);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: var(--tap);
  padding: 0 var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--text-2);
  font-size: var(--t-sm);
  text-decoration: none;
  transition: border-color var(--dur-fast), color var(--dur-fast), background var(--dur-fast);
}

.tab:hover { border-color: var(--brand-solid); color: var(--text); }
.tab.on {
  border-color: var(--brand-solid);
  background: color-mix(in srgb, var(--brand-solid) 12%, transparent);
  color: var(--text);
  font-weight: 600;
}

.n {
  min-width: 18px;
  padding: 0 5px;
  border-radius: var(--r-pill);
  background: var(--surface-2);
  color: var(--muted);
  font-size: var(--t-xs);
  text-align: center;
}

.prints {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-2);
  margin-bottom: var(--s-4);
  padding: var(--s-3) var(--s-4);
  border: 1px dashed var(--edge);
  border-radius: var(--r-md);
}

.prints-label { font-size: var(--t-xs); color: var(--muted); margin-right: var(--s-1); }

.print-link {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--s-3);
  border: 1px solid var(--edge);
  border-radius: var(--r-sm);
  color: var(--text-2);
  font-size: var(--t-xs);
  text-decoration: none;
}
.print-link:hover { border-color: var(--brand-solid); color: var(--text); }
.print-link.strong { border-color: var(--brand-solid); color: var(--text); font-weight: 600; }

.sheet { margin-bottom: var(--s-7); min-width: 0; }

.tip { margin: var(--s-2) 0 0; font-size: var(--t-xs); color: var(--muted); }

/* ContentBlocks 每張表都會印一次「點任何一個假名可以聽發音」。
   課程頁一頁一兩張表沒問題，速查頁一頁八張就變成八次雜訊 ——
   這裡關掉它，改成頁首說一次。 */
.sheet :deep(.tip) { display: none; }

.sheet-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s-3);
  flex-wrap: wrap;
  margin-bottom: var(--s-2);
}

.sheet-head h2 { margin: 0; font-size: var(--t-lg); }

.taught {
  flex: none;
  color: var(--muted);
  font-size: var(--t-xs);
  text-decoration: none;
}
.taught:hover { color: var(--brand-solid); }

.note {
  margin: 0 0 var(--s-3);
  color: var(--text-2);
  font-size: var(--t-sm);
  line-height: 1.9;
}

.missing { color: var(--muted); }
</style>
