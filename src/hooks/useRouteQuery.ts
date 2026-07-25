import { useCallback, useState } from 'react'
import { fetchRoute } from '../api/routeApi'
import { RouteApiError, type RouteErrorCode, type RouteSuccessResponse } from '../types/route'
import type { RoutePoint } from './useRoutePoints'

const CLIENT_TIMEOUT_MS = 10000

interface RouteQueryState {
  data: RouteSuccessResponse | null
  loading: boolean
  errorCode: RouteErrorCode | null
  errorMessage: string | null
}

const initialState: RouteQueryState = {
  data: null,
  loading: false,
  errorCode: null,
  errorMessage: null,
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

export function useRouteQuery() {
  const [state, setState] = useState<RouteQueryState>(initialState)

  const calculateRoute = useCallback(async (start: RoutePoint, end: RoutePoint) => {
    setState({ data: null, loading: true, errorCode: null, errorMessage: null })

    try {
      const result = await withClientTimeout(
        fetchRoute({ start, end, profile: 'car' }),
        CLIENT_TIMEOUT_MS
      )
      setState({ data: result, loading: false, errorCode: null, errorMessage: null })
    } catch (err) {
      if (err instanceof RouteApiError) {
        setState({ data: null, loading: false, errorCode: err.code, errorMessage: err.message })
      } else {
        setState({
          data: null,
          loading: false,
          errorCode: 'internal_error',
          errorMessage: 'Une erreur inattendue est survenue.',
        })
      }
    }
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return { ...state, calculateRoute, reset }
}