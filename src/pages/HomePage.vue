<script setup>
import { computed, onMounted, ref } from 'vue'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import BaseLayout from '@/components/BaseLayout.vue'
import UpdateMenuModal from '@/components/UpdateMenuModal.vue'
import CreateMenuModal from '@/components/CreateMenuModal.vue'
import { useMenu } from '@/composables/useMenu'
import { getRecipeTypeLabel } from '@/utils/labels'
import { RECIPE_TYPE_KEYS } from '@/utils/recipeTypes'

const { readMenu } = useMenu()

const showUpdateMenuModal = ref(false)
const slotToUpdate = ref('')
const showCreateMenuModal = ref(false)
const weekTabs = ref([])
const activeDate = ref('')
const dayPlans = ref({})

const SLOT_EMPTY_LABELS = {
  breakfast: 'Desayuno pendiente',
  brunch: 'Almuerzo pendiente',
  lunch: 'Comida pendiente',
  snack: 'Merienda pendiente',
  dinner: 'Cena pendiente',
}

const todayMenu = computed(() => {
  const base = {}
  for (const slot of RECIPE_TYPE_KEYS) {
    base[slot] = dayPlans.value[slot] || null
  }
  return base
})

const buildWeekTabs = () => {
  const labels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() + index)
    const isoDate = date.toISOString().slice(0, 10)

    return {
      value: isoDate,
      text: labels[date.getDay()],
      dayNumber: date.getDate().toString(),
    }
  })
}

const loadMenu = async planDate => {
  activeDate.value = planDate
  const rows = await readMenu(planDate)

  const nextPlans = {}
  for (const row of rows) {
    nextPlans[row.slot] = row.recipe || null
  }

  dayPlans.value = nextPlans
}

const openUpdateMenuModal = slot => {
  slotToUpdate.value = slot
  showUpdateMenuModal.value = true
}

const closeUpdateMenuModal = () => {
  showUpdateMenuModal.value = false
  loadMenu(activeDate.value)
}

const closeCreateMenuModal = () => {
  showCreateMenuModal.value = false
  loadMenu(activeDate.value)
}

onMounted(() => {
  weekTabs.value = buildWeekTabs()
  activeDate.value =
    weekTabs.value[0]?.value || new Date().toISOString().slice(0, 10)
  loadMenu(activeDate.value)
})
</script>

<template>
  <BaseLayout>
    <div class="mt-0 -mx-5 border-b border-slate-100 px-5">
      <div class="no-scrollbar flex gap-6 overflow-x-auto pb-3">
        <button
          v-for="day in weekTabs"
          :key="day.value"
          class="min-w-[56px] text-sm font-semibold transition"
          :class="
            activeDate === day.value ? 'text-slate-900' : 'text-slate-400'
          "
          type="button"
          @click="loadMenu(day.value)"
        >
          {{ day.text }}
          <span class="block text-xs font-medium">{{ day.dayNumber }}</span>
          <span
            class="mt-2 block h-1 w-full rounded-full"
            :class="
              activeDate === day.value ? 'bg-emerald-400' : 'bg-transparent'
            "
          ></span>
        </button>
      </div>
    </div>

    <div class="mt-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-slate-900">Comidas del dia</h2>
        <button
          class="inline-flex items-center gap-2 rounded-full bg-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800"
          type="button"
          @click="showCreateMenuModal = true"
        >
          <SparklesIcon class="h-4 w-4" />
          No quiero pensar
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <article
          v-for="slot in RECIPE_TYPE_KEYS"
          :key="slot"
          class="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
        >
          <div>
            <p class="text-xs font-semibold text-slate-600">
              {{ getRecipeTypeLabel(slot) }}
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{
                todayMenu[slot]?.title ||
                todayMenu[slot]?.description ||
                SLOT_EMPTY_LABELS[slot]
              }}
            </p>
            <button
              class="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
              type="button"
              @click="openUpdateMenuModal(slot)"
            >
              {{
                todayMenu[slot]
                  ? `Cambiar ${getRecipeTypeLabel(slot).toLowerCase()}`
                  : `Anadir ${getRecipeTypeLabel(slot).toLowerCase()} +`
              }}
            </button>
          </div>
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-lime-100 text-emerald-600"
          >
            <SparklesIcon class="h-6 w-6" />
          </div>
        </article>
      </div>
    </div>
  </BaseLayout>

  <UpdateMenuModal
    v-if="showUpdateMenuModal"
    :meal-slot="slotToUpdate"
    :plan-date="activeDate"
    :current-recipe-id="todayMenu[slotToUpdate]?.id || null"
    @close="closeUpdateMenuModal"
  />

  <CreateMenuModal v-if="showCreateMenuModal" @close="closeCreateMenuModal" />
</template>
