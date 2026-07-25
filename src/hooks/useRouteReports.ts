import { useState, useCallback } from 'react'
import {
  fetchRouteReports,
  createRouteReport,
  validateRouteReport,
  rejectRouteReport,
} from '../api/routeReportsApi'
import {
  fetchRouteReportsMock,
  createRouteReportMock,
  validateRouteReportMock,
  rejectRouteReportMock,
} from '../api/routeReportsApi.mock'
import type { RouteReportCreate, RouteReportRead } from '../types/localData'

interface UseRouteReportsReturn {
  reports: RouteReportRead[]
  loading: boolean
  error: string | null
  fetchAll: (status?: 'proposed' | 'validated' | 'rejected') => Promise<void>
  create: (report: RouteReportCreate) => Promise<RouteReportRead>
  validate: (id: number) => Promise<void>
  reject: (id: number) => Promise<void>
}

export function useRouteReports(): UseRouteReportsReturn {
  const [reports, setReports] = useState<RouteReportRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async (status?: 'proposed' | 'validated' | 'rejected') => {
    setLoading(true)
    setError(null)
    try {
      let response: RouteReportRead[]
      try {
        response = await fetchRouteReports(status)
      } catch (err) {
        console.warn('[useRouteReports] Backend unavailable, using mock data')
        response = await fetchRouteReportsMock(status)
      }
      setReports(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des signalements')
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (report: RouteReportCreate): Promise<RouteReportRead> => {
    setLoading(true)
    setError(null)
    try {
      let created: RouteReportRead
      try {
        created = await createRouteReport(report)
      } catch (err) {
        console.warn('[useRouteReports] Backend unavailable, using mock data')
        created = await createRouteReportMock(report)
      }
      setReports((prev) => [...prev, created])
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du signalement'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const validate = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      let updated: RouteReportRead
      try {
        updated = await validateRouteReport(id)
      } catch (err) {
        console.warn('[useRouteReports] Backend unavailable, using mock data')
        updated = await validateRouteReportMock(id)
      }
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }, [])

  const reject = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      let updated: RouteReportRead
      try {
        updated = await rejectRouteReport(id)
      } catch (err) {
        console.warn('[useRouteReports] Backend unavailable, using mock data')
        updated = await rejectRouteReportMock(id)
      }
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rejet')
    } finally {
      setLoading(false)
    }
  }, [])

  return { reports, loading, error, fetchAll, create, validate, reject }
}