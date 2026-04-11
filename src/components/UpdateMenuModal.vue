<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useMenu } from '@/composables/useMenu'
import { usePantry } from '@/composables/usePantry'
import { getRecipeTypeLabel } from '@/utils/labels'

const props = defineProps({
  mealSlot: {
    type: String,
    required: true,
  },
  planDate: {
    type: String,
    required: true,
  },
  currentRecipeId: {
    type: [String, Number, null],
    default: null,
  },
})

const emit = defineEmits(['close'])

const { upsertMealPlanSlot } = useMenu()
const { listAvailablePantryItems, replaceMealPlanAllocation } = usePantry()

const pantryItems = ref([])
const NONE_OPTION = '__none__'
const selectedPantryItemId = ref(NONE_OPTION)
const isLoading = ref(false)

const availableOptions = computed(() => {
  const hasRecipeType = pantryItems.value.some(item =>
    Boolean(item.recipe?.type),
  )
  if (!hasRecipeType) return pantryItems.value

  return pantryItems.value.filter(item => item.recipe?.type === props.mealSlot)
})

const loadPantry = async () => {
  isLoading.value = true
  try {
    pantryItems.value = await listAvailablePantryItems()
    if (props.currentRecipeId) {
      const matchingItem = pantryItems.value.find(
        item => item.recipe_id === props.currentRecipeId,
      )
      selectedPantryItemId.value = matchingItem?.id || NONE_OPTION
    } else {
      selectedPantryItemId.value = NONE_OPTION
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const saveMenu = async () => {
  if (!selectedPantryItemId.value) return

  const isNoneSelected = selectedPantryItemId.value === NONE_OPTION

  try {
    let mealPlan
    if (isNoneSelected) {
      mealPlan = await upsertMealPlanSlot({
        planDate: props.planDate,
        slot: props.mealSlot,
        recipeId: null,
      })
    } else {
      const selectedPantryItem = pantryItems.value.find(
        item => item.id === selectedPantryItemId.value,
      )
      if (!selectedPantryItem?.recipe_id) return
      mealPlan = await upsertMealPlanSlot({
        planDate: props.planDate,
        slot: props.mealSlot,
        recipeId: selectedPantryItem.recipe_id,
      })
    }

    await replaceMealPlanAllocation({
      mealPlanId: mealPlan.id,
      pantryItemId: isNoneSelected ? null : selectedPantryItemId.value,
      quantity: 1,
    })

    emit('close')
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadPantry)
</script>

<template>
  <BaseModal :is-active="true" @close="emit('close')">
    <template #header>
      {{ getRecipeTypeLabel(mealSlot) }}
    </template>

    <div class="flex flex-col gap-3">
      <p>Elige un plato de compra disponible para este slot:</p>

      <select
        v-model="selectedPantryItemId"
        class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        <option :value="NONE_OPTION">Sin asignar</option>
        <option
          v-for="item in availableOptions"
          :key="item.id"
          :value="item.id"
        >
          {{
            item.recipe?.title ||
            item.recipe?.description ||
            'Receta sin titulo'
          }}
          ·
          {{
            item.is_open_quantity
              ? 'sin definir'
              : `${item.remaining_quantity} uds`
          }}
        </option>
      </select>

      <p v-if="isLoading" class="text-xs text-slate-500">Cargando...</p>
      <p v-else-if="!availableOptions.length" class="text-xs text-slate-500">
        No hay platos disponibles en Compra para
        {{ getRecipeTypeLabel(mealSlot).toLowerCase() }}.
      </p>

      <button
        class="mt-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        :disabled="!selectedPantryItemId || isLoading"
        @click="saveMenu"
      >
        Guardar
      </button>
    </div>
  </BaseModal>
</template>
