<script setup>
import { onMounted, ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useRecipes } from '@/composables/useRecipes'
import { getRecipeTypeLabel } from '@/utils/labels'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'converted'])

const { createRecipe, listRecipesTypes } = useRecipes()
const recipeTypes = ref([])
const isSaving = ref(false)

const form = ref({
  title: '',
  description: '',
  prep_minutes: '',
  cook_minutes: '',
  servings: '',
  tagsInput: '',
  photo_url: '',
  type: '',
})

const parseTags = raw => {
  const tags = raw
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

  return tags.length ? tags : null
}

const toNumberOrNull = value => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const handleSubmit = async () => {
  const descriptionValue =
    form.value.description.trim() || form.value.title.trim()
  if (!descriptionValue) return

  const payload = {
    title: form.value.title.trim() || null,
    description: descriptionValue,
    prep_minutes: toNumberOrNull(form.value.prep_minutes),
    cook_minutes: toNumberOrNull(form.value.cook_minutes),
    servings: toNumberOrNull(form.value.servings),
    tags: parseTags(form.value.tagsInput || ''),
    photo_url: form.value.photo_url.trim() || null,
    type: form.value.type || null,
  }

  try {
    isSaving.value = true
    let createdRecipe
    try {
      createdRecipe = await createRecipe(payload)
    } catch (error) {
      createdRecipe = await createRecipe({
        description: descriptionValue,
        type: form.value.type || null,
      })
    }

    if (!createdRecipe?.id) return
    emit('converted', createdRecipe.id)
  } catch (error) {
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  form.value.title = props.item.custom_name || ''
  form.value.description = props.item.custom_name || ''

  try {
    recipeTypes.value = await listRecipesTypes()
    if (recipeTypes.value.length) {
      form.value.type = recipeTypes.value[0].id
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <BaseModal :is-active="true" @close="$emit('close')">
    <template #header>Convertir a receta</template>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <label class="text-sm font-semibold text-slate-700">
        Titulo
        <input
          v-model="form.title"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          placeholder="Nombre de la receta"
        />
      </label>

      <label class="text-sm font-semibold text-slate-700">
        Descripcion
        <textarea
          v-model="form.description"
          rows="3"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          placeholder="Detalles de la receta"
        ></textarea>
      </label>

      <label class="text-sm font-semibold text-slate-700">
        Tipo de receta
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="type in recipeTypes"
            :key="type.id"
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs font-semibold"
            :class="
              form.type === type.id
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600'
            "
            @click="form.type = type.id"
          >
            {{ getRecipeTypeLabel(type.name) }}
          </button>
        </div>
      </label>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="text-sm font-semibold text-slate-700">
          Prep (min)
          <input
            v-model="form.prep_minutes"
            type="number"
            min="0"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700">
          Coccion (min)
          <input
            v-model="form.cook_minutes"
            type="number"
            min="0"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700">
          Raciones
          <input
            v-model="form.servings"
            type="number"
            min="1"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label class="text-sm font-semibold text-slate-700">
        Tags (separados por coma)
        <input
          v-model="form.tagsInput"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          placeholder="rapido, batch"
        />
      </label>

      <label class="text-sm font-semibold text-slate-700">
        URL de foto
        <input
          v-model="form.photo_url"
          type="url"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
          placeholder="https://..."
        />
      </label>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          :disabled="
            (!form.title.trim() && !form.description.trim()) || isSaving
          "
        >
          Guardar receta
        </button>
      </div>
    </form>
  </BaseModal>
</template>
