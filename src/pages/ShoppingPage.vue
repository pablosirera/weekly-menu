<script setup>
import { computed, onMounted, ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import BaseLayout from '@/components/BaseLayout.vue'
import ConvertFreeItemModal from '@/components/ConvertFreeItemModal.vue'
import { usePantry } from '@/composables/usePantry'
import { useRecipes } from '@/composables/useRecipes'
import { getRecipeTypeLabel } from '@/utils/labels'

const {
  listPantryItems,
  createPantryItem,
  markPantryItemCompleted,
  deletePantryItem,
  linkPantryItemToRecipe,
} = usePantry()
const { listAllRecipes } = useRecipes()

const pantryItems = ref([])
const recipes = ref([])
const isLoading = ref(false)
const showConvertModal = ref(false)
const itemToConvert = ref(null)
const addMode = ref('recipe')
const showNotes = ref(false)
const isRecipePickerOpen = ref(false)
const recipeSearch = ref('')

const form = ref({
  recipe_id: '',
  custom_name: '',
  quantity_mode: 'fixed',
  quantity: 1,
  notes: '',
})

const activeItems = computed(() =>
  pantryItems.value.filter(
    item => item.status !== 'eaten' && item.status !== 'discarded',
  ),
)

const completedItems = computed(() =>
  pantryItems.value.filter(
    item => item.status === 'eaten' || item.status === 'discarded',
  ),
)

const selectedRecipe = computed(
  () =>
    recipes.value.find(recipe => recipe.id === form.value.recipe_id) || null,
)

const recipeGroups = computed(() => {
  const groups = new Map()

  for (const recipe of recipes.value) {
    const groupKey = recipe.type || 'other'
    const groupLabel =
      groupKey === 'other' ? 'Otros' : getRecipeTypeLabel(groupKey)

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { key: groupKey, label: groupLabel, items: [] })
    }

    groups.get(groupKey).items.push(recipe)
  }

  return Array.from(groups.values())
})

const filteredRecipeGroups = computed(() => {
  const query = recipeSearch.value.trim().toLowerCase()

  return recipeGroups.value
    .map(group => {
      if (!query) return group

      const items = group.items.filter(recipe => {
        const title = (recipe.title || '').toLowerCase()
        const description = (recipe.description || '').toLowerCase()
        return title.includes(query) || description.includes(query)
      })

      return { ...group, items }
    })
    .filter(group => group.items.length > 0)
})

const canSubmit = computed(() => {
  if (addMode.value === 'recipe') return Boolean(form.value.recipe_id)
  return Boolean(form.value.custom_name.trim())
})

const submitLabel = computed(() =>
  addMode.value === 'recipe' ? 'Añadir receta' : 'Añadir plato libre',
)

const getItemQuantityText = item => {
  if (item.is_open_quantity) return 'Cantidad sin definir'
  return `${item.remaining_quantity} de ${item.quantity} unidades disponibles`
}

