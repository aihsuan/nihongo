<script setup lang="ts">
/**
 * 進度條只有兩種尺寸：級別列與章列。
 * 單課不給進度條 —— 三層進度條會把側欄變成一片進度條牆。
 */
const props = withDefaults(
  defineProps<{
    value: number
    hue?: number
    size?: 'level' | 'chapter'
  }>(),
  { size: 'chapter' },
)

const pct = () => `${Math.round(Math.min(1, Math.max(0, props.value)) * 100)}%`
</script>

<template>
  <div
    class="bar"
    :class="size"
    :style="hue !== undefined ? { '--hue': String(hue) } : undefined"
    role="progressbar"
    :aria-valuenow="Math.round(value * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span class="fill" :style="{ width: pct() }" />
  </div>
</template>

<style scoped>
.bar {
  position: relative;
  width: 100%;
  background: var(--surface-2);
  border-radius: var(--r-full);
  overflow: hidden;
}

.bar.level { height: 6px; }
.bar.chapter { height: 4px; }

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: hsl(var(--hue, 212) 58% 48%);
  transition: width var(--dur-slow) var(--ease-out);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .fill {
    background: hsl(var(--hue, 212) 62% 58%);
  }
}

:root[data-theme='dark'] .fill {
  background: hsl(var(--hue, 212) 62% 58%);
}
</style>
