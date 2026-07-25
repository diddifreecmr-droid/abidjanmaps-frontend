import { useEffect, useState } from 'react'

interface GeolocationState {
  position: { lat: number; lng: number } | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ position: null, error: 'geolocation_unavailable', loading: false })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        })
      },
      () => {
        // Refus de l'utilisateur ou échec — on ne casse pas l'app,
        // la carte reste centrée sur Abidjan sans marqueur position
        setState({ position: null, error: 'geolocation_denied', loading: false })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  return state
}