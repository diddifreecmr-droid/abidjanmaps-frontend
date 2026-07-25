const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface UserProfile {
  id: number
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in_seconds: number
}

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || body.message || 'Email ou mot de passe incorrect')
  }

  const data: LoginResponse = await response.json()
  // Store the access_token
  localStorage.setItem('auth_token', data.access_token)

  // Now fetch the user profile with the token
  const user = await fetchProfile()
  localStorage.setItem('auth_user', JSON.stringify(user))
  return user
}

export async function fetchProfile(): Promise<UserProfile> {
  const token = getToken()
  if (!token) throw new Error('Non connecté')

  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    // Token invalid or expired — clear it
    logout()
    throw new Error('Session expirée')
  }

  const data: UserProfile = await response.json()
  localStorage.setItem('auth_user', JSON.stringify(data))
  return data
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function logout(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}