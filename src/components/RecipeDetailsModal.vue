<script setup>
import { onMounted, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useRecipes } from '@/composables/useRecipes'

const props = defineProps({
  recipe: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const { listRecipeIngredients, listRecipeSteps } = useRecipes()

const ingredients = ref([])
const steps = ref([])
const isLoading = ref(false)

const loadDetails = async () => {
  if (!props.recipe?.id) return
  isLoading.value = true
  try {
    const [ingredientRows, stepRows] = await Promise.all([
      listRecipeIngredients({ recipeId: props.recipe.id }),
      listRecipeSteps({ recipeId: props.recipe.id }),
    ])
    ingredients.value = ingredientRows
    steps.value = stepRows
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.recipe?.id,
  () => {
    loadDetails()
  },
)

onMounted(loadDetails)
</script>

<template>
  <BaseModal :is-active="true" @close="emit('close')">
    <template #header>
      {{ recipe?.title || 'Detalle de receta' }}
    </template>

    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        {{ recipe?.description || 'Sin descripcion.' }}
      </p>

      <div class="flex flex-wrap gap-2 text-xs font-semibold">
        <span
          v-if="recipe?.prep_minutes || recipe?.cook_minutes"
          class="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
        >
          {{ recipe?.prep_minutes || 0 }}m prep ·
          {{ recipe?.cook_minutes || 0 }}m coccion
        </span>
        <span
          v-if="recipe?.servings"
          class="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
        >
          {{ recipe?.servings }} raciones
        </span>
        <span
          v-if="recipe?.tags?.length"
          class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700"
        >
          {{ recipe.tags.join(', ') }}
        </span>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-slate-900">Ingredientes</h4>
        <div v-if="isLoading" class="text-xs text-slate-400">Cargando...</div>
        <ul v-else class="mt-2 space-y-1 text-sm text-slate-700">
          <li
            v-for="item in ingredients"
            :key="`${item.recipe_id}-${item.ingredient_id}`"
          >
            <span class="font-semibold">{{
              item.ingredient?.name || 'Ingrediente'
            }}</span>
            <span v-if="item.quantity">
              · {{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}
            </span>
            <span v-if="item.note" class="text-slate-500">
              ({{ item.note }})</span
            >
          </li>
          <li v-if="!ingredients.length" class="text-xs text-slate-400">
            Sin ingredientes cargados.
          </li>
        </ul>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-slate-900">Pasos</h4>
        <div v-if="isLoading" class="text-xs text-slate-400">Cargando...</div>
        <ol v-else class="mt-2 space-y-2 text-sm text-slate-700">
          <li v-for="step in steps" :key="step.id" class="flex gap-3">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
            >
              {{ step.step_number }}
            </span>
            <span>{{ step.instruction }}</span>
          </li>
          <li v-if="!steps.length" class="text-xs text-slate-400">
            Sin pasos cargados.
          </li>
        </ol>
      </div>

      <div class="pt-2">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          @click="emit('close')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </BaseModal>
</template>
