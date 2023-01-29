import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import useAuth from '../composables/useAuth'

const { getSession } = useAuth()
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: () => import('@/pages/LoginPage.vue'),
    },
  ],
})

router.beforeEach(() => {
  getSession()
})

export default router
