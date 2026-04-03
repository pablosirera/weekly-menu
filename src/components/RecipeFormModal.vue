<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useRecipes } from '@/composables/useRecipes'
import { getRecipeTypeLabel } from '@/utils/labels'

const props = defineProps({
  recipe: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create',
  },
})

const emit = defineEmits(['close'])

const { createRecipe, updateRecipe, listRecipesTypes } = useRecipes()
const recipeTypes = ref([])

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

const isEdit = computed(() => props.mode === 'edit')

const loadForm = recipe => {
  form.value = {
    title: recipe?.title || '',
    description: recipe?.description || '',
    prep_minutes: recipe?.prep_minutes ?? '',
    cook_minutes: recipe?.cook_minutes ?? '',
    servings: recipe?.servings ?? '',
    tagsInput: recipe?.tags?.join(', ') || '',
    photo_url: recipe?.photo_url || '',
    type: recipe?.type?.id || recipe?.type || '',
  }
}

watch(
  () => props.recipe,
  value => {
    loadForm(value)
  },
  { immediate: true },
)

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
  const payload = {
    title: form.value.title.trim(),
    description: descriptionValue || null,
    prep_minutes: toNumberOrNull(form.value.prep_minutes),
    cook_minutes: toNumberOrNull(form.value.cook_minutes),
    servings: toNumberOrNull(form.value.servings),
    tags: parseTags(form.value.tagsInput || ''),
    photo_url: form.value.photo_url.trim() || null,
    type: form.value.type || null,
  }

  try {
    if (isEdit.value && props.recipe?.id) {
      await updateRecipe({ id: props.recipe.id, ...payload })
    } else {
      try {
        await createRecipe(payload)
      } catch (error) {
        const fallbackPayload = {
          description: descriptionValue,
          type: form.value.type || null,
        }
        await createRecipe(fallbackPayload)
      }
    }
    emit('close')
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  try {
    recipeTypes.value = await listRecipesTypes()
    if (!form.value.type && recipeTypes.value.length) {
      form.value.type = recipeTypes.value[0].id
    }
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <BaseModal :is-active="true" @close="$emit('close')">
    <template #header>
      {{ isEdit ? 'Editar receta' : 'Nueva receta' }}
    </template>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <label class="text-sm font-semibold text-slate-700">
        Titulo
        <input
          v-model="form.title"
          type="text"
          placeholder="Tortilla de patatas"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </label>

      <label class="text-sm font-semibold text-slate-700">
        Descripcion
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Notas o resumen de la receta"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
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
            placeholder="10"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700">
          Coccion (min)
          <input
            v-model="form.cook_minutes"
            type="number"
            min="0"
            placeholder="20"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700">
          Raciones
          <input
            v-model="form.servings"
            type="number"
            min="1"
            placeholder="2"
            class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label class="text-sm font-semibold text-slate-700">
        Tags (separados por coma)
        <input
          v-model="form.tagsInput"
          type="text"
          placeholder="rapido, vegano, batch"
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </label>

      <label class="text-sm font-semibold text-slate-700">
        URL de foto
        <input
          v-model="form.photo_url"
          type="url"
          placeholder="https://..."
          class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </label>

      <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
          :disabled="!form.title.trim() && !form.description.trim()"
        >
          {{ isEdit ? 'Guardar' : 'Crear' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
