import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, thunk) => {
  try {
    let res = await api.post('/attendance/checkin')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, thunk) => {
  try {
    let res = await api.post('/attendance/checkout')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchTodayStatus = createAsyncThunk('attendance/today', async (_, thunk) => {
  try {
    let res = await api.get('/attendance/today')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchHistory = createAsyncThunk('attendance/history', async (params = {}, thunk) => {
  try {
    let qs = new URLSearchParams(params).toString()
    let res = await api.get(`/attendance/my-history?${qs}`)
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchMonthlySummary = createAsyncThunk('attendance/summary', async ({ year, month }, thunk) => {
  try {
    let res = await api.get(`/attendance/my-summary?year=${year}&month=${month}`)
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchDashboard = createAsyncThunk('attendance/dashboard', async (_, thunk) => {
  try {
    let res = await api.get('/dashboard/employee')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

const initialState = {
  todayStatus: null,
  history: { records: [], total: 0, page: 1, totalPages: 0 },
  monthlySummary: null,
  dashboard: null,
  loading: false,
  error: null
}

const slice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError(state) { state.error = null }
  },
  extraReducers: builder => {
    builder
      .addCase(checkIn.fulfilled, (state, action) => { state.todayStatus = action.payload })
      .addCase(checkOut.fulfilled, (state, action) => { state.todayStatus = action.payload })
      .addCase(fetchTodayStatus.fulfilled, (state, action) => { state.todayStatus = action.payload })

    builder.addCase(fetchHistory.pending, s => { s.loading = true })
    builder.addCase(fetchHistory.fulfilled, (s, a) => { s.loading = false; s.history = a.payload })
    builder.addCase(fetchHistory.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    builder.addCase(fetchMonthlySummary.pending, s => { s.loading = true })
    builder.addCase(fetchMonthlySummary.fulfilled, (s, a) => { s.loading = false; s.monthlySummary = a.payload })
    builder.addCase(fetchMonthlySummary.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    builder.addCase(fetchDashboard.pending, s => { s.loading = true })
    builder.addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload })
    builder.addCase(fetchDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload })
  }
})

export const { clearAttendanceError } = slice.actions
export default slice.reducer
