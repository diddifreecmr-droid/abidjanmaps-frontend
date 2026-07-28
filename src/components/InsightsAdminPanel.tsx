import { useEffect, useState } from 'react'
import type { MapTraceInsight, MapTraceInsightQueueItem, InsightStatus } from '../types/insightsApi'

// --- Helpers ---

const INSIGHT_TYPE_LABELS: Record<string, string> = {
  duration_much_longer_than_planned: 'Durée bien dépassée',
  slow_journey: 'Trajet lent',
  possible_slow_segment: 'Segment lent',
  possible_blocked_road: 'Route potentiellement bloquée',
  possible_detour: 'Détour possible',
  gps_time_gap: 'Trou GPS',
  suspicious_gps_jump: 'Saut GPS filtré',
  low_point_count: 'Peu de points GPS',
}

const INSIGHT_TYPE_ICONS: Record<string, string> = {
  duration_much_longer_than_planned: '⏱️',
  slow_journey: '🐢',
  possible_slow_segment: '🚧',
  possible_blocked_road: '🚫',
  possible_detour: '↪️',
  gps_time_gap: '📡',
  suspicious_gps_jump: '⚡',
  low_point_count: '📍',
}

function insightTypeLabel(type: string): string {
  return INSIGHT_TYPE_LABELS[type] ?? type
}
function insightTypeIcon(type: string): string {
  return INSIGHT_TYPE_ICONS[type] ?? '📌'
}

