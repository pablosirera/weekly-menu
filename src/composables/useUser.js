import { ref } from 'vue'

const user = ref({})

export function useUser() {
  const setUser = userInfo => {
    user.value = { ...userInfo }
  }
  const isAuthenticated = () => !!user.value.id

  return {
    user,
    setUser,
    isAuthenticated,
  }
}
