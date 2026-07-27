import type { HistoryEntry } from '../hooks/useEntityHistory'

interface HistoryListProps {
  entries: HistoryEntry[]
  loading: boolean
  error: string | null
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  // Le backend renvoie parfois un objet (ex: { validation_status: ... }) au lieu
  // d'une string simple — on l'affiche en JSON plutôt que de crasher React.
  try {
    return JSON.stringify(value)
  } catch {
    return '—'
  }
}

function HistoryList({ entries, loading, error }: HistoryListProps) {
  if (loading) {
    return <p className="text-xs text-gray-400 italic px-1 py-1">Chargement de l'historique…</p>
  }

  if (error) {
    return <p className="text-xs text-red-500 px-1 py-1">Historique indisponible : {error}</p>
  }

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400 italic px-1 py-1">Aucune modification enregistrée</p>
  }

  return (
    <ul className="space-y-1.5 mt-1">
      {entries.map((entry) => (
        <li key={entry.id} className="text-xs bg-white border border-gray-100 rounded px-2 py-1.5">
          <div className="flex items-center justify-between text-gray-500">
            <span className="font-medium text-gray-700">{entry.field_name}</span>
            <span>{formatDate(entry.changed_at)}</span>
          </div>
          <div className="mt-0.5 text-gray-600">
            <span className="line-through text-gray-400">{formatValue(entry.old_value)}</span>
            {' → '}
            <span className="text-gray-800">{formatValue(entry.new_value)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default HistoryList