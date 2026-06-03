import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchManagerDashboard = createAsyncThunk('manager/dashboard', async (_, thunk) => {
  try {
    let res = await api.get('/dashboard/manager')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchAllAttendance = createAsyncThunk('manager/allAttendance', async (params = {}, thunk) => {
  try {
    let qs = new URLSearchParams(params).toString()
    let res = await api.get(`/attendance/all?${qs}`)
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchEmployeeAttendance = createAsyncThunk('manager/employeeAttendance', async ({ id, ...params }, thunk) => {
  try {
    let qs = new URLSearchParams(params).toString()
    let res = await api.get(`/attendance/employee/${id}?${qs}`)
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchTeamSummary = createAsyncThunk('manager/teamSummary', async (params = {}, thunk) => {
  try {
    let qs = new URLSearchParams(params).toString()
    let res = await api.get(`/attendance/summary?${qs}`)
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

export const fetchTodayAllStatus = createAsyncThunk('manager/todayStatus', async (_, thunk) => {
  try {
    let res = await api.get('/attendance/today-status')
    return res.data
  } catch (err) { return thunk.rejectWithValue(err.message) }
})

const initialState = {
  dashboard: null,
  allAttendance: { records: [], total: 0, page: 1, totalPages: 0 },
  employeeRecords: { records: [], total: 0, page: 1, totalPages: 0 },
  teamSummary: null,
  todayStatus: null,
  loading: false,
  error: null
}

const slice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    clearManagerError(state) { state.error = null }
  },
  extraReducers: builder => {
    // dashboard
    builder.addCase(fetchManagerDashboard.pending, s => { s.loading = true })
    builder.addCase(fetchManagerDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload })
    builder.addCase(fetchManagerDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    // all attendance
    builder.addCase(fetchAllAttendance.pending, s => { s.loading = true })
    builder.addCase(fetchAllAttendance.fulfilled, (s, a) => { s.loading = false; s.allAttendance = a.payload })
    builder.addCase(fetchAllAttendance.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    // single employee attendance
    builder.addCase(fetchEmployeeAttendance.pending, s => { s.loading = true })
    builder.addCase(fetchEmployeeAttendance.fulfilled, (s, a) => { s.loading = false; s.employeeRecords = a.payload })
    builder.addCase(fetchEmployeeAttendance.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    // team summary
    builder.addCase(fetchTeamSummary.pending, s => { s.loading = true })
    builder.addCase(fetchTeamSummary.fulfilled, (s, a) => { s.loading = false; s.teamSummary = a.payload })
    builder.addCase(fetchTeamSummary.rejected, (s, a) => { s.loading = false; s.error = a.payload })

    // today all status
    builder.addCase(fetchTodayAllStatus.pending, s => { s.loading = true })
    builder.addCase(fetchTodayAllStatus.fulfilled, (s, a) => { s.loading = false; s.todayStatus = a.payload })
    builder.addCase(fetchTodayAllStatus.rejected, (s, a) => { s.loading = false; s.error = a.payload })
  }
})

export const { clearManagerError } = slice.actions
export default slice.reducer
