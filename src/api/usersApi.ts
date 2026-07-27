import { getAuthHeaders, type UserProfile } from './authApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface UserCreate {
  email: string
  password: string
  role: 'admin' | 'user'
}

async function handleUsersResponse<T>(response: Response): Promise<T> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Réponse du serveur illisible.')
  }

  if (!response.ok) {
    const err = body as { detail?: string; message?: string }
    throw new Error(err.detail || err.message || `Erreur serveur (${response.status})`)
  }

  return body as T
}

export async function fetchUsers(): Promise<UserProfile[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    headers: getAuthHeaders(),
  })
  return handleUsersResponse<UserProfile[]>(response)
}

export async function createUser(user: UserCreate): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  })
  return handleUsersResponse<UserProfile>(response)
}