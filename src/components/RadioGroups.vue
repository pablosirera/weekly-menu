<script setup>
import { ref } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  defaultOption: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    validators: value => ['radio', 'checkbox'].includes(value),
    default: 'radio',
  },
})

const emit = defineEmits(['change'])

const currentValues = ref([])

function sendValues(eventValue) {
  if (props.type === 'radio') {
    return emit('change', eventValue)
  }
  const values = [...currentValues.value]

  const index = currentValues.value.indexOf(eventValue)
  index === -1 ? values.push(eventValue) : values.splice(index, 1)

  emit('change', values)
}
</script>

<template>
  <fieldset class="flex flex-wrap gap-3">
    <div v-for="(option, index) in options" :key="index">
      <input
        v-model="currentValues"
        :type="type"
        :name="`${name}${index}`"
        :value="option.value"
        :id="`${name}${option.value}`"
        class="peer hidden"
        :checked="defaultOption === option.value"
        @input="sendValues($event.target.value)"
      />
      <label
        :for="`${name}${option.value}`"
        class="flex cursor-pointer items-center justify-center rounded-md border border-gray-100 py-2 px-3 text-gray-900 dark:text-white hover:border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white"
      >
        <p class="text-sm font-medium">{{ option.text }}</p>
      </label>
    </div>
  </fieldset>
</template>
