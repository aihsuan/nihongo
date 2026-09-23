<script setup lang="ts">
/**
 * 渲染內容裡的行內標記：振り仮名與強調。
 *
 * 從第 3 章開始每一課都有漢字，題幹裡的漢字一律標音 ——
 * 讓人卡在「這個字怎麼唸」而答不出文法題，考的就不是文法了。
 * 漢字讀法本身另外出題，那種題目的目標詞當然不標音。
 */
import { computed } from 'vue'
import { parseInline } from '../core/inline'

const props = defineProps<{ text: string }>()

const segments = computed(() => parseInline(props.text))
</script>

<template>
  <span class="inline-text">
    <template v-for="(seg, i) in segments" :key="i">
      <strong v-if="seg.bold">
        <ruby v-if="seg.ruby">{{ seg.base }}<rt>{{ seg.ruby }}</rt></ruby>
        <template v-else>{{ seg.base }}</template>
      </strong>
      <ruby v-else-if="seg.ruby">{{ seg.base }}<rt>{{ seg.ruby }}</rt></ruby>
      <template v-else>{{ seg.base }}</template>
    </template>
  </span>
</template>

<style scoped>
/* ruby 會把行高撐高，所以承載它的容器一律不給固定高度 */
.inline-text { line-height: 2; }

strong { font-weight: 700; color: var(--text); }
</style>
