import { forwardRef } from 'react'

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', id, className = '', ...props }, ref) => {
  let selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-dark mb-1.5">
          {label}
        </label>
      )}
      <select ref={ref} id={selectId}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => {
          let val = typeof opt === 'string' ? opt : opt.value
          let lbl = typeof opt === 'string' ? opt : opt.label
          return <option key={val} value={val}>{lbl}</option>
        })}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
