import { useState } from 'react'
import type { UserProfile } from '../api/authApi'
import type { UserCreate } from '../api/usersApi'

interface UsersAdminPanelProps {
  users: UserProfile[]
  loading: boolean
  error: string | null
  onCreate: (user: UserCreate) => Promise<void>
  onRefresh: () => void
  onClose: () => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export function UsersAdminPanel({ users, loading, error, onCreate, onRefresh, onClose }: UsersAdminPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email || !password) {
      setFormError('Email et mot de passe sont obligatoires')
      return
    }
    if (password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setSubmitting(true)
    try {
      await onCreate({ email, password, role })
      setEmail('')
      setPassword('')
      setRole('user')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-96 max-h-96 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Administration des utilisateurs</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 mb-4 border-b border-gray-100 pb-4">
        <h4 className="text-sm font-medium text-gray-600">Créer un agent</h4>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="w-full px-3 py-2 border rounded-md text-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (min. 8 caractères)"
          className="w-full px-3 py-2 border rounded-md text-sm"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
          className="w-full px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="user">Agent (user)</option>
          <option value="admin">Admin</option>
        </select>

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-3 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-md text-sm hover:bg-blue-700"
        >
          {submitting ? 'Création…' : 'Créer le compte'}
        </button>
      </form>

      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">Comptes ({users.length})</h4>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {users.length === 0 && !loading ? (
        <p className="text-sm text-gray-400 italic">Aucun utilisateur</p>
      ) : (
        <ul className="space-y-1.5">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between text-sm border rounded px-2 py-1.5 bg-gray-50">
              <div className="min-w-0">
                <div className="truncate font-medium text-gray-800">{u.email}</div>
                <div className="text-xs text-gray-400">
                  Créé le {formatDate(u.created_at)}
                  {!u.is_active && <span className="text-red-500"> · inactif</span>}
                </div>
              </div>
              <span
                className={`shrink-0 ml-2 text-xs px-2 py-0.5 rounded ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {u.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}