import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type SessionUser = { id: string; name: string; email: string }
type AuthContextValue = { isAuthenticated: boolean; user: SessionUser | null; login: (payload: SessionUser) => void; logout: () => void }

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'devdirectory:lab-session'

function readMockSession(): SessionUser | null {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<SessionUser> | null
    return value && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.email === 'string'
      ? { id: value.id, name: value.name, email: value.email }
      : null
  } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readMockSession)

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: Boolean(user),
    user,
    login: payload => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)) } catch { /* Keep the mock session in memory if storage is unavailable. */ } setUser(payload) },
    logout: () => { try { localStorage.removeItem(STORAGE_KEY) } catch { /* Clear the in-memory session even if storage is unavailable. */ } setUser(null) },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
