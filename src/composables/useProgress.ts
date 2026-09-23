/**
 * 進度存取。目前存 localStorage，之後換成 Supabase 時只要改這一個檔案，
 * 畫面層與 core 層都不用動。
 */
import { computed, reactive, watch } from 'vue'
import type { Question } from '../core/types'
import { emptyProgress, lessonPassed, quizPassed } from '../core/progress'
import type { Progress } from '../core/progress'
import { createRecord, review } from '../core/srs'
import type { ReviewRecord } from '../core/srs'

/** v1 是闖關地圖時代的 stageId，資料模型整個換掉了，不做遷移。 */
const KEY = 'nihongo.progress.v2'

interface Stored {
  lessons: Record<string, import('../core/types').LessonProgress>
  quizzes: Record<string, import('../core/types').QuizProgress>
  srs: Record<string, ReviewRecord>
  /** 錯題本：題目 id → 答錯次數 */
  wrong: Record<string, number>
}

interface State extends Progress {
  srs: Map<string, ReviewRecord>
  /** 題目 id → 累計答錯次數 */
  wrong: Map<string, number>
}

/** 錯幾次才進錯題本。錯一次可能只是手滑或沒看清楚，錯兩次才是真的沒學起來。 */
export const WRONG_THRESHOLD = 2

function load(): State {
  const base: State = { ...emptyProgress(), srs: new Map(), wrong: new Map() }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return base
    const s = JSON.parse(raw) as Partial<Stored> & { wrong?: string[] | Record<string, number> }

    // 舊格式的 wrong 是一個 id 陣列（只記「錯過」不記次數），讀進來一律當成錯一次
    const rawWrong = s.wrong
    const wrong = Array.isArray(rawWrong)
      ? new Map(rawWrong.map((id) => [id, 1] as const))
      : new Map(Object.entries(rawWrong ?? {}))

    return {
      lessons: new Map(Object.entries(s.lessons ?? {})),
      quizzes: new Map(Object.entries(s.quizzes ?? {})),
      srs: new Map(Object.entries(s.srs ?? {})),
      wrong,
    }
  } catch {
    return base
  }
}

const state = reactive(load()) as State

watch(
  state,
  (s) => {
    try {
      const out: Stored = {
        lessons: Object.fromEntries(s.lessons),
        quizzes: Object.fromEntries(s.quizzes),
        srs: Object.fromEntries(s.srs),
        wrong: Object.fromEntries(s.wrong),
      }
      localStorage.setItem(KEY, JSON.stringify(out))
    } catch {
      /* 無痕模式或封鎖儲存時靜默略過 */
    }
  },
  { deep: true },
)

/**
 * 每答一題就更新該題所有知識點的熟悉度。
 * 答錯不歸零、只退一級 —— 歸零會讓人放棄。
 */
function touchSrs(question: Question, correct: boolean) {
  for (const kp of question.knowledgePoints) {
    const existing = state.srs.get(kp) ?? createRecord(kp)
    state.srs.set(kp, review(existing, correct))
  }
}

/**
 * 累計答錯次數。答對就歸零移出去。
 *
 * 只有錯到 WRONG_THRESHOLD 次才會出現在錯題本裡 ——
 * 走查時發現「錯一次就收」的話，走完第 1 章（30 題）就有 18 題進錯題本，
 * 六成的比例讓那份清單失去意義，第一天打開只會覺得挫折。
 */
function touchWrongBook(question: Question, correct: boolean) {
  if (correct) state.wrong.delete(question.id)
  else state.wrong.set(question.id, (state.wrong.get(question.id) ?? 0) + 1)
}

export function useProgress() {
  /**
   * 單課作答：每一題的首答對錯決定顯示成績，最終全對才算完成。
   * results 是「首答是否正確」，finalCorrect 是「最後有沒有訂正到對」。
   */
  function completeLesson(
    lessonId: string,
    questions: Question[],
    firstTry: Map<string, boolean>,
    finalCorrect: Map<string, boolean>,
  ) {
    for (const q of questions) {
      const first = firstTry.get(q.id) ?? false
      touchSrs(q, first)
      // 當場訂正回來的題目仍然進錯題本：訂正只代表你看過答案了
      touchWrongBook(q, first)
    }

    const finished = questions.filter((q) => finalCorrect.get(q.id)).length
    const passed = lessonPassed(finished, questions.length)

    // 「首答」的意義就是第一次。之後回來複習不該蓋掉那個數字 ——
    // 蓋掉的話，三個月後重做一次就看不出自己當初錯在哪、進步了多少。
    const previous = state.lessons.get(lessonId)
    state.lessons.set(lessonId, {
      lessonId,
      firstTryCorrect:
        previous?.completedAt != null
          ? previous.firstTryCorrect
          : questions.filter((q) => firstTry.get(q.id)).length,
      total: questions.length,
      completedAt: previous?.completedAt ?? (passed ? new Date().toISOString() : null),
    })
  }

  /** 試題：考卷式，送出一次算一次，取歷來最高分。 */
  function recordQuiz(
    quizId: string,
    questions: Question[],
    correctMap: Map<string, boolean>,
  ) {
    for (const q of questions) {
      const ok = correctMap.get(q.id) ?? false
      touchSrs(q, ok)
      touchWrongBook(q, ok)
    }

    const correct = questions.filter((q) => correctMap.get(q.id)).length
    const score = questions.length === 0 ? 0 : correct / questions.length
    const prev = state.quizzes.get(quizId)
    const best = Math.max(score, prev?.bestScore ?? 0)

    state.quizzes.set(quizId, {
      quizId,
      bestScore: best,
      attempts: (prev?.attempts ?? 0) + 1,
      lastWrongIds: questions.filter((q) => !correctMap.get(q.id)).map((q) => q.id),
      completedAt: quizPassed(best) ? (prev?.completedAt ?? new Date().toISOString()) : null,
    })
  }

  /**
   * 複習與錯題重做：更新熟悉度，但不碰任何成績。
   * 複習是維持，不是前進；計分會讓「最高分」變成用時間磨出來的。
   */
  function recordReview(questions: Question[], correctMap: Map<string, boolean>) {
    for (const q of questions) {
      const ok = correctMap.get(q.id) ?? false
      touchSrs(q, ok)
      touchWrongBook(q, ok)
    }
  }

  function reset() {
    state.lessons.clear()
    state.quizzes.clear()
    state.srs.clear()
    state.wrong.clear()
  }

  /** 真的進錯題本的（錯到門檻次數的） */
  const wrongIds = computed(() =>
    [...state.wrong.entries()].filter(([, n]) => n >= WRONG_THRESHOLD).map(([id]) => id),
  )

  return {
    state,
    progress: state as Progress,
    wrongIds,
    wrongCount: computed(() => wrongIds.value.length),
    completeLesson,
    recordQuiz,
    recordReview,
    reset,
  }
}
