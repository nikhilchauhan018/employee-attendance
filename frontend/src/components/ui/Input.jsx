import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, type = 'text', id, className = '', ...props }, ref) => {
  let inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-dark mb-1.5">
          {label}
        </label>
      )}
      <input ref={ref} id={inputId} type={type}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
        {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
