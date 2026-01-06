import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './auth-context'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
type User = NonNullable<Session>['user']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)
  const [postsRefreshKey, setPostsRefreshKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const bumpProfileRefreshKey = () => setProfileRefreshKey((k) => k + 1)
  const bumpPostsRefreshKey = () => setPostsRefreshKey((k) => k + 1)

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        profileRefreshKey,
        bumpProfileRefreshKey,
        postsRefreshKey,
        bumpPostsRefreshKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

