import { useCallback, useState } from 'react'
import { fetchUsers, createUser, type UserCreate } from '../api/usersApi'
import type { UserProfile } from '../api/authApi'

interface UseUsersReturn {
  users: UserProfile[]
  loading: boolean
  error: string | null
  fetchAll: () => Promise<void>
  create: (user: UserCreate) => Promise<UserProfile>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchUsers()
      setUsers(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (user: UserCreate): Promise<UserProfile> => {
    setLoading(true)
    setError(null)
    try {
      const newUser = await createUser(user)
      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création de l'utilisateur"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { users, loading, error, fetchAll, create }
}