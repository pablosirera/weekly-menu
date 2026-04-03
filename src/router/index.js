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
    {
      path: '/recipes',
      name: 'RecipesPage',
      component: () => import('@/pages/RecipesPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/shopping',
      name: 'ShoppingPage',
      component: () => import('@/pages/ShoppingPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(to => {
  const { isAuthenticated } = useUser()
  if (!to.meta.requiresAuth) return true
  if (isAuthenticated()) return true
  return { name: 'LoginPage' }
})

export default router
