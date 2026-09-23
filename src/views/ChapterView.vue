<script setup lang="ts">
/**
 * 章首頁。內容寫好的章列出課與驗收；還沒寫的章列出「這章會教什麼」。
 *
 * 準備中的章不是隱藏也不是點不動 —— 大綱本身就是價值，
 * 而「點了沒反應」是最糟的互動：使用者會以為壞掉。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findChapter, findLevel, lessonPath, quizPath } from '../data/routes'
import { chapterCompletion, chapterDone, chapterNodes, chapterTotal, isLessonDone, isQuizDone } from '../core/progress'
import { useProgress } from '../composables/useProgress'
import ProgressBar from '../components/ProgressBar.vue'
import InlineText from '../components/InlineText.vue'

const route = useRoute()
const { progress } = useProgress()

const level = computed(() => findLevel(route.params.level))
const chapter = computed(() => findChapter(level.value, route.params.chapter))
</script>

<template>
  <div v-if="chapter && level" class="page">
    <nav class="crumbs">
      <RouterLink :to="`/${level.id.toLowerCase()}`">{{ level.title }}</RouterLink>
    </nav>

    <header class="head">
      <p class="kicker">第 {{ chapter.order }} 章</p>
      <h1>{{ chapter.title }}</h1>
      <p class="goal"><InlineText :text="chapter.goal" /></p>

      <div v-if="!chapter.pending" class="progress">
        <ProgressBar :value="chapterCompletion(chapter, progress)" :hue="level.hue" />
        <span>{{ chapterDone(chapter, progress) }} / {{ chapterTotal(chapter) }}</span>
      </div>
    </header>

    <section class="covers">
      <h2>這一章涵蓋</h2>
      <ul>
        <li v-for="c in chapter.covers" :key="c"><InlineText :text="c" /></li>
      </ul>

      <p v-if="chapter.bookUnits?.length" class="book">
        對應《完全掌握 N5》單元 {{ chapter.bookUnits.join('、') }}
      </p>
      <!--
        照書是把書當骨幹，不是當上限。完全掌握 N5 自己也漏了幾個標準 N5 項目，
        那些留在大綱裡並在這裡標出來，免得下次又被誤判成「多做的」而刪掉。
      -->
      <p v-if="chapter.beyondBook?.length" class="beyond">
        書上沒有、但 N5 會考的：<InlineText :text="chapter.beyondBook.join('、')" />
      </p>

      <p v-if="chapter.kanji?.length" class="kanji-line">
        本章漢字：<span>{{ chapter.kanji.join('　') }}</span>
      </p>
    </section>

    <section v-if="chapter.pending" class="pending">
      <h2>內容還在製作中</h2>
      <p>
        這一章的大綱已經定了，教材與題目還沒寫。上面那份清單就是它完成後會教的東西。
      </p>
      <RouterLink class="cta" :to="`/${level.id.toLowerCase()}/1/1`">
        先從第 1 章開始
      </RouterLink>
    </section>

    <section v-else class="nodes">
      <h2>課程內容</h2>
      <ul>
        <li v-for="node in chapterNodes(chapter)" :key="node.kind === 'lesson' ? node.lesson.id : node.quiz.id">
          <RouterLink
            v-if="node.kind === 'lesson'"
            :to="lessonPath(level, chapter, node.lesson)"
            class="node"
            :class="{ done: isLessonDone(node.lesson, progress) }"
          >
            <span class="tick" aria-hidden="true">{{ isLessonDone(node.lesson, progress) ? '✓' : '○' }}</span>
            <span class="body">
              <span class="title"><InlineText :text="node.lesson.title" /></span>
              <span class="sub"><InlineText :text="node.lesson.goal" /></span>
            </span>
            <span class="mins">{{ node.lesson.minutes }} 分</span>
          </RouterLink>

          <RouterLink
            v-else
            :to="quizPath(level, chapter, node.quiz)"
            class="node quiz"
            :class="{ done: isQuizDone(node.quiz, progress) }"
          >
            <span class="tick" aria-hidden="true">{{ isQuizDone(node.quiz, progress) ? '✓' : '◇' }}</span>
            <span class="body">
              <span class="title">{{ node.quiz.title }}</span>
              <span class="sub">把前三課混在一起考 12 題，答對八成通過。</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>

  <p v-else class="missing">找不到這一章。</p>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; }

.crumbs { margin-bottom: var(--s-4); font-size: var(--t-xs); color: var(--muted); }
.crumbs a { color: inherit; text-decoration: none; }
.crumbs a:hover { color: var(--text); }

.kicker { margin: 0 0 var(--s-1); font-size: var(--t-xs); font-weight: 700; letter-spacing: 0.06em; color: var(--brand-solid); }
h1 { margin: 0 0 var(--s-2); font-size: 30px; line-height: 1.3; }
.goal { margin: 0 0 var(--s-4); font-size: var(--t-md); color: var(--text-2); line-height: 1.7; }

.head { margin-bottom: var(--s-6); }

.progress { display: flex; align-items: center; gap: var(--s-3); }
.progress span { font-size: var(--t-xs); color: var(--muted); font-variant-numeric: tabular-nums; }

h2 { margin: 0 0 var(--s-3); font-size: var(--t-lg); }

.covers { margin-bottom: var(--s-6); }
.covers ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s-2); }
.covers li {
  padding: var(--s-1) var(--s-3);
  border: 1px solid var(--edge);
  border-radius: var(--r-full);
  background: var(--surface);
  font-size: var(--t-sm);
  color: var(--text-2);
}

.book, .beyond, .kanji-line {
  margin: var(--s-3) 0 0;
  font-size: var(--t-xs);
  color: var(--muted);
  line-height: 1.7;
}
.beyond { color: hsl(38 70% 42%); }
.kanji-line span { font-size: var(--t-md); color: var(--text); letter-spacing: 0.05em; }

.pending {
  padding: var(--s-6);
  border: 1px dashed var(--edge);
  border-radius: var(--r-lg);
  text-align: center;
}
.pending p { margin: 0 0 var(--s-5); font-size: var(--t-sm); color: var(--text-2); line-height: 1.7; }

.cta {
  display: inline-flex; align-items: center;
  min-height: var(--tap); padding: 0 var(--s-5);
  border-radius: var(--r-md);
  background: var(--brand); color: #fff;
  font-weight: 700; text-decoration: none;
}

.nodes ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); }

.node {
  display: flex;
  align-items: flex-start;
  gap: var(--s-3);
  padding: var(--s-4);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  text-decoration: none;
  color: var(--text);
  transition: border-color var(--dur-fast);
}
.node:hover { border-color: var(--brand-solid); }

.tick { flex: none; width: 18px; text-align: center; color: var(--trail); }
.node.done .tick { color: hsl(152 52% 40%); }

.body { flex: 1; min-width: 0; }
.title { display: block; font-weight: 600; line-height: 1.5; }
.sub { display: block; margin-top: 2px; font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }
.mins { flex: none; font-size: var(--t-xs); color: var(--muted); }
.node.quiz { border-style: dashed; }

.missing { max-width: 720px; margin: 0 auto; color: var(--muted); }
</style>
