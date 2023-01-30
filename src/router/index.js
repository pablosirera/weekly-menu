import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import { useAuth } from '../composables/useAuth'
import { useUser } from '../composables/useUser'

const { getSession } = useAuth()
const { isAuthenticated } = useUser()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'LoginPage',
      component: () => import('@/pages/LoginPage.vue'),
    },
  ],
})

router.beforeEach(to => {
  getSession()

  if (!isAuthenticated() && to.meta.requiresAuth) {
    return { name: 'LoginPage' }
  }
})

export default router
