function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
      <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      Calcul de l'itinéraire en cours…
    </div>
  )
}

export default LoadingState