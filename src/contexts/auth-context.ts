import { createContext } from 'react'
import { supabase } from '@/lib/supabase'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
type User = NonNullable<Session>['user']

export interface AuthContextType {
  user: User | null
  session: Session
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

