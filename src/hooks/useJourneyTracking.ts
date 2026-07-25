import { useCallback, useEffect, useRef, useState } from 'react'
import { finishJourneyMock, sendPositionMock, startJourneyMock } from '../api/journeyApi.mock'
import type { JourneyPosition } from '../types/journey'

type JourneyStatus = 'idle' | 'active' | 'finished'

const MIN_MOVEMENT_METERS = 5

function haversineDistanceMeters(a: JourneyPosition, b: JourneyPosition): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

interface JourneyState {
  status: JourneyStatus
  journeyId: string | null
  elapsedSeconds: number
  distanceMeters: number
}

const initialState: JourneyState = {
  status: 'idle',
  journeyId: null,
  elapsedSeconds: 0,
  distanceMeters: 0,
}

export function useJourneyTracking() {
  const [state, setState] = useState<JourneyState>(initialState)

  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<JourneyPosition | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const journeyIdRef = useRef<string | null>(null)
  const distanceRef = useRef(0)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
  }, [])

  const startJourney = useCallback(async () => {
    if (!('geolocation' in navigator)) return

    navigator.geolocation.getCurrentPosition(async (initialPos) => {
      const startPoint = { lat: initialPos.coords.latitude, lng: initialPos.coords.longitude }
      const { journey_id } = await startJourneyMock(startPoint)

      journeyIdRef.current = journey_id
      startedAtRef.current = Date.now()
      distanceRef.current = 0
      lastPositionRef.current = { ...startPoint, timestamp: Date.now() }

      setState({ status: 'active', journeyId: journey_id, elapsedSeconds: 0, distanceMeters: 0 })

      tickIntervalRef.current = setInterval(() => {
        if (!startedAtRef.current) return
        setState((s) => ({ ...s, elapsedSeconds: Math.floor((Date.now() - startedAtRef.current!) / 1000) }))
      }, 1000)

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPoint: JourneyPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: Date.now(),
          }

          const last = lastPositionRef.current
          if (last) {
            const delta = haversineDistanceMeters(last, newPoint)
            if (delta >= MIN_MOVEMENT_METERS) {
              distanceRef.current += delta
              lastPositionRef.current = newPoint
              setState((s) => ({ ...s, distanceMeters: distanceRef.current }))

              if (journeyIdRef.current) {
                sendPositionMock(journeyIdRef.current, newPoint)
              }
            }
          }
        },
        () => {
          // Échec GPS pendant le suivi — on n'interrompt pas le parcours
        },
        { enableHighAccuracy: true }
      )
    })
  }, [])

  const finishJourney = useCallback(async () => {
    stopWatching()

    if (journeyIdRef.current && startedAtRef.current) {
      const duration_s = Math.floor((Date.now() - startedAtRef.current) / 1000)
      await finishJourneyMock(journeyIdRef.current, {
        duration_s,
        distance_m: Math.round(distanceRef.current),
      })
    }

    setState({ status: 'finished', journeyId: journeyIdRef.current, elapsedSeconds: state.elapsedSeconds, distanceMeters: distanceRef.current })
  }, [stopWatching, state.elapsedSeconds])

  const reset = useCallback(() => {
    stopWatching()
    journeyIdRef.current = null
    startedAtRef.current = null
    lastPositionRef.current = null
    distanceRef.current = 0
    setState(initialState)
  }, [stopWatching])

  useEffect(() => stopWatching, [stopWatching])

  return { ...state, startJourney, finishJourney, reset }
}