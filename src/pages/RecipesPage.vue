<script setup>
import { computed, onMounted, ref } from 'vue'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseLayout from '@/components/BaseLayout.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeFormModal from '@/components/RecipeFormModal.vue'
import RecipeDetailsModal from '@/components/RecipeDetailsModal.vue'
import { useRecipes } from '@/composables/useRecipes'

const { listAllRecipes } = useRecipes()

const recipes = ref([])
const isLoading = ref(false)
const search = ref('')

const showFormModal = ref(false)
const formMode = ref('create')
const recipeToEdit = ref(null)

const showDetailsModal = ref(false)
const recipeToView = ref(null)

const filteredRecipes = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return recipes.value

  return recipes.value.filter(recipe => {
    const titleMatch = recipe.title?.toLowerCase().includes(query)
    const descriptionMatch = recipe.description?.toLowerCase().includes(query)
    const tagMatch = recipe.tags?.some(tag => tag.toLowerCase().includes(query))

    return titleMatch || descriptionMatch || tagMatch
  })
})

const loadRecipes = async () => {
  isLoading.value = true
  try {
    const data = await listAllRecipes()
    recipes.value = data.sort((a, b) => {
      const aDate = new Date(a.updated_at || a.created_at || 0)
      const bDate = new Date(b.updated_at || b.created_at || 0)
      return bDate - aDate
    })
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  formMode.value = 'create'
  recipeToEdit.value = null
  showFormModal.value = true
}

const openEditModal = recipe => {
  formMode.value = 'edit'
  recipeToEdit.value = recipe
  showFormModal.value = true
}

const openDetailsModal = recipe => {
  recipeToView.value = recipe
  showDetailsModal.value = true
}

const closeFormModal = async () => {
  showFormModal.value = false
  await loadRecipes()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
}

onMounted(loadRecipes)
</script>

<template>
  <BaseLayout>
    <section class="space-y-6">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
          >
            Catálogo
          </p>
          <h2 class="text-3xl font-semibold text-slate-900">Recetas</h2>
          <p class="mt-1 text-sm text-slate-500">
            Guarda tus recetas, tiempos, raciones y notas clave en un solo
            lugar.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5" />
          Nueva receta
        </button>
      </div>

      <div
        class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row md:items-center"
      >
        <div
          class="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
        >
          <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre, descripcion o tag"
            class="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>
        <div class="text-xs font-semibold text-slate-500">
          {{ filteredRecipes.length }} recetas
        </div>
      </div>

      <div v-if="isLoading" class="text-sm text-slate-500">Cargando...</div>

      <div
        v-else-if="!filteredRecipes.length"
        class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
      >
        Aun no tienes recetas. Crea la primera con el boton "Nueva receta".
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <RecipeCard
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
          @edit="openEditModal"
          @view="openDetailsModal"
        />
      </div>
    </section>

    <RecipeFormModal
      v-if="showFormModal"
      :mode="formMode"
      :recipe="recipeToEdit"
      @close="closeFormModal"
    />

    <RecipeDetailsModal
      v-if="showDetailsModal"
      :recipe="recipeToView"
      @close="closeDetailsModal"
    />
  </BaseLayout>
</template>
