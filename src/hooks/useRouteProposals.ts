import { useCallback, useState } from 'react'
import { fetchRouteProposals } from '../api/routeProposalsApi'
import { fetchRouteProposalsMock } from '../api/routeProposalsApi.mock'
import { RouteApiError, type RouteErrorCode, type RouteProposal, type RouteRequest, type VehicleProfile } from '../types/route'
import type { RoutePoint } from './useRoutePoints'

export interface RouteProposalsOptions {
  profile?: VehicleProfile
  vehicleWidthM?: number
  vehicleWeightT?: number
}

const CLIENT_TIMEOUT_MS = 10000

interface ProposalsState {
  proposals: RouteProposal[]
  loading: boolean
  errorCode: RouteErrorCode | null
  errorMessage: string | null
  selectedIndex: number
}

const initialState: ProposalsState = {
  proposals: [],
  loading: false,
  errorCode: null,
  errorMessage: null,
  selectedIndex: 0,
}

function withClientTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new RouteApiError(504, 'routing_timeout', "Le calcul de l'itinéraire a pris trop de temps."))
    }, ms)

    promise
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export function useRouteProposals() {
  const [state, setState] = useState<ProposalsState>(initialState)

const calculateProposals = useCallback(async (
    start: RoutePoint,
    end: RoutePoint,
    options?: RouteProposalsOptions
  ) => {
    setState({ ...initialState, loading: true })

    const request: RouteRequest = {
      start,
      end,
      profile: options?.profile ?? 'car',
      ...(options?.profile === 'truck' && options?.vehicleWidthM
        ? { vehicle_width_m: options.vehicleWidthM }
        : {}),
      ...(options?.profile === 'truck' && options?.vehicleWeightT
        ? { vehicle_weight_t: options.vehicleWeightT }
        : {}),
    }

    try {
      // Try real API first
      let proposals: RouteProposal[]
      try {
        proposals = await withClientTimeout(
          fetchRouteProposals(request),
          CLIENT_TIMEOUT_MS
        )
      } catch (err) {
        // If network error or timeout, fallback to mock
        if (err instanceof RouteApiError && 
            (err.code === 'routing_engine_unavailable' || err.code === 'routing_timeout')) {
          console.warn('[useRouteProposals] Backend unavailable, using mock data')
          proposals = await fetchRouteProposalsMock(request)
        } else {
          throw err
        }
      }
      setState({ proposals, loading: false, errorCode: null, errorMessage: null, selectedIndex: 0 })
    } catch (err) {
      if (err instanceof RouteApiError) {
        setState({ proposals: [], loading: false, errorCode: err.code, errorMessage: err.message, selectedIndex: 0 })
      } else {
        setState({
          proposals: [],
          loading: false,
          errorCode: 'internal_error',
          errorMessage: 'Une erreur inattendue est survenue.',
          selectedIndex: 0,
        })
      }
    }
  }, [])

  const selectProposal = useCallback((index: number) => {
    setState((s) => ({ ...s, selectedIndex: index }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return { ...state, calculateProposals, selectProposal, reset }
}
