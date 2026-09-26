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
    // 速查區。/ref 不自己是一頁 —— 沒有「總覽」可看，直接落到第一個分類。
    {
      // 平假名・片假名對照練習紙。和課程裡的 /print/:printId 是兩種紙，
      // 這張是兩種字形一起練，所以另開一個畫面而不是塞參數。
      path: '/print/kana/:scope',
      name: 'kana-print',
      component: () => import('./views/KanaPrintView.vue'),
    },
    {
      // 速查表的列印版：一次印一整類（乾淨版／填空版在畫面上切換）
      path: '/print/ref/:category',
      name: 'reference-print',
      component: () => import('./views/ReferencePrintView.vue'),
    },
    { path: '/ref', redirect: '/ref/kana' },
    {
      path: '/ref/:category',
      name: 'reference',
      component: () => import('./views/ReferenceView.vue'),
    },
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
