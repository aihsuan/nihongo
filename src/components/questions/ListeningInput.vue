<script setup lang="ts">
/**
 * 聽解。選項一律是文字 —— 考試的圖片選項題本站不做，理由寫在 types.ts。
 *
 * 播放鍵放在作答區的最上面而不是題幹旁邊，因為聽解題「按播放」是作答的第一步，
 * 不是題幹的附屬功能。沒有日語語音的機器上會明說，不會給一顆按了沒反應的鈕。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import type { ListeningQuestion } from '../../core/types'
import { shuffleStable } from '../../core/quiz'
import { useSpeech } from '../../composables/useSpeech'
import InlineText from '../InlineText.vue'

const props = defineProps<{
  question: ListeningQuestion
  answer: number | undefined
  disabled: boolean
  revealed: boolean
}>()

const emit = defineEmits<{ pick: [index: number] }>()

const { speakLines, stop, supported } = useSpeech()
const played = ref(0)

const lines = computed<{ text: string; who?: 'A' | 'B' }[]>(() =>
  props.question.script
    ? props.question.script.map((l) => ({ text: l.text, who: l.who }))
    : [{ text: props.question.speak }],
)

function play() {
  speakLines(lines.value)
  played.value += 1
}

onBeforeUnmount(stop)

const shuffled = computed(() =>
  shuffleStable(
    props.question.options.map((text, i) => ({ text, i })),
    props.question.id,
  ),
)

const stateOf = (i: number) => {
  if (!props.revealed) return props.answer === i ? 'picked' : ''
  if (i === props.question.answerIndex) return 'right'
  return props.answer === i ? 'wrong' : ''
}
</script>

<template>
  <div class="listening">
    <div class="player">
      <button v-if="supported" class="play" @click="play">
        <span class="icon" aria-hidden="true">▶</span>
        {{ played === 0 ? '播放' : '再聽一次' }}
      </button>
      <p v-else class="novoice">這台電腦沒有日語語音，聽解題無法播放。</p>
      <span v-if="supported && played > 0" class="count">已播放 {{ played }} 次</span>
    </div>

    <!-- 對話內容只在揭曉後顯示。沒揭曉就印出來的話這題就變成閱讀測驗了。 -->
    <div v-if="revealed" class="script">
      <p v-for="(l, i) in lines" :key="i">
        <span v-if="l.who" class="who">{{ l.who }}</span>
        <InlineText :text="l.text" />
      </p>
    </div>

    <div class="options" role="radiogroup" :aria-label="question.prompt">
      <button
        v-for="opt in shuffled"
        :key="opt.i"
        class="opt"
        :class="stateOf(opt.i)"
        role="radio"
        :aria-checked="answer === opt.i"
        :disabled="disabled"
        @click="emit('pick', opt.i)"
      >
        <InlineText :text="opt.text" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.listening { display: grid; gap: var(--s-4); }

.player { display: flex; align-items: center; gap: var(--s-3); flex-wrap: wrap; }

.play {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  min-height: var(--tap);
  padding: 0 var(--s-5);
  border: none;
  border-radius: var(--r-pill);
  background: var(--brand-solid);
  color: var(--on-brand);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
  transition: transform var(--dur-fast), filter var(--dur-fast);
}

.play:hover { filter: brightness(1.06); }
.play:active { transform: scale(0.97); }
.icon { font-size: var(--t-sm); }

.count, .novoice { margin: 0; font-size: var(--t-sm); color: var(--text-dim); }

.script {
  display: grid;
  gap: var(--s-1);
  padding: var(--s-3) var(--s-4);
  border-radius: var(--r-md);
  background: var(--surface-2);
  font-size: var(--t-md);
}

.script p { margin: 0; }

.who {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-right: var(--s-2);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-dim);
  font-size: var(--t-xs);
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--s-3);
}

.opt {
  min-height: var(--tap);
  padding: var(--s-3) var(--s-4);
  border: 1.5px solid var(--edge);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: var(--t-md);
  cursor: pointer;
  transition: border-color var(--dur-fast), background var(--dur-fast), transform var(--dur-fast);
}

.opt:hover:not(:disabled) { border-color: var(--brand-solid); }
.opt:active:not(:disabled) { transform: scale(0.985); }
.opt:disabled { cursor: default; }

.opt.picked { border-color: var(--brand-solid); background: color-mix(in srgb, var(--brand-solid) 10%, transparent); }
.opt.right { border-color: hsl(152 52% 40%); background: color-mix(in srgb, hsl(152 52% 40%) 14%, transparent); }
.opt.wrong { border-color: hsl(4 64% 52%); background: color-mix(in srgb, hsl(4 64% 52%) 12%, transparent); }
</style>