const getCompletedQuantityText = item => {
  if (item.is_open_quantity) return 'Cantidad sin definir'
  return `${item.quantity} unidades`
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [items, allRecipes] = await Promise.all([
      listPantryItems(),
      listAllRecipes(),
    ])
    pantryItems.value = items
    recipes.value = allRecipes
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const addItem = async () => {
  const customName = form.value.custom_name.trim()

  if (addMode.value === 'recipe' && !form.value.recipe_id) return
  if (addMode.value === 'free' && !customName) return

  try {
    await createPantryItem({
      recipe_id: addMode.value === 'recipe' ? form.value.recipe_id : null,
      custom_name: addMode.value === 'free' ? customName : null,
      quantity_mode: form.value.quantity_mode,
      quantity:
        form.value.quantity_mode === 'open'
          ? null
          : Number(form.value.quantity) || 1,
      notes: form.value.notes.trim() || null,
    })

    form.value = {
      recipe_id: '',
      custom_name: '',
      quantity_mode: 'fixed',
      quantity: 1,
      notes: '',
    }
    recipeSearch.value = ''
    isRecipePickerOpen.value = false
    showNotes.value = false

    await loadData()
  } catch (error) {
    console.error(error)
  }
}

const setAddMode = mode => {
  addMode.value = mode
  recipeSearch.value = ''
  isRecipePickerOpen.value = false

  if (mode === 'recipe') {
    form.value.custom_name = ''
  } else {
    form.value.recipe_id = ''
  }
}

const selectRecipe = recipe => {
  form.value.recipe_id = recipe.id
  isRecipePickerOpen.value = false
  recipeSearch.value = ''
}

const changeQuantity = delta => {
  const nextValue = Number(form.value.quantity || 1) + delta
  form.value.quantity = Math.max(1, nextValue)
}

const setQuantityMode = mode => {
  form.value.quantity_mode = mode
  if (mode === 'fixed' && (!form.value.quantity || form.value.quantity < 1)) {
    form.value.quantity = 1
  }
}

const toggleComplete = async item => {
  try {
    await markPantryItemCompleted({
      id: item.id,
      completed: item.status !== 'eaten',
    })
    await loadData()
  } catch (error) {
    console.error(error)
  }
}

const removeItem = async item => {
  try {
    await deletePantryItem({ id: item.id })
    await loadData()
  } catch (error) {
    console.error(error)
  }
}

const openConvertModal = item => {
  itemToConvert.value = item
  showConvertModal.value = true
}

const closeConvertModal = () => {
  showConvertModal.value = false
  itemToConvert.value = null
}

const handleConvertedToRecipe = async recipeId => {
  if (!itemToConvert.value?.id || !recipeId) return

  try {
    await linkPantryItemToRecipe({
      id: itemToConvert.value.id,
      recipeId,
    })
    closeConvertModal()
    await loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadData)
</script>

<template>
  <BaseLayout>
    <section class="space-y-6">
      <form
        class="w-full min-w-0 space-y-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        @submit.prevent="addItem"
      >
        <h3 class="text-base font-semibold text-slate-900">Añade tu plato</h3>

        <div
          class="relative flex w-full max-w-xs items-center rounded-full bg-slate-100 p-1"
        >
          <span
            class="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="addMode === 'free' ? 'translate-x-full' : ''"
          ></span>
          <button
            type="button"
            class="relative z-10 flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition"
            :class="addMode === 'recipe' ? 'text-slate-900' : 'text-slate-500'"
            @click="setAddMode('recipe')"
          >
            Desde receta
          </button>
          <button
            type="button"
            class="relative z-10 flex-1 rounded-full px-4 py-1.5 text-sm font-semibold transition"
            :class="addMode === 'free' ? 'text-slate-900' : 'text-slate-500'"
            @click="setAddMode('free')"
          >
            Plato libre
          </button>
        </div>

        <div v-if="addMode === 'recipe'" class="space-y-2">
          <label class="text-sm font-semibold text-slate-700">Receta</label>
          <div
            class="relative overflow-visible rounded-2xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              class="flex h-11 w-full items-center justify-between px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              @click="isRecipePickerOpen = !isRecipePickerOpen"
            >
              <span class="truncate">
                {{
                  selectedRecipe?.title ||
                  selectedRecipe?.description ||
                  'Selecciona una receta'
                }}
              </span>
              <span class="ml-2 text-slate-400">⌄</span>
            </button>

            <div
              v-if="isRecipePickerOpen"
              class="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              <input
                v-model="recipeSearch"
                type="text"
                class="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
                placeholder="Buscar receta..."
              />

              <div class="mt-2 max-h-56 space-y-3 overflow-y-auto pr-1">
                <p
                  v-if="!filteredRecipeGroups.length"
                  class="px-2 py-2 text-xs text-slate-500"
                >
                  No se encontraron recetas.
                </p>

                <div
                  v-for="group in filteredRecipeGroups"
                  :key="group.key"
                  class="space-y-1"
                >
                  <div class="flex items-center gap-2 px-2">
                    <p
                      class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {{ group.label }}
                    </p>
                    <div class="h-px flex-1 bg-slate-100"></div>
                  </div>

                  <button
                    v-for="recipe in group.items"
                    :key="recipe.id"
                    type="button"
                    class="flex w-full items-start rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    @click="selectRecipe(recipe)"
                  >
                    <span class="truncate">
                      {{
                        recipe.title ||
                        recipe.description ||
                        'Receta sin titulo'
                      }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-2">
          <label class="text-sm font-semibold text-slate-700"
            >Nombre del plato</label
          >
          <input
            v-model="form.custom_name"
            type="text"
            class="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
            placeholder="Ej: Pasta con atún"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-700">Cantidad</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-xl border px-3 py-2 text-left text-xs transition"
              :class="
                form.quantity_mode === 'fixed'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600'
              "
              @click="setQuantityMode('fixed')"
            >
              <span class="block font-semibold">Exacta</span>
              <span class="mt-0.5 block text-[11px] opacity-80"
                >Con unidades</span
              >
            </button>
            <button
              type="button"
              class="rounded-xl border px-3 py-2 text-left text-xs transition"
              :class="
                form.quantity_mode === 'open'
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600'
              "
              @click="setQuantityMode('open')"
            >
              <span class="block font-semibold">Sin definir</span>
              <span class="mt-0.5 block text-[11px] opacity-80"
                >Sin unidades</span
              >
            </button>
          </div>

          <div
            v-if="form.quantity_mode === 'fixed'"
            class="mt-2 flex w-full max-w-[220px] items-center justify-between rounded-2xl border border-slate-200 px-2 py-1"
          >
            <button
              type="button"
              class="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100"
              @click="changeQuantity(-1)"
            >
              -
            </button>
            <span
              class="min-w-[2ch] text-center text-sm font-semibold text-slate-800"
            >
              {{ form.quantity }}
            </span>
            <button
              type="button"
              class="h-7 w-7 rounded-full text-slate-600 hover:bg-slate-100"
              @click="changeQuantity(1)"
            >
              +
            </button>
          </div>
          <p v-else class="mt-2 text-xs text-slate-500">
            Podrás asignarlo al planificador sin definir unidades.
          </p>
        </div>

        <div class="space-y-2">
          <button
            type="button"
            class="text-xs font-semibold text-slate-500 underline underline-offset-2"
            @click="showNotes = !showNotes"
          >
            {{ showNotes ? 'Ocultar nota' : '+ Añadir nota' }}
          </button>
          <input
            v-if="showNotes"
            v-model="form.notes"
            type="text"
            class="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm"
            placeholder="Ej: para lunes y martes"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white md:w-auto"
          :disabled="!canSubmit"
        >
          {{ submitLabel }}
        </button>
      </form>

      <div v-if="isLoading" class="text-sm text-slate-500">Cargando...</div>

      <section v-else class="space-y-6">
        <div class="space-y-3">
          <h3
            class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            Disponibles
          </h3>
          <article
            v-for="item in activeItems"
            :key="item.id"
            class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-900">
                  {{
                    item.recipe?.title ||
                    item.recipe?.description ||
                    item.custom_name ||
                    'Plato sin nombre'
                  }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ getItemQuantityText(item) }}
                  <span v-if="item.notes">· {{ item.notes }}</span>
                </p>
              </div>
              <span
                class="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
              >
                Activo
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
              <label
                class="inline-flex items-center gap-2 text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300"
                  @change="toggleComplete(item)"
                />
                Completado
              </label>
              <button
                v-if="item.custom_name && !item.recipe_id"
                type="button"
                class="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700"
                @click="openConvertModal(item)"
              >
                Convertir a receta
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                @click="removeItem(item)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </article>
          <div
            v-if="!activeItems.length"
            class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500"
          >
            No hay platos disponibles en compra.
          </div>
        </div>

        <div class="space-y-3" v-if="completedItems.length">
          <h3
            class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            Completados
          </h3>
          <article
            v-for="item in completedItems"
            :key="item.id"
            class="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-700">
                  {{
                    item.recipe?.title ||
                    item.recipe?.description ||
                    item.custom_name ||
                    'Plato sin nombre'
                  }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ getCompletedQuantityText(item) }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                Completado
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                @click="toggleComplete(item)"
              >
                Reabrir
              </button>
              <button
                v-if="item.custom_name && !item.recipe_id"
                type="button"
                class="rounded-full border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700"
                @click="openConvertModal(item)"
              >
                Convertir a receta
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                @click="removeItem(item)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>
  </BaseLayout>
  <ConvertFreeItemModal
    v-if="showConvertModal && itemToConvert"
    :item="itemToConvert"
    @close="closeConvertModal"
    @converted="handleConvertedToRecipe"
  />
</template>
