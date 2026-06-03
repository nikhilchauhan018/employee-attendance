const variantMap = {
  primary: 'btn-primary',
  success: 'btn-success',
  danger: 'btn-danger',
  outline: 'btn-outline'
}

export default function Button({ children, variant = 'primary', type = 'button', disabled, loading, className = '', onClick, ...rest }) {
  let cls = variantMap[variant] || variantMap.primary

  return (
    <button type={type} disabled={disabled || loading} onClick={onClick}
      className={`${cls} ${className}`} {...rest}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
