import { createClient } from '@supabase/supabase-js'
import { useUser } from './useUser'

const supabaseUrl = import.meta.env.VUE_APP_SUPABASE_URL
const supabaseKey = import.meta.env.VUE_APP_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const ensureProfile = async user => {
  if (!user?.id) return

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('Could not ensure profile row', error)
  }
}

const clearOAuthHashFromUrl = () => {
  if (typeof window === 'undefined') return

  const hash = window.location.hash || ''
  const hasOAuthTokens =
    hash.includes('access_token=') ||
    hash.includes('refresh_token=') ||
    hash.includes('expires_at=')

  if (!hasOAuthTokens) return

  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`,
  )
}

supabase.auth.onAuthStateChange((event, session) => {
  const { setUser } = useUser()

  setUser(session?.user)
  if (session?.access_token) {
    clearOAuthHashFromUrl()
  }
  ensureProfile(session?.user)
})

export default function useSupabase() {
  return { supabase }
}
