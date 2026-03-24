interface EmptyStateProps {
  title: string
  description: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-8xl mb-6 opacity-75 group-hover:scale-110 transition-transform duration-300">📦</div>
      <h2 className="text-3xl font-bold text-gradient mb-3 text-center">{title}</h2>
      <p className="text-primary-600 text-center max-w-md leading-relaxed font-medium">{description}</p>
      <div className="mt-8 h-1 w-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"></div>
    </div>
  )
}