function severityClass(n: number): string {
  if (n >= 5) return 'bg-red-600 text-white'
  if (n === 4) return 'bg-red-100 text-red-700'
  if (n === 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

function statusClass(s: InsightStatus): string {
  if (s === 'validated') return 'bg-green-100 text-green-700'
  if (s === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}
function statusLabel(s: InsightStatus): string {
  if (s === 'validated') return 'Validé'
  if (s === 'rejected') return 'Rejeté'
  return 'Proposé'
}

function confidenceBar(score: number | null) {
  if (score == null) return null
  const pct = Math.round(score * 100)
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 tabular-nums">{pct}%</span>
    </div>
  )
}

// --- Sous-composant: une ligne d'insight ---

interface InsightRowProps {
  insight: MapTraceInsight & { review_priority_score?: number | null; recommended_action?: string | null }
  actionLoading: number | null
  showValidate?: boolean
  showReject?: boolean
  showConvert?: boolean
  onValidate?: (id: number) => void
  onReject?: (id: number) => void
  onConvert?: (id: number) => void
  lastConverted?: number | null
}

function InsightRow({
  insight,
  actionLoading,
  showValidate,
  showReject,
  showConvert,
  onValidate,
  onReject,
  onConvert,
  lastConverted,
}: InsightRowProps) {
  const busy = actionLoading === insight.id
  const justConverted = lastConverted === insight.id

  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-2 hover:bg-gray-50">
      {/* Type + sévérité */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span>{insightTypeIcon(insight.insight_type)}</span>
          <span className="text-xs font-medium text-gray-800 truncate">
            {insightTypeLabel(insight.insight_type)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityClass(insight.severity)}`}>
            Sév. {insight.severity}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusClass(insight.status)}`}>
            {statusLabel(insight.status)}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-gray-600 leading-relaxed">{insight.message}</p>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span title="Trace source">Trace #{insight.trace_id}</span>
        <span title="Nombre de traces confirmant cet insight">
          {insight.evidence_count} {insight.evidence_count > 1 ? 'traces' : 'trace'}
        </span>
        {insight.review_priority_score != null && (
          <span title="Score de priorité de revue">
            Priorité : {Math.round(insight.review_priority_score * 100)}%
          </span>
        )}
      </div>

      {/* Confiance */}
      {confidenceBar(insight.confidence_score)}

      {/* Feedback conversion */}
      {justConverted && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Signalement routier créé (statut : proposé)
        </p>
      )}

      {/* Actions */}
      {(showValidate || showReject || showConvert) && (
        <div className="flex gap-2 pt-1">
          {showValidate && onValidate && (
            <button
              onClick={() => onValidate(insight.id)}
              disabled={busy}
              className="flex-1 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded px-2 py-1.5 font-medium transition-colors"
            >
              {busy ? '…' : 'Valider'}
            </button>
          )}
          {showReject && onReject && (
            <button
              onClick={() => onReject(insight.id)}
              disabled={busy}
              className="flex-1 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded px-2 py-1.5 font-medium transition-colors"
            >
              {busy ? '…' : 'Rejeter'}
            </button>
          )}
          {showConvert && onConvert && (
            <button
              onClick={() => onConvert(insight.id)}
              disabled={busy}
              className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded px-2 py-1.5 font-medium transition-colors"
            >
              {busy ? '…' : 'Créer signalement'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// --- Panel principal ---

type Tab = 'queue' | 'candidates' | 'all'

interface InsightsAdminPanelProps {
  reviewQueue: MapTraceInsightQueueItem[]
  candidates: MapTraceInsight[]
  allInsights: MapTraceInsight[]
  loading: boolean
  error: string | null
  actionLoading: number | null
  actionError: string | null
  lastConverted: number | null
  onFetchQueue: () => void
  onFetchCandidates: () => void
  onFetchAll: (status?: InsightStatus) => void
  onValidate: (id: number) => void
  onReject: (id: number) => void
  onConvert: (id: number) => void
  onClearActionError: () => void
  onClose: () => void
}

export function InsightsAdminPanel({
  reviewQueue,
  candidates,
  allInsights,
  loading,
  error,
  actionLoading,
  actionError,
  lastConverted,
  onFetchQueue,
  onFetchCandidates,
  onFetchAll,
  onValidate,
  onReject,
  onConvert,
  onClearActionError,
  onClose,
}: InsightsAdminPanelProps) {
  const [tab, setTab] = useState<Tab>('queue')
  const [allStatusFilter, setAllStatusFilter] = useState<InsightStatus | 'all'>('all')

  // Charger les données au changement d'onglet
  useEffect(() => {
    if (tab === 'queue') onFetchQueue()
    else if (tab === 'candidates') onFetchCandidates()
    else onFetchAll(allStatusFilter === 'all' ? undefined : allStatusFilter)
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (status: InsightStatus | 'all') => {
    setAllStatusFilter(status)
    onFetchAll(status === 'all' ? undefined : status)
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'queue', label: 'File de revue', count: reviewQueue.length || undefined },
    { id: 'candidates', label: 'Candidats', count: candidates.length || undefined },
    { id: 'all', label: 'Tous' },
  ]

  const currentItems =
    tab === 'queue' ? reviewQueue
    : tab === 'candidates' ? candidates
    : allInsights

  return (
    <div className="bg-white shadow-lg rounded-lg flex flex-col w-full md:w-96 max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
        <div>
          <p className="font-semibold text-gray-900">Insights Map Core</p>
          <p className="text-xs text-gray-500">Observations terrain à examiner</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
              tab === t.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filtre statut (onglet "Tous") */}
      {tab === 'all' && (
        <div className="px-4 py-2 border-b border-gray-100 shrink-0">
          <div className="flex gap-1">
            {(['all', 'proposed', 'validated', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  allStatusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'all' ? 'Tous' : s === 'proposed' ? 'Proposés' : s === 'validated' ? 'Validés' : 'Rejetés'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Corps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Erreur API */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}

        {/* Erreur d'action */}
        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start justify-between gap-2">
            <p className="text-red-600 text-xs">{actionError}</p>
            <button onClick={onClearActionError} className="text-red-400 hover:text-red-600 text-sm shrink-0">×</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-indigo-600 py-8">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-xs">Chargement…</span>
          </div>
        )}

        {/* Descriptions des onglets */}
        {!loading && !error && currentItems.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="text-2xl">
              {tab === 'queue' ? '✅' : tab === 'candidates' ? '📋' : '🔍'}
            </p>
            <p className="text-sm text-gray-500">
              {tab === 'queue' && 'Aucun insight en attente de revue.'}
              {tab === 'candidates' && 'Aucun candidat prêt à convertir en signalement.'}
              {tab === 'all' && 'Aucun insight trouvé.'}
            </p>
          </div>
        )}

        {/* Explication de l'onglet */}
        {!loading && currentItems.length > 0 && (
          <p className="text-xs text-gray-400 pb-1">
            {tab === 'queue' && 'Insights proposés triés par priorité — à valider ou rejeter.'}
            {tab === 'candidates' && 'Insights validés suffisamment solides pour devenir des signalements routiers.'}
            {tab === 'all' && `${currentItems.length} insight${currentItems.length > 1 ? 's' : ''} trouvé${currentItems.length > 1 ? 's' : ''}.`}
          </p>
        )}

        {/* Liste */}
        {!loading && currentItems.map((insight) => (
          <InsightRow
            key={insight.id}
            insight={insight}
            actionLoading={actionLoading}
            lastConverted={lastConverted}
            showValidate={tab === 'queue' || (tab === 'all' && insight.status === 'proposed')}
            showReject={tab === 'queue' || (tab === 'all' && insight.status === 'proposed')}
            showConvert={tab === 'candidates'}
            onValidate={onValidate}
            onReject={onReject}
            onConvert={onConvert}
          />
        ))}

        {/* Refresh */}
        {!loading && (
          <button
            onClick={() => {
              if (tab === 'queue') onFetchQueue()
              else if (tab === 'candidates') onFetchCandidates()
              else onFetchAll(allStatusFilter === 'all' ? undefined : allStatusFilter)
            }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 border border-dashed border-gray-200 rounded-lg transition-colors"
          >
            Actualiser
          </button>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-gray-100 shrink-0 text-xs text-gray-400">
        Valider → candidat · Rejeter → archivé · Créer signalement → proposé dans le workflow Map Core
      </div>
    </div>
  )
}

export default InsightsAdminPanel
