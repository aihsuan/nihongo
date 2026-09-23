<script setup lang="ts">
/**
 * 總覽頁。打開網站的第一眼。
 *
 * 直接跳回上次那一課會讓人永遠看不到自己的整體進度 ——
 * 而「看得到進度」正是這個產品放棄闖關地圖改成課程大綱的理由。
 */
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { levels, n5, quizById } from '../data/levels'
import { lessonPath, quizPath, levelPath } from '../data/routes'
import { levelCompletion, levelDone, levelTotal, nextNode } from '../core/progress'
import { useProgress } from '../composables/useProgress'
import ProgressBar from '../components/ProgressBar.vue'
import { KANJI } from '../data/n5/kanji'
import { VOCAB } from '../data/n5/vocab'

const KANJI_COUNT = KANJI.length
const VOCAB_COUNT = VOCAB.length

const { progress, state, wrongCount } = useProgress()

/**
 * 練習試題的題庫總量。
 * 原本這張卡是「今日複習」，照 SRS 排程每天推到期的知識點 ——
 * 拿掉了，因為學習者要複習會自己回去點那一課，
 * 系統排程的每日複習在這個產品裡是多餘的一層。
 */
const practiceCount = computed(() =>
  levels
    .flatMap((l) => l.chapters)
    .reduce(
      (n, c) =>
        n +
        c.lessons.reduce((m, x) => m + x.questions.length, 0) +
        c.quizzes.reduce((m, q) => m + q.bank.length, 0),
      0,
    ),
)

const pct = computed(() => levelCompletion(n5, progress))
const doneCount = computed(() => levelDone(n5, progress))
const total = computed(() => levelTotal(n5))

const next = computed(() => {
  const node = nextNode(n5, progress)
  if (!node) return null
  return node.kind === 'lesson'
    ? {
        kicker: `第 ${node.chapter.order} 章 · ${node.chapter.title}`,
        title: node.lesson.title,
        goal: node.lesson.goal,
        to: lessonPath(n5, node.chapter, node.lesson),
        cta: doneCount.value === 0 ? '開始第一課' : '繼續這一課',
      }
    : {
        kicker: `第 ${node.chapter.order} 章 · 階段驗收`,
        title: node.quiz.title,
        goal: '把前三課的內容混在一起考一次，確認接得起來。',
        to: quizPath(n5, node.chapter, node.quiz),
        cta: '開始驗收',
      }
})

/**
 * 最近三次試題成績。
 * 顯示的是驗收的名字 —— 原本直接印 quizId（「n5-c1-quiz1」），
 * 那是內部識別碼，使用者看不懂自己考的是什麼。
 */
const recent = computed(() =>
  [...state.quizzes.values()]
    .filter((q) => q.attempts > 0)
    .slice(-3)
    .reverse()
    .map((q) => {
      const found = quizById.get(q.quizId)
      return {
        ...q,
        title: found?.quiz.title ?? q.quizId,
        chapter: found ? `第 ${found.chapter.order} 章` : '',
      }
    }),
)

const root = ref<HTMLElement | null>(null)

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (reduced() || !root.value) return
  gsap.from(root.value.querySelectorAll('[data-rise]'), {
    autoAlpha: 0,
    y: 12,
    duration: 0.4,
    stagger: 0.06,
    ease: 'power2.out',
  })
})

onBeforeUnmount(() => {
  if (root.value) gsap.killTweensOf(root.value.querySelectorAll('[data-rise]'))
})
</script>

