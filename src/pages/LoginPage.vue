<script setup>
import { computed, ref } from 'vue'
import LoginForm from '../components/auth/LoginForm.vue'
import useAuth from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { login, createUser } = useAuth()
const router = useRouter()
const isRegisterMode = ref(true)

const title = computed(() => {
  return isRegisterMode.value ? 'Weekly Menu 🥘' : 'de nuevo'
})
const description = computed(() => {
  return isRegisterMode.value
    ? 'El formulario será sencillo, nombre de usuario y una sencilla contraseña.'
    : ''
})

const toggleRegisterMode = () => {
  isRegisterMode.value = !isRegisterMode.value
}

const handleLogin = async ({ email, password }) => {
  console.log(email)
  try {
    await login({ email, password })
    router.push({ name: 'HomePage' })
  } catch (error) {
    console.error(error.message)
  }
}

const handleCreateUser = async ({ email, password }) => {
  try {
    await createUser({ email, password })
    router.push({ name: 'HomePage' })
  } catch (error) {
    console.error(error.message)
  }
}
</script>

<template>
  <section>
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

          <LoginForm
            :is-register="isRegisterMode"
            @change-view="toggleRegisterMode"
            @login="handleLogin"
            @create="handleCreateUser"
          />
        </div>
      </main>
    </div>
  </section>
</template>
