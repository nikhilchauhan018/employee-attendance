import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, clearError } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import { validateEmail, validatePassword, validateForm } from '../utils/validators'
import { FiCheckSquare } from 'react-icons/fi'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let { user, loading, error } = useSelector(s => s.auth)

  let [form, setForm] = useState({ email: '', password: '' })
  let [errors, setErrors] = useState({})

  useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  function onChange(e) {
    let { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function onSubmit(e) {
    e.preventDefault()
    let result = validateForm(form, { email: validateEmail, password: validatePassword })
    if (!result.isValid) return setErrors(result.errors)
    dispatch(loginUser(form))
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #5b5a8e 0%, #3d3c6b 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mx-auto mb-3">
            <FiCheckSquare className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AttendanceHQ</h1>
          <p className="text-white/60 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <Input label="Email Address" name="email" type="email"
              value={form.email} onChange={onChange} error={errors.email}
              placeholder="you@company.com" autoComplete="email" />

            <Input label="Password" name="password" type="password"
              value={form.password} onChange={onChange} error={errors.password}
              placeholder="Enter your password" autoComplete="current-password" />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
