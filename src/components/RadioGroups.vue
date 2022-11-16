<script setup>
defineProps({
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
})

defineEmits(['change'])
</script>

<template>
  <fieldset class="flex flex-wrap gap-3">
    <div v-for="(option, index) in options" :key="index">
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :id="option.value"
        class="peer hidden"
        :checked="defaultOption === option.value"
        @input="$emit('change', $event.target.value)"
      />
      <label
        :for="option.value"
        class="flex cursor-pointer items-center justify-center rounded-md border border-gray-100 py-2 px-3 text-gray-900 dark:text-white hover:border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white"
      >
        <p class="text-sm font-medium">{{ option.text }}</p>
      </label>
    </div>
  </fieldset>
</template>
