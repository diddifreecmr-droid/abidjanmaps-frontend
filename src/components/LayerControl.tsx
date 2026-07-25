import { useState } from 'react'
import type { LayerVisibility } from '../types/localData'

interface LayerControlProps {
  visibility: LayerVisibility
  onToggle: (layer: keyof LayerVisibility) => void
}

const layerLabels: Record<keyof LayerVisibility, string> = {
  road_condition: 'État des routes',
  flood_risk: 'Risque d\'inondation',
  blocked_roads: 'Routes bloquées',
  control_points: 'Points de contrôle',
  tolls: 'Péages',
  congestion: 'Zones congestionnées',
  local_places: 'Lieux locaux',
}

export function LayerControl({ visibility, onToggle }: LayerControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm">Couches de données</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {Object.entries(layerLabels).map(([key, label]) => {
            const layerKey = key as keyof LayerVisibility
            return (
              <label
                key={key}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibility[layerKey]}
                  onChange={() => onToggle(layerKey)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
