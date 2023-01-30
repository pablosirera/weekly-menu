import { useRouter } from 'vue-router'
import { UserModel } from '../models/UserModel'
import useSupabase from './useSupabase'
import { useUser } from './useUser'

export function useAuth() {
  const { supabase } = useSupabase()
  const { setUser } = useUser()
  const router = useRouter()

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    console.log(data)
    if (error) throw error

    setUser(data)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    router.push({ name: 'LoginPage' })
  }

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data.session && data.session.user) {
      setUser(new UserModel(data.session.user))
    }
  }

  return {
    login,
    logout,
    getSession,
  }
}
