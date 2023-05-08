<script setup>
import BaseLayout from '@/components/BaseLayout.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import RecipesTable from '../components/RecipesTable.vue'
import { useRecipes } from '../composables/useRecipes'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { listRecipesTypes, listRecipes } = useRecipes()
const { t } = useI18n()

const types = ref([])
const recipes = ref({})

const loadData = async () => {
  types.value = await listRecipesTypes()

  for (const type of types.value) {
    const currentRecipes = await listRecipes({ type: type.id })

    recipes.value = {
      ...recipes.value,
      [type.name]: currentRecipes,
    }
  }
}

loadData()
</script>

<template>
  <BaseLayout>
    <h2 class="text-3xl font-bold">Recetas</h2>

    <template v-for="type in types" :key="type">
      <div class="mt-4 flex items-center">
        <h3 class="font-bold text-lg pr-4">{{ t(`menu.${type.name}`) }}</h3>
        <PlusIcon class="h-6 w-6 rounded-full bg-green-600 text-white" />
      </div>
      <RecipesTable
        :headers="['id', 'description']"
        :items="recipes[type.name]"
      />
    </template>
  </BaseLayout>
</template>
