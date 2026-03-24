export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-primary/20 blur-xl animate-pulse"></div>
        <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 shadow-glow-primary"></div>
      </div>
      <p className="mt-6 text-primary-600 font-medium text-sm animate-pulse">Memuat...</p>
    </div>
  )
}
