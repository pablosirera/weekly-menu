<script setup>
import { ClockIcon, UserGroupIcon, TagIcon } from '@heroicons/vue/24/outline'

defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

defineEmits(['view', 'edit'])
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="relative h-40 w-full overflow-hidden">
      <img
        v-if="recipe.photo_url"
        :src="recipe.photo_url"
        :alt="recipe.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50"
      >
        <span
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          >Receta</span
        >
      </div>
      <button
        type="button"
        class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow"
        @click="$emit('view', recipe)"
      >
        Ver detalle
      </button>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ recipe.title || 'Sin titulo' }}
        </h3>
        <p class="mt-2 line-clamp-3 text-sm text-slate-600">
          {{ recipe.description || 'Sin descripcion.' }}
        </p>
      </div>

      <div
        class="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600"
      >
        <span
          v-if="recipe.prep_minutes || recipe.cook_minutes"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"
        >
          <ClockIcon class="h-4 w-4" />
          <span>
            {{ recipe.prep_minutes || 0 }}m prep ·
            {{ recipe.cook_minutes || 0 }}m coccion
          </span>
        </span>
        <span
          v-if="recipe.servings"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"
        >
          <UserGroupIcon class="h-4 w-4" />
          {{ recipe.servings }} raciones
        </span>
        <span
          v-if="recipe.tags && recipe.tags.length"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700"
        >
          <TagIcon class="h-4 w-4" />
          {{ recipe.tags.slice(0, 2).join(', ') }}
        </span>
      </div>

      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          @click="$emit('view', recipe)"
        >
          Ver
        </button>
        <button
          type="button"
          class="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          @click="$emit('edit', recipe)"
        >
          Editar
        </button>
      </div>
    </div>
  </article>
</template>
