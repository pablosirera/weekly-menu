<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarDaysIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const isActive = computed(() => ({
  home: route.name === 'HomePage',
  shopping: route.name === 'ShoppingPage',
  recipes: route.name === 'RecipesPage',
}))
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 pb-24"
  >
    <main class="mx-auto max-w-screen-xl px-4 py-6 lg:px-8">
      <section
        class="rounded-[28px] border border-slate-100 bg-white px-5 pb-8 pt-6 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            type="button"
          >
            <CalendarDaysIcon class="h-5 w-5" />
          </button>
          <div class="text-center">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">
              Weekly Menu
            </p>
            <h1 class="text-2xl font-semibold text-slate-900">Weekly Menu</h1>
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            type="button"
          >
            <Cog6ToothIcon class="h-5 w-5" />
          </button>
        </div>

        <div class="mt-6">
          <slot />
        </div>
      </section>
    </main>

    <nav
      class="bottom-tabs z-50 w-full border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div class="mx-auto grid max-w-md grid-cols-4 px-6 py-3 text-xs">
        <RouterLink
          class="flex flex-col items-center gap-1"
          :class="isActive.home ? 'text-emerald-500' : 'text-slate-400'"
          to="/"
        >
          <HomeIcon class="h-5 w-5" />
          Planificador
        </RouterLink>
        <RouterLink
          class="flex flex-col items-center gap-1"
          :class="isActive.shopping ? 'text-emerald-500' : 'text-slate-400'"
          to="/shopping"
        >
          <ShoppingBagIcon class="h-5 w-5" />
          Compra
        </RouterLink>
        <RouterLink
          class="flex flex-col items-center gap-1"
          :class="isActive.recipes ? 'text-emerald-500' : 'text-slate-400'"
          to="/recipes"
        >
          <Squares2X2Icon class="h-5 w-5" />
          Recetas
        </RouterLink>
        <button
          class="flex flex-col items-center gap-1 text-slate-400"
          type="button"
        >
          <UserCircleIcon class="h-5 w-5" />
          Perfil
        </button>
      </div>
    </nav>
  </div>
</template>
