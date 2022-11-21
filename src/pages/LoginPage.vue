<script setup>
import { computed, ref } from 'vue'

const isRegisterMode = ref(true)

const title = computed(() => {
  return isRegisterMode.value ? 'Weekly Menu 🥘' : 'de nuevo'
})
const description = computed(() => {
  return isRegisterMode.value
    ? 'El formulario será sencillo, nombre de usuario y una sencilla contraseña.'
    : ''
})
const buttonText = computed(() => {
  return isRegisterMode.value ? 'Crear cuenta' : 'Iniciar sesión'
})

const toggleRegisterMode = () => {
  isRegisterMode.value = !isRegisterMode.value
}
</script>

<template>
  <section class="">
    <div class="lg:grid lg:min-h-screen lg:grid-cols-12">
      <aside
        class="relative block h-16 lg:order-last lg:col-span-5 lg:h-full xl:col-span-6"
      >
        <img
          alt="Pattern"
          src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
          class="absolute inset-0 h-full w-full object-cover"
        />
      </aside>

      <main
        aria-label="Main"
        class="flex items-center sm:justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:py-12 lg:px-16 xl:col-span-6"
      >
        <div class="w-full sm:max-w-xl lg:max-w-3xl">
          <h1
            class="mt-6 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl"
          >
            Bienvenido/a {{ title }}
          </h1>

          <p class="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
            {{ description }}
          </p>

          <form action="#" class="mt-8 grid grid-cols-6 gap-6">
            <div class="col-span-6">
              <label
                for="userName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Nombre de usuario
              </label>

              <input
                type="text"
                id="userName"
                name="user_name"
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
              />
            </div>

            <div v-if="isRegisterMode" class="col-span-6 sm:col-span-3">
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
                v-if="isRegisterMode"
                class="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-400"
              >
                ¿Ya tienes cuenta?
                <a
                  @click="toggleRegisterMode"
                  class="text-gray-700 underline cursor-pointer dark:text-gray-200"
                >
                  Inicia sesión</a
                >.
              </p>
              <p
                v-else
                class="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-400"
              >
                ¿No tienes cuenta todavía?
                <a
                  @click="toggleRegisterMode"
                  class="text-gray-700 underline cursor-pointer dark:text-gray-200"
                >
                  Regístrate</a
                >.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  </section>
</template>
