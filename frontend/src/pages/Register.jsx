import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, clearError } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import { validateEmail, validatePassword, validateName, validateRequired, validateForm } from '../utils/validators'
import { DEPARTMENTS, ROLES } from '../utils/constants'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function Register() {
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let { user, loading, error } = useSelector(s => s.auth)

  let [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', role: ''
  })
  let [errors, setErrors] = useState({})

  useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error, dispatch])

  function handleChange(e) {
    let { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    let validation = validateForm(form, {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: v => v !== form.password ? 'Passwords do not match' : '',
      department: v => validateRequired(v, 'Department'),
      role: v => validateRequired(v, 'Role')
    })

    if (!validation.isValid) return setErrors(validation.errors)

    // strip confirmPassword before sending
    let { confirmPassword: _, ...data } = form
    dispatch(registerUser(data))
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #5b5a8e 0%, #3d3c6b 100%)' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mx-auto mb-3">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">AttendanceHQ</h1>
          <p className="text-white/60 mt-2">Create your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" name="name" value={form.name}
              onChange={handleChange} error={errors.name} placeholder="John Doe" />

            <Input label="Email Address" name="email" type="email" value={form.email}
              onChange={handleChange} error={errors.email} placeholder="you@company.com" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Department" name="department" value={form.department}
                onChange={handleChange} error={errors.department} options={DEPARTMENTS}
                placeholder="Select department" />
              <Select label="Role" name="role" value={form.role}
                onChange={handleChange} error={errors.role}
                options={[{ value: ROLES.EMPLOYEE, label: 'Employee' }, { value: ROLES.MANAGER, label: 'Manager' }]}
                placeholder="Select role" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Password" name="password" type="password" value={form.password}
                onChange={handleChange} error={errors.password} placeholder="Min 6 characters" />
              <Input label="Confirm Password" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
                placeholder="Re-enter password" />
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
