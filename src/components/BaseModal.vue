<script setup>
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
})
defineEmits(['close'])
</script>

<template>
  <div v-if="isActive" class="modal visible opacity-100 pointer-events-auto">
    <div class="modal-box relative">
      <label
        for="my-modal-3"
        class="btn btn-sm btn-circle absolute right-2 top-2"
        @click="$emit('close')"
      >
        <XMarkIcon class="w-6 h-6" />
      </label>
      <h3 class="text-lg font-bold"><slot name="header" /></h3>
      <p class="py-4">
        <slot />
      </p>
    </div>
  </div>
</template>
