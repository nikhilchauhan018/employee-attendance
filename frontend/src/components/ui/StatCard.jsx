const iconBoxColors = {
  primary: 'bg-stat-blue text-primary-600',
  emerald: 'bg-stat-green text-emerald-600',
  amber: 'bg-stat-yellow text-amber-600',
  red: 'bg-stat-pink text-red-500',
  orange: 'bg-stat-yellow text-orange-500',
  blue: 'bg-stat-blue text-blue-600'
}

export default function StatCard({ label, value, icon, color = 'primary', subtitle }) {
  let boxClr = iconBoxColors[color] || iconBoxColors.primary

  return (
    <div className="card p-5 flex items-center gap-4">
      {icon && (
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${boxClr}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="text-2xl font-bold text-dark mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
