import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import { useUser } from '../composables/useUser'

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
  const { isAuthenticated } = useUser()

  if (!isAuthenticated() && to.meta.requiresAuth) {
    return { name: 'LoginPage' }
  }
})

export default router
