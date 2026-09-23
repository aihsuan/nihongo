import { createRouter, createWebHistory } from 'vue-router'

/**
 * 全部的課與試題永遠可直接用網址進入 —— 沒有任何導航守衛擋路。
 * 「可以跳著學」不是一個功能，是這個產品的前提。
 */
export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('./views/DashboardView.vue') },
    { path: '/practice', name: 'practice', component: () => import('./views/PracticeView.vue') },
    {
      path: '/wrong',
      name: 'wrong',
      component: () => import('./views/PracticeView.vue'),
      props: { mode: 'wrong' },
    },
    { path: '/print/:printId', name: 'print', component: () => import('./views/PrintView.vue') },
    { path: '/:level', name: 'level', component: () => import('./views/LevelView.vue') },
    {
      path: '/:level/:chapter(\\d+)',
      name: 'chapter',
      component: () => import('./views/ChapterView.vue'),
    },
    {
      path: '/:level/:chapter(\\d+)/quiz/:index(\\d+)',
      name: 'quiz',
      component: () => import('./views/QuizView.vue'),
    },
    {
      path: '/:level/:chapter(\\d+)/:lesson(\\d+)',
      name: 'lesson',
      component: () => import('./views/LessonView.vue'),
    },
  ],
})
