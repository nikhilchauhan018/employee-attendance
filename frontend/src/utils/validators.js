export function validateEmail(email) {
  if (!email) return 'Email is required'
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email'
  return ''
}

export function validatePassword(pw) {
  if (!pw) return 'Password is required'
  if (pw.length < 6) return 'Password must be at least 6 characters'
  return ''
}

export function validateRequired(val, name) {
  if (!val || (typeof val === 'string' && !val.trim())) {
    return `${name} is required`
  }
  return ''
}

export function validateName(name) {
  if (!name) return 'Name is required'
  if (name.trim().length < 2) return 'Name must be at least 2 characters'
  return ''
}

export function validateForm(values, rules) {
  let errors = {}
  let isValid = true

  for (let field of Object.keys(rules)) {
    let err = rules[field](values[field])
    if (err) {
      errors[field] = err
      isValid = false
    }
  }

  return { errors, isValid }
}
