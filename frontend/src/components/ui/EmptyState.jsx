export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <h3 className="text-sm font-medium text-dark">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  )
}
