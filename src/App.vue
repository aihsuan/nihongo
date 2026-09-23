<script setup lang="ts">
/**
 * 版面外殼：左側固定 280px 的課程大綱，右側內容欄。
 * 900px 以下側欄收成抽屜 —— 不做底部 tab bar，那是 app 的語彙，
 * 這是課程平台。
 */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()
const drawerOpen = ref(false)

/** 列印頁不要側欄，整頁就是那張要印出來的紙 */
const bare = computed(() => route.name === 'print')

watch(() => route.fullPath, () => { drawerOpen.value = false })
</script>

<template>
  <RouterView v-if="bare" />

  <div v-else class="shell" :class="{ 'drawer-open': drawerOpen }">
    <header class="topbar">
      <button
        class="hamburger"
        :aria-expanded="drawerOpen"
        aria-controls="outline"
        @click="drawerOpen = !drawerOpen"
      >
        <span aria-hidden="true">☰</span>
        <span class="sr">課程大綱</span>
      </button>
      <span class="topbar-title">NihonGo</span>
    </header>

    <div
      class="scrim"
      :hidden="!drawerOpen"
      @click="drawerOpen = false"
    />

    <aside id="outline" class="rail">
      <AppSidebar @navigate="drawerOpen = false" />
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
}

.topbar { display: none; }

.rail {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
}

.content {
  min-width: 0;
  padding: var(--s-7) var(--s-5) var(--s-8);
}

.scrim { display: none; }

.sr {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 900px) {
  .shell { grid-template-columns: minmax(0, 1fr); }

  .topbar {
    position: sticky;
    top: env(safe-area-inset-top, 0px);
    z-index: 3;
    display: flex;
    align-items: center;
    gap: var(--s-3);
    height: 52px;
    padding: 0 var(--s-4);
    background: var(--surface);
    border-bottom: 1px solid var(--edge);
  }

  .hamburger {
    display: grid;
    place-items: center;
    width: var(--tap);
    height: var(--tap);
    margin-left: calc(var(--s-3) * -1);
    border: 0;
    border-radius: var(--r-sm);
    background: none;
    color: var(--text);
    font-size: var(--t-lg);
    cursor: pointer;
  }

  .topbar-title { font-weight: 700; }

  .rail {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 5;
    width: min(300px, 86vw);
    transform: translateX(-100%);
    transition: transform var(--dur-base) var(--ease-out);
  }

  .drawer-open .rail { transform: none; }

  /* 只有抽屜打開時才鋪遮罩。
     `[hidden]` 的預設 display:none 特異性低於 .scrim，
     單靠 :hidden 擋不住，遮罩會永遠蓋在畫面上把點擊全部吃掉。 */
  .drawer-open .scrim {
    position: fixed;
    inset: 0;
    z-index: 4;
    display: block;
    background: var(--scrim);
  }

  .content { padding: var(--s-5) var(--s-4) var(--s-8); }
}
</style>
