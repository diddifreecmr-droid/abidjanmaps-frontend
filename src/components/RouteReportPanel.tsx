import { useState } from 'react'
import type { RoadRead, RouteReportCreate } from '../types/localData'

interface RouteReportPanelProps {
  roads: RoadRead[]
  selectedPoint?: { lng: number; lat: number }
  onSubmit: (report: RouteReportCreate) => void
  onCancel: () => void
}

// Valeurs indicatives — à confirmer avec le backend via /route-reports/taxonomy
const REPORT_TYPES = [
  { value: 'degraded', label: 'Route dégradée' },
  { value: 'flooded', label: 'Route inondée' },
  { value: 'blocked', label: 'Route bloquée' },
  { value: 'checkpoint', label: 'Point de contrôle' },
  { value: 'congestion', label: 'Zone congestionnée' },
]

export function RouteReportPanel({ roads, selectedPoint, onSubmit, onCancel }: RouteReportPanelProps) {
  const [roadId, setRoadId] = useState<number | ''>('')
  const [reportType, setReportType] = useState('')
  const [severity, setSeverity] = useState(3)
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!reportType) {
      alert('Veuillez choisir un type de signalement')
      return
    }
    if (!message) {
      alert('Veuillez ajouter un message décrivant le problème')
      return
    }

    const report: RouteReportCreate = {
      road_id: roadId ? Number(roadId) : null,
      report_type: reportType,
      severity,
      message,
      geometry: selectedPoint ?? null,
    }

    onSubmit(report)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-4">Signaler l'état d'une route</h3>

      {!selectedPoint ? (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded mb-4">
          Cliquez sur la carte pour indiquer la position exacte du problème (optionnel)
        </div>
      ) : (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded mb-4">
          Position sélectionnée ({selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)})
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route concernée (optionnel)</label>
          <select
            value={roadId}
            onChange={(e) => setRoadId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">— Aucune route spécifique —</option>
            {roads.map((road) => (
              <option key={road.id} value={road.id}>
                {road.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de signalement *</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          >
            <option value="">— Choisir un type —</option>
            {REPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sévérité (1-5) *</label>
          <input
            type="number"
            min={1}
            max={5}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            rows={3}
            placeholder="Détails sur le problème observé..."
            required
          />
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Signaler
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}