<script setup>
import { computed, onMounted, ref } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import BaseLayout from '@/components/BaseLayout.vue'
import ConvertFreeItemModal from '@/components/ConvertFreeItemModal.vue'
import { usePantry } from '@/composables/usePantry'
import { useRecipes } from '@/composables/useRecipes'

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

const form = ref({
  recipe_id: '',
  custom_name: '',
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

const canSubmit = computed(
  () => Boolean(form.value.recipe_id) || Boolean(form.value.custom_name.trim()),
)

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
  if (!form.value.recipe_id && !customName) return

  try {
    await createPantryItem({
      recipe_id: form.value.recipe_id || null,
      custom_name: customName || null,
      quantity: Number(form.value.quantity) || 1,
      notes: form.value.notes.trim() || null,
    })

    form.value = {
      recipe_id: '',
      custom_name: '',
      quantity: 1,
      notes: '',
    }

    await loadData()
  } catch (error) {
    console.error(error)
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
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
        >
          Inventario
        </p>
        <h2 class="text-3xl font-semibold text-slate-900">Compra</h2>
        <p class="mt-1 text-sm text-slate-500">
          Registra platos disponibles para usarlos al planificar la semana.
        </p>
      </div>

      <form
        class="grid w-full min-w-0 gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_minmax(0,1fr)_auto]"
        @submit.prevent="addItem"
      >
        <select
          v-model="form.recipe_id"
          class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Selecciona un plato</option>
          <option v-for="recipe in recipes" :key="recipe.id" :value="recipe.id">
            {{ recipe.title || recipe.description || 'Receta sin titulo' }}
          </option>
        </select>

        <input
          v-model="form.custom_name"
          type="text"
          class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="O escribe un plato libre"
        />

        <input
          v-model="form.quantity"
          type="number"
          min="1"
          class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Cantidad"
        />

        <input
          v-model="form.notes"
          type="text"
          class="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Notas (opcional)"
        />

        <button
          type="submit"
          class="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white md:w-auto"
          :disabled="!canSubmit"
        >
          Anadir
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
            class="flex items-center gap-4 justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">
                {{
                  item.recipe?.title ||
                  item.recipe?.description ||
                  item.custom_name ||
                  'Plato sin nombre'
                }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.remaining_quantity }} de {{ item.quantity }} unidades
                disponibles
                <span v-if="item.notes">· {{ item.notes }}</span>
              </p>
            </div>
            <div class="flex flex-col items-end gap-2">
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
                Convertir
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
            class="flex items-center gap-4 justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div>
              <p class="text-sm font-semibold text-slate-700">
                {{
                  item.recipe?.title ||
                  item.recipe?.description ||
                  item.custom_name ||
                  'Plato sin nombre'
                }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ item.quantity }} unidades
              </p>
            </div>
            <div class="flex flex-col items-end gap-2">
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
                Convertir
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
