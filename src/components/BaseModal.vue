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
  <Teleport to="body">
    <div
      v-if="isActive"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 py-10"
      @click.self="$emit('close')"
    >
      <div
        class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          class="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-600"
          @click="$emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
        <h3 class="text-lg font-semibold text-slate-900">
          <slot name="header" />
        </h3>
        <div class="pt-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
