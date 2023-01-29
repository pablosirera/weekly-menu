<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isRegister: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['login', 'create'])

const form = ref({
  email: '',
  password: '',
})

const buttonText = computed(() => {
  return props.isRegister ? 'Crear cuenta' : 'Iniciar sesión'
})

const handleLogin = () => {
  const nameEvent = props.isRegister ? 'create' : 'login'
  emits(nameEvent, { email: form.value.email, password: form.value.password })
}
</script>

<template>
  <form
    action="#"
    class="mt-8 grid grid-cols-6 gap-6"
    @submit.prevent="handleLogin"
  >
    <div class="col-span-6">
      <label
        for="email"
        class="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Email
      </label>

      <input
        v-model="form.email"
        type="email"
        id="email"
        name="email"
        class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div class="col-span-6 sm:col-span-3">
      <label
        for="password"
        class="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Contraseña
      </label>

      <input
        type="password"
        id="password"
        name="password"
        class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        v-model="form.password"
      />
    </div>

    <div v-if="isRegister" class="col-span-6 sm:col-span-3">
      <label
        for="passwordConfirmation"
        class="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Confirma Contraseña
      </label>

      <input
        type="password"
        id="passwordConfirmation"
        name="password_confirmation"
        class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      />
    </div>

    <div class="col-span-6 sm:flex sm:items-center sm:gap-4">
      <button
        class="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500 dark:hover:bg-blue-700 dark:hover:text-white"
      >
        {{ buttonText }}
      </button>

      <p
        v-if="isRegister"
        class="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-400"
      >
        ¿Ya tienes cuenta?
        <a
          @click="$emit('change-view')"
          class="text-gray-700 underline cursor-pointer dark:text-gray-200"
        >
          Inicia sesión</a
        >.
      </p>
      <p v-else class="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
        ¿No tienes cuenta todavía?
        <a
          @click="$emit('change-view')"
          class="text-gray-700 underline cursor-pointer dark:text-gray-200"
        >
          Regístrate</a
        >.
      </p>
    </div>
  </form>
</template>
