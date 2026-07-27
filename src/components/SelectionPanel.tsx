import { useRouteImpact } from '../hooks/useRouteImpact'
import { RouteImpactNotice } from './RouteImpactNotice'
import PlaceAutocomplete from './PlaceAutocomplete'
import type { RoutePoint } from '../hooks/useRoutePoints'
import type { RouteErrorCode, RouteProposal, VehicleProfile } from '../types/route'
import ProposalsList from './ProposalsList'
import LoadingState from './LoadingState'
import ErrorBanner from './ErrorBanner'

interface SelectionPanelProps {
  pointA: RoutePoint | null
  pointB: RoutePoint | null
  loading: boolean
  canCalculate: boolean
  proposals: RouteProposal[]
  selectedIndex: number
  errorCode: RouteErrorCode | null
  onCalculate: () => void
  onReset: () => void
  onSelectProposal: (index: number) => void
  onSelectPointA: (point: RoutePoint) => void
  onSelectPointB: (point: RoutePoint) => void
  vehicleProfile: VehicleProfile
  onVehicleProfileChange: (profile: VehicleProfile) => void
  vehicleWidthM: number | undefined
  onVehicleWidthMChange: (width: number | undefined) => void
  vehicleWeightT: number | undefined
  onVehicleWeightTChange: (weight: number | undefined) => void
}

const VEHICLE_PROFILES: { value: VehicleProfile; label: string; icon: string }[] = [
  { value: 'car', label: 'Voiture', icon: '🚗' },
  { value: 'motorcycle', label: 'Moto', icon: '🏍️' },
  { value: 'truck', label: 'Camion', icon: '🚚' },
]

function SelectionPanel({
  pointA,
  pointB,
  loading,
  canCalculate,
  proposals,
  selectedIndex,
  errorCode,
  onCalculate,
  onReset,
  onSelectProposal,
  onSelectPointA,
  onSelectPointB,
  vehicleProfile,
  onVehicleProfileChange,
  vehicleWidthM,
  onVehicleWidthMChange,
  vehicleWeightT,
  onVehicleWeightTChange,
}: SelectionPanelProps) {
  const impact = useRouteImpact(proposals, selectedIndex)
  return (
    <div className="bg-white shadow-lg p-4 w-full md:w-72 rounded-t-2xl md:rounded-lg space-y-3 text-sm max-h-[70vh] md:max-h-none overflow-y-auto">
      <div className="space-y-1.5">
        <PlaceAutocomplete
          label="Point de départ"
          dotColorClass="bg-green-600"
          point={pointA}
          onSelect={onSelectPointA}
        />
        <PlaceAutocomplete
          label="Destination"
          dotColorClass="bg-orange-600"
          point={pointB}
          onSelect={onSelectPointB}
        />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {VEHICLE_PROFILES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onVehicleProfileChange(p.value)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded border px-2 py-2 text-xs font-medium transition-colors ${
                vehicleProfile === p.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base leading-none">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {vehicleProfile === 'truck' && (
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Largeur (m)
              <input
                type="number"
                min={0}
                step={0.1}
                value={vehicleWidthM ?? ''}
                onChange={(e) => onVehicleWidthMChange(e.target.value === '' ? undefined : Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="2.7"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Poids (t)
              <input
                type="number"
                min={0}
                step={0.5}
                value={vehicleWeightT ?? ''}
                onChange={(e) => onVehicleWeightTChange(e.target.value === '' ? undefined : Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="18"
              />
            </label>
          </div>
        )}

        <button
          onClick={onCalculate}
          disabled={!canCalculate}
          className="w-full bg-blue-600 disabled:bg-gray-300 text-white rounded px-3 py-2 transition-colors"
        >
          Calculer l'itinéraire
        </button>

        <button
          onClick={onReset}
          className="w-full border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          Recalculer
        </button>
      </div>

      {loading && <LoadingState />}

      {!loading && proposals.length > 0 && (
        <>
          <ProposalsList proposals={proposals} selectedIndex={selectedIndex} onSelect={onSelectProposal} />
          <RouteImpactNotice impact={impact} />
        </>
      )}

      {errorCode && !loading && <ErrorBanner code={errorCode} />}
    </div>
  )
}

export default SelectionPanel