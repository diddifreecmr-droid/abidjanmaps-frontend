import { useEffect, useRef, useState } from 'react'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import type { RoutePoint } from '../hooks/useRoutePoints'
import type { PlaceRead } from '../types/localData'

interface PlaceAutocompleteProps {
  label: string
  dotColorClass: string
  point: RoutePoint | null
  onSelect: (point: RoutePoint) => void
}

function formatPoint(point: RoutePoint | null): string {
  return point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : ''
}

function PlaceAutocomplete({ label, dotColorClass, point, onSelect }: PlaceAutocompleteProps) {
  const { results, loading, search, clear } = usePlaceSearch()
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Si le point est posé autrement (clic carte, glisser-déposer), on reflète
  // les coordonnées dans le champ tant que l'utilisateur n'a pas retapé dessus.
  useEffect(() => {
    if (!isOpen) {
      setInputValue((current) => {
        const looksLikeCoords = /^-?\d+\.\d+, -?\d+\.\d+$/.test(current)
        if (current === '' || looksLikeCoords) {
          return formatPoint(point)
        }
        return current
      })
    }
  }, [point, isOpen])

  // Ferme la liste déroulante au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (value: string) => {
    setInputValue(value)
    setIsOpen(true)
    search(value)
  }

  const handleSelect = (place: PlaceRead) => {
    onSelect(place.location)
    setInputValue(place.name)
    setIsOpen(false)
    clear()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 border border-gray-200 rounded px-2 py-1.5">
        <span className={`inline-block w-3 h-3 rounded-full shrink-0 ${dotColorClass}`} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={label}
          className="w-full text-sm outline-none text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {isOpen && (loading || results.length > 0) && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-400">Recherche…</div>
          )}
          {!loading &&
            results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{place.name}</div>
                {place.vernacular_name && (
                  <div className="text-xs text-gray-400">{place.vernacular_name}</div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default PlaceAutocomplete