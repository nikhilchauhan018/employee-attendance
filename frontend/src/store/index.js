import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import attendanceReducer from './slices/attendanceSlice'
import managerReducer from './slices/managerSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    manager: managerReducer
  }
})
