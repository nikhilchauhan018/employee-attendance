import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { STORAGE_KEYS } from '../../utils/constants'

function loadUser() {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.USER)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    let res = await api.post('/auth/register', data)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user))
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    let res = await api.post('/auth/login', creds)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user))
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token)
    return res.data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    let res = await api.get('/auth/me')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data))
    return res.data
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUser(),
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.user = null
      state.error = null
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    },
    clearError(state) { state.error = null }
  },
  extraReducers: builder => {
    // register
    builder.addCase(registerUser.pending, state => { state.loading = true; state.error = null })
    builder.addCase(registerUser.fulfilled, (state, { payload }) => {
      state.loading = false
      state.user = payload.user
    })
    builder.addCase(registerUser.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload
    })

    // login
    builder.addCase(loginUser.pending, state => { state.loading = true; state.error = null })
    builder.addCase(loginUser.fulfilled, (state, { payload }) => {
      state.loading = false
      state.user = payload.user
    })
    builder.addCase(loginUser.rejected, (state, { payload }) => {
      state.loading = false
      state.error = payload
    })

    // profile
    builder.addCase(fetchProfile.fulfilled, (state, { payload }) => { state.user = payload })
  }
})

export const { logout, clearError } = slice.actions
export default slice.reducer
