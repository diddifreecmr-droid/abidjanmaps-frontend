import { useCallback, useEffect, useRef, useState } from 'react'
import { startMapTrace, addMapTracePositions, finishMapTrace } from '../api/mapTracesApi'
import { LocalDataApiError } from '../types/localData'
import type { MapTrace, MapTraceStart } from '../types/mapTracesApi'

export type TrackingStatus =
  | 'idle'
  | 'requesting_permission'
  | 'starting'
  | 'recording'
  | 'syncing'
  | 'finishing'
  | 'finished'
  | 'failed'

interface PendingPosition {
  lat: number
  lng: number
  accuracy_m: number | null
  speed_mps: number | null
  recorded_at: string
}

interface TrackingState {
  status: TrackingStatus
  traceId: number | null
  elapsedSeconds: number
  distanceMeters: number
  error: string | null
  finishedTrace: MapTrace | null
}

const initialState: TrackingState = {
  status: 'idle',
  traceId: null,
  elapsedSeconds: 0,
  distanceMeters: 0,
  error: null,
  finishedTrace: null,
}

const BATCH_INTERVAL_MS = 15_000
const MIN_MOVEMENT_METERS = 5

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function toErrorMessage(err: unknown): string {
  if (err instanceof LocalDataApiError) {
    if (err.status === 401) return 'Session expirée. Veuillez vous reconnecter.'
    if (err.status === 404) return 'Collecte introuvable.'
    if (err.status === 409) return 'La collecte est déjà terminée.'
    if (err.status === 422) return 'Données de position invalides.'
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Erreur inconnue'
}

export function useJourneyTracking() {
  const [state, setState] = useState<TrackingState>(initialState)

  const traceIdRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const distanceRef = useRef(0)
  const pendingRef = useRef<PendingPosition[]>([])
  const watchIdRef = useRef<number | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const batchRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const statusRef = useRef<TrackingStatus>('idle')

  // Keep statusRef in sync so the batch sender can read current status without stale closure
  const setStateWithStatus = useCallback((updater: (prev: TrackingState) => TrackingState) => {
    setState((prev) => {
      const next = updater(prev)
      statusRef.current = next.status
      return next
    })
  }, [])

  const stopAll = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (tickRef.current !== null) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (batchRef.current !== null) {
      clearInterval(batchRef.current)
      batchRef.current = null
    }
  }, [])

  const flushPositions = useCallback(async (): Promise<boolean> => {
    const traceId = traceIdRef.current
    if (!traceId || pendingRef.current.length === 0) return true

    const batch = pendingRef.current.splice(0, 500)
    try {
      await addMapTracePositions(traceId, batch)
      return true
    } catch (err) {
      // Restore points on transient failure so they retry next cycle
      pendingRef.current.unshift(...batch)

      if (err instanceof LocalDataApiError) {
        // Fatal errors — stop collection
        if (err.status === 401 || err.status === 409) {
          stopAll()
          setStateWithStatus((s) => ({ ...s, status: 'failed', error: toErrorMessage(err) }))
          return false
        }
      }
      // Transient network error — silent retry
      return false
    }
  }, [stopAll, setStateWithStatus])

  const startJourney = useCallback(
    async (routeData: MapTraceStart) => {
      if (!('geolocation' in navigator)) {
        setStateWithStatus((s) => ({
          ...s,
          status: 'failed',
          error: 'GPS non disponible sur cet appareil.',
        }))
        return
      }

      setStateWithStatus((s) => ({ ...s, status: 'requesting_permission', error: null }))

      navigator.geolocation.getCurrentPosition(
        async (initialPos) => {
          setStateWithStatus((s) => ({ ...s, status: 'starting' }))

          try {
            const trace = await startMapTrace(routeData)
            traceIdRef.current = trace.id
            startedAtRef.current = Date.now()
            distanceRef.current = 0
            pendingRef.current = []
            lastPositionRef.current = {
              lat: initialPos.coords.latitude,
              lng: initialPos.coords.longitude,
            }

            setStateWithStatus(() => ({
              status: 'recording',
              traceId: trace.id,
              elapsedSeconds: 0,
              distanceMeters: 0,
              error: null,
              finishedTrace: null,
            }))

            // Chronomètre secondaire
            tickRef.current = setInterval(() => {
              if (!startedAtRef.current) return
              setStateWithStatus((s) => ({
                ...s,
                elapsedSeconds: Math.floor((Date.now() - startedAtRef.current!) / 1000),
              }))
            }, 1000)

            // Envoi périodique des positions par batch (toutes les 15s)
            batchRef.current = setInterval(async () => {
              if (statusRef.current !== 'recording') return
              setStateWithStatus((s) =>
                s.status === 'recording' ? { ...s, status: 'syncing' } : s
              )
              await flushPositions()
              setStateWithStatus((s) =>
                s.status === 'syncing' ? { ...s, status: 'recording' } : s
              )
            }, BATCH_INTERVAL_MS)

            // Surveillance GPS continue
            watchIdRef.current = navigator.geolocation.watchPosition(
              (pos) => {
                const newPt = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }
                const last = lastPositionRef.current

                if (last) {
                  const delta = haversineMeters(last, newPt)
                  if (delta >= MIN_MOVEMENT_METERS) {
                    distanceRef.current += delta
                    lastPositionRef.current = newPt
                    setStateWithStatus((s) => ({
                      ...s,
                      distanceMeters: Math.round(distanceRef.current),
                    }))
                  }
                }

                // Enqueue la position dans la file locale
                pendingRef.current.push({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  accuracy_m: pos.coords.accuracy ?? null,
                  speed_mps: pos.coords.speed ?? null,
                  recorded_at: new Date(pos.timestamp).toISOString(),
                })
              },
              () => {
                // Perte GPS temporaire — on continue sans interrompre
              },
              { enableHighAccuracy: true }
            )
          } catch (err) {
            setStateWithStatus((s) => ({
              ...s,
              status: 'failed',
              error: toErrorMessage(err),
            }))
          }
        },
        () => {
          setStateWithStatus((s) => ({
            ...s,
            status: 'failed',
            error: 'Permission GPS refusée. Autorisez le GPS dans les paramètres du navigateur.',
          }))
        },
        { enableHighAccuracy: true, timeout: 15_000 }
      )
    },
    [flushPositions, setStateWithStatus]
  )

  const finishJourney = useCallback(async () => {
    const traceId = traceIdRef.current
    if (!traceId) return

    setStateWithStatus((s) => ({ ...s, status: 'finishing' }))
    stopAll()

    // Vider la file avant de clore
    await flushPositions()

    try {
      const finished = await finishMapTrace(traceId, {})
      setStateWithStatus((s) => ({
        ...s,
        status: 'finished',
        finishedTrace: finished,
      }))
    } catch (err) {
      setStateWithStatus((s) => ({
        ...s,
        status: 'failed',
        error: toErrorMessage(err),
      }))
    }
  }, [stopAll, flushPositions, setStateWithStatus])

  const reset = useCallback(() => {
    stopAll()
    traceIdRef.current = null
    startedAtRef.current = null
    lastPositionRef.current = null
    distanceRef.current = 0
    pendingRef.current = []
    setStateWithStatus(() => initialState)
  }, [stopAll, setStateWithStatus])

  useEffect(() => stopAll, [stopAll])

  return { ...state, startJourney, finishJourney, reset }
}
