import useSupabase from './useSupabase'
import { useUser } from './useUser'

export default function useAuth() {
  const { supabase } = useSupabase()
  const { setUser } = useUser()

  const createUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    console.log(data)
    if (error) throw error

    setUser(data.user)
  }

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log(data)
    if (error) throw error

    setUser(data)
  }

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    console.log(data)
  }

  return {
    createUser,
    login,
    getSession,
  }
}
