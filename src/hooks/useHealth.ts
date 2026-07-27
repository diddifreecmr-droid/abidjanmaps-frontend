import { useCallback, useState } from 'react'
import { fetchHealth, fetchDbHealth, type HealthStatus } from '../api/healthApi'

interface HealthCheckState {
  data: HealthStatus | null
  loading: boolean
  error: string | null
}

const IDLE_STATE: HealthCheckState = { data: null, loading: false, error: null }

export function useHealth() {
  const [backend, setBackend] = useState<HealthCheckState>(IDLE_STATE)
  const [database, setDatabase] = useState<HealthCheckState>(IDLE_STATE)

  const check = useCallback(async () => {
    setBackend({ data: null, loading: true, error: null })
    setDatabase({ data: null, loading: true, error: null })

    // Les deux checks sont indépendants : un backend OK avec une base down (ou l'inverse)
    // est un état valide qu'on veut pouvoir distinguer, donc pas de Promise.all bloquant.
    fetchHealth()
      .then((data) => setBackend({ data, loading: false, error: null }))
      .catch((err) => setBackend({ data: null, loading: false, error: err instanceof Error ? err.message : 'Injoignable' }))

    fetchDbHealth()
      .then((data) => setDatabase({ data, loading: false, error: null }))
      .catch((err) => setDatabase({ data: null, loading: false, error: err instanceof Error ? err.message : 'Injoignable' }))
  }, [])

  return { backend, database, check }
}