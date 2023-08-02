<script setup>
import BaseModal from '@/components/BaseModal.vue'
import { useRecipes } from '../composables/useRecipes'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps({
  recipeTypes: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['close'])

const { createRecipe } = useRecipes()
const { t } = useI18n()

const recipeText = ref('')
const recipeTypeSelected = ref()

async function addRecipe() {
  try {
    await createRecipe({
      description: recipeText.value,
      type: recipeTypeSelected.value,
    })
    closeModal()
  } catch (error) {
    console.error(error)
  }
}

function closeModal() {
  emit('close', recipeTypeSelected.value)
}

function selectRecipeType(recipeId) {
  recipeTypeSelected.value = recipeId
}
</script>

<template>
  <BaseModal :is-active="true" @close="closeModal">
    <template #header>Crear receta</template>
    <form @submit.prevent="addRecipe" class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="type in recipeTypes"
          :key="type.id"
          class="badge badge-primary px-3 py-2 hover:opacity-60 hover:cursor-pointer"
          :class="type.id !== recipeTypeSelected ? 'badge-outline' : ''"
          @click="selectRecipeType(type.id)"
        >
          {{ t(`menu.${type.name}`) }}
        </span>
      </div>

      <input
        v-model="recipeText"
        type="text"
        placeholder="Descripción receta"
        class="input input-bordered w-full max-w-xs"
      />
      <div class="flex gap-4">
        <button
          class="btn btn-sm"
          type="submit"
          :disabled="!recipeText || !recipeTypeSelected"
        >
          Crear
        </button>
        <button
          class="btn btn-error btn-sm"
          type="button"
          @click="closeModal()"
        >
          Cancelar
        </button>
      </div>
    </form>
  </BaseModal>
</template>
