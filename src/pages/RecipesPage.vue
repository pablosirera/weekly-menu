<script setup>
import BaseLayout from '@/components/BaseLayout.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import RecipesTable from '@/components/RecipesTable.vue'
import { useRecipes } from '@/composables/useRecipes'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CreateNewRecipeModal from '@/components/CreateNewRecipeModal.vue'
import EditRecipeModal from '@/components/EditRecipeModal.vue'

const { listRecipesTypes, listRecipes } = useRecipes()
const { t } = useI18n()

const types = ref([])
const recipes = ref({})
const shouldShowRecipeForm = ref(false)
const shouldShowEditRecipeModal = ref(false)
const recipeToEdit = ref({})

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

const showRecipeForm = () => {
  shouldShowRecipeForm.value = true
}

const closeCreateRecipeModal = async recipeType => {
  if (recipeType) {
    const type = types.value.find(t => t.id === recipeType)
    recipes.value[type.name] = await listRecipes({ type: type.id })
  }
  shouldShowRecipeForm.value = false
}

const showEditRecipe = recipe => {
  recipeToEdit.value = recipe
  shouldShowEditRecipeModal.value = true
}

const hideEditRecipe = async () => {
  await loadData()
  shouldShowEditRecipeModal.value = false
}

loadData()
</script>

<template>
  <BaseLayout>
    <div class="flex items-center">
      <h2 class="text-3xl font-bold mr-4">Recetas</h2>
      <PlusIcon
        class="h-6 w-6 rounded-full bg-green-600 text-white"
        @click="showRecipeForm()"
      />
    </div>

    <section v-for="type in types" :key="type">
      <div class="mt-4">
        <div class="flex items-center">
          <h3 class="font-bold text-lg pr-4">{{ t(`menu.${type.name}`) }}</h3>
        </div>
      </div>
      <RecipesTable
        v-if="Object.keys(recipes).length"
        :headers="['id', 'description']"
        :items="recipes[type.name]"
        :type="type"
        @update-recipe="showEditRecipe"
      />
    </section>
    <CreateNewRecipeModal
      v-if="shouldShowRecipeForm"
      :recipe-types="types"
      @close="closeCreateRecipeModal"
    />
    <EditRecipeModal
      v-if="shouldShowEditRecipeModal"
      :recipe="recipeToEdit"
      :recipe-types="types"
      @close="hideEditRecipe()"
    />
  </BaseLayout>
</template>