<template>
  <div ref="root" class="page">
    <header data-rise class="hero">
      <h1>歡迎回來</h1>
      <p>從平假名開始，一路把 N5 走完。可以照順序，也可以跳著學。</p>
    </header>

    <section v-if="next" data-rise class="continue">
      <p class="kicker">{{ next.kicker }}</p>
      <h2>{{ next.title }}</h2>
      <p class="goal">{{ next.goal }}</p>
      <RouterLink class="cta" :to="next.to">{{ next.cta }}</RouterLink>
    </section>

    <!--
      走到 100% 是整個產品最有成就感的一刻，不該是最空的一頁。
      原本這裡寫「其餘章節還在製作中」—— 十七章全部寫完之後那句話就變成假的了。
    -->
    <section v-else data-rise class="continue done">
      <p class="kicker">N5 完成</p>
      <h2>十七章全部走完了</h2>
      <p class="goal">
        {{ total }} 個節點、{{ KANJI_COUNT }} 個漢字、{{ VOCAB_COUNT }} 個單字。
        接下來可以做的：用練習試題把整個題庫再過一遍、清空錯題本，或挑一份驗收重考看看能不能首答全對。
      </p>
      <div class="done-actions">
        <RouterLink class="cta" to="/practice">練習試題</RouterLink>
        <RouterLink class="cta ghost" to="/wrong">打開錯題本</RouterLink>
      </div>
    </section>

    <div class="grid">
      <section data-rise class="card">
        <h3>N5 進度</h3>
        <p class="big">{{ Math.round(pct * 100) }}<span class="unit">%</span></p>
        <ProgressBar size="level" :value="pct" :hue="n5.hue" />
        <p class="sub">{{ doneCount }} / {{ total }} 個節點（含階段驗收）</p>
      </section>

      <RouterLink data-rise class="card link" to="/practice">
        <h3>練習試題</h3>
        <p class="big">{{ practiceCount }}<span class="unit">題</span></p>
        <p class="sub">N5–N1 的題庫，選章節抽 15 題，優先出你比較生疏的。</p>
      </RouterLink>

      <RouterLink data-rise class="card link" to="/wrong">
        <h3>錯題本</h3>
        <p class="big">{{ wrongCount }}<span class="unit">題</span></p>
        <p class="sub">
          {{ wrongCount === 0 ? '同一題答錯兩次才會收進來。' : '答對就會從這裡移出去。重做不影響成績。' }}
        </p>
      </RouterLink>
    </div>

    <section v-if="recent.length" data-rise class="recent">
      <h3>最近的驗收成績</h3>
      <ul>
        <li v-for="r in recent" :key="r.quizId">
          <span class="rq">
            <span class="rc">{{ r.chapter }}</span>
            {{ r.title }}
          </span>
          <span class="rs">{{ Math.round(r.bestScore * 100) }}%</span>
          <span class="ra">考了 {{ r.attempts }} 次</span>
        </li>
      </ul>
    </section>

    <section data-rise class="levels">
      <h3>所有級別</h3>
      <ul>
        <li v-for="l in levels" :key="l.id">
          <RouterLink :to="levelPath(l)" :style="{ '--hue': String(l.hue) }">
            <span class="lid">{{ l.title }}</span>
            <span class="lsub">{{ l.subtitle }}</span>
            <span v-if="l.pending" class="chip">準備中</span>
            <span v-else class="lpct">{{ Math.round(levelCompletion(l, progress) * 100) }}%</span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 720px; margin: 0 auto; display: grid; gap: var(--s-6); }

.hero h1 { margin: 0 0 var(--s-2); font-size: 32px; letter-spacing: -0.01em; }
.hero p { margin: 0; color: var(--text-2); font-size: var(--t-md); }

.continue {
  padding: var(--s-6);
  border-radius: var(--r-xl);
  background: var(--brand);
  color: #fff;
}

/* 完成狀態仍然是一張有份量的卡，只是換個色調 */
.continue.done {
  background: linear-gradient(140deg, hsl(152 48% 34%), hsl(172 46% 30%));
  color: #fff;
}

.done-actions { display: flex; flex-wrap: wrap; gap: var(--s-3); }

.cta.ghost {
  background: transparent;
  color: #fff;
  box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 0.5);
}

.kicker {
  margin: 0 0 var(--s-2);
  font-size: var(--t-xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 0.85;
}

.continue h2 { margin: 0 0 var(--s-2); font-size: var(--t-xl); line-height: 1.4; }
.continue .goal { margin: 0 0 var(--s-5); font-size: var(--t-sm); line-height: 1.7; opacity: 0.9; }

.cta {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap);
  padding: 0 var(--s-5);
  border-radius: var(--r-md);
  background: #fff;
  color: #2b3245;
  font-weight: 700;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--s-4);
}

.card {
  padding: var(--s-5);
  border: 1px solid var(--edge);
  border-radius: var(--r-lg);
  background: var(--surface);
}

.card.link { text-decoration: none; color: inherit; transition: border-color var(--dur-fast); }
.card.link:hover { border-color: var(--brand-solid); }

.card h3 { margin: 0 0 var(--s-3); font-size: var(--t-sm); color: var(--muted); font-weight: 600; }

.big { margin: 0 0 var(--s-3); font-size: 34px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
.unit { font-size: var(--t-md); font-weight: 600; color: var(--muted); margin-left: 2px; }

.sub { margin: var(--s-3) 0 0; font-size: var(--t-xs); color: var(--muted); line-height: 1.6; }

.recent h3, .levels h3 { margin: 0 0 var(--s-3); font-size: var(--t-md); }

.recent ul, .levels ul { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); }

.recent li {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--edge);
  border-radius: var(--r-md);
  font-size: var(--t-sm);
}
.rq { flex: 1; min-width: 0; color: var(--text-2); overflow: hidden; text-overflow: ellipsis; }
.rc { margin-right: var(--s-2); font-size: var(--t-xs); color: var(--muted); }
.rs { font-weight: 700; font-variant-numeric: tabular-nums; }
.ra { font-size: var(--t-xs); color: var(--muted); }

.levels a {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  border: 1px solid var(--edge);
  border-left: 3px solid hsl(var(--hue) 52% 46%);
  border-radius: var(--r-md);
  background: var(--surface);
  text-decoration: none;
  color: var(--text);
  min-height: var(--tap);
}
.levels a:hover { background: var(--surface-2); }

.lid { font-weight: 700; }
.lsub { flex: 1; min-width: 0; font-size: var(--t-xs); color: var(--muted); }
.lpct { font-size: var(--t-sm); font-variant-numeric: tabular-nums; color: var(--text-2); }

.chip {
  padding: 1px var(--s-2);
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}
</style>
