<script setup>
import BaseModal from '@/components/BaseModal.vue'
import { useRecipes } from '../composables/useRecipes'
import { ref } from 'vue'
import { useMenu } from '../composables/useMenu'

const props = defineProps({
  menuType: {
    type: String,
    required: true,
  },
  menuToday: {
    type: Object,
    default: () => ({}),
  },
})
const emit = defineEmits(['close'])

const { listRecipes, readRecipeType } = useRecipes()
const { updateMenu } = useMenu()

const recipes = ref([])
const showModal = ref(false)
const recipeSelected = ref(props.menuToday[props.menuType].id)

const loadMenu = async () => {
  const type = await readRecipeType({ type: props.menuType })
  recipes.value = await listRecipes({ type: type.id })
  showModal.value = true
}

const saveMenu = async () => {
  await updateMenu({
    id: props.menuToday.id,
    recipeType: props.menuType,
    recipeTypeId: recipeSelected.value,
  })
  closeModal()
}

const closeModal = () => {
  showModal.value = false
  emit('close')
}

loadMenu()
</script>

<template>
  <BaseModal :is-active="showModal" @close="closeModal">
    <template #header> Editar menu </template>
    <div class="flex flex-col">
      <p>Elige el plato que quieras cambiar:</p>

      <select
        class="select w-full max-w-xs select-bordered"
        v-model="recipeSelected"
      >
        <option selected :value="menuToday[menuType].id">
          {{ menuToday[menuType].description }}
        </option>
        <option v-for="recipe in recipes" :value="recipe.id" :key="recipe.id">
          {{ recipe.description }}
        </option>
      </select>

      <button class="btn btn-sm mt-4" @click="saveMenu">Guardar</button>
    </div>
  </BaseModal>
</template>
