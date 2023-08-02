<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useI18n } from 'vue-i18n'
import { useRecipes } from '@/composables/useRecipes'

const props = defineProps({
  recipe: {
    type: Object,
    default: () => ({}),
  },
  recipeTypes: {
    type: Array,
    required: true,
  },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const { updateRecipe } = useRecipes()

const recipeText = ref(props.recipe.description)
const recipeTypeSelected = ref(props.recipe.type.id)

async function updateCurrentRecipe() {
  try {
    await updateRecipe({
      id: props.recipe.id,
      description: recipeText.value,
      type: recipeTypeSelected.value,
    })
    closeModal()
  } catch (error) {
    console.error(error)
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <BaseModal :is-active="true" @close="closeModal">
    <template #header>Editar receta</template>
    <form
      @submit.prevent="updateCurrentRecipe"
      class="flex flex-col items-center gap-4"
    >
      <div class="flex flex-wrap gap-2">
        <span
          v-for="type in recipeTypes"
          :key="type.id"
          class="badge badge-primary px-3 py-2 hover:opacity-60 hover:cursor-pointer"
          :class="type.id !== recipeTypeSelected ? 'badge-outline' : ''"
          @click="recipeTypeSelected = type.id"
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
          class="btn btn-error btn-sm"
          type="button"
          @click="closeModal()"
        >
          Cancelar
        </button>
        <button
          class="btn btn-sm"
          type="submit"
          :disabled="!recipeText || !recipeTypeSelected"
        >
          Guardar
        </button>
      </div>
    </form>
  </BaseModal>
</template>
