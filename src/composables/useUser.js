import { ref } from 'vue'
import { UserModel } from '../models/UserModel'

const user = ref({})

export function useUser() {
  const setUser = userInfo => {
    user.value = new UserModel({ ...userInfo })
  }
  const isAuthenticated = () => !!user.value.id

  return {
    user,
    setUser,
    isAuthenticated,
  }
}
