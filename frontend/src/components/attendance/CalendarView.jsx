import { useMemo, useState } from 'react'
import { STATUS_COLORS } from '../../utils/constants'
import { formatStatusLabel, formatTime, formatHours, formatDate } from '../../utils/formatters'
import { FiX } from 'react-icons/fi'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ year, month, records }) {
  let [selectedDay, setSelectedDay] = useState(null)

  let weeks = useMemo(() => {
    let firstDay = new Date(year, month - 1, 1).getDay()
    let totalDays = new Date(year, month, 0).getDate()

    let byDay = {}
    if (records && records.length) {
      records.forEach(r => {
        let d = new Date(r.date).getDate()
        byDay[d] = r
      })
    }

    let result = []
    let week = Array(firstDay).fill(null)

    for (let day = 1; day <= totalDays; day++) {
      week.push({ day, record: byDay[day] || null })
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null)
      result.push(week)
    }

    return result
  }, [year, month, records])

  // reset selection when month changes
  useMemo(() => setSelectedDay(null), [year, month])

  let today = new Date()
  let isCurrMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  function handleDayClick(cell) {
    if (!cell) return
    setSelectedDay(prev => prev?.day === cell.day ? null : cell)
  }

  let selectedRecord = selectedDay?.record || null

  return (
    <div>
      {/* legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {Object.entries(STATUS_COLORS).map(([key, clr]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${clr.dot}`} />
            <span className="text-xs text-gray-600">{formatStatusLabel(key)}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-2xl overflow-hidden">
            {DAY_HEADERS.map(d => (
              <div key={d} className="bg-surface px-2 py-3 text-center text-xs font-semibold text-muted uppercase">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-2xl overflow-hidden">
            {weeks.map((wk, wi) =>
              wk.map((cell, di) => {
                if (!cell) {
                  return <div key={`${wi}-${di}`} className="bg-surface min-h-[80px]" />
                }

                let isToday = isCurrMonth && cell.day === today.getDate()
                let isSelected = selectedDay?.day === cell.day
                let st = cell.record?.status
                let clr = st ? STATUS_COLORS[st] : null
                let isPast = new Date(year, month - 1, cell.day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                let noRecord = !st && isPast

                return (
                  <div key={`${wi}-${di}`}
                    onClick={() => handleDayClick(cell)}
                    className={`bg-white min-h-[80px] p-2 cursor-pointer transition-all hover:bg-surface
                      ${isToday ? 'ring-2 ring-primary-400 ring-inset' : ''}
                      ${isSelected ? 'ring-2 ring-primary-300 ring-inset bg-primary-50' : ''}`}>
                    <span className={`text-sm font-medium ${isToday
                      ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white'
                      : 'text-dark'}`}>
                      {cell.day}
                    </span>

                    {st && (
                      <div className="mt-1">
                        <span className={`block rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight ${clr.bg} ${clr.text}`}>
                          {formatStatusLabel(st)}
                        </span>
                        {cell.record.totalHours > 0 && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {cell.record.totalHours.toFixed(1)}h
                          </span>
                        )}
                      </div>
                    )}

                    {noRecord && (
                      <div className="mt-1">
                        <span className="block rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight bg-red-100 text-red-700">
                          Absent
                        </span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* detail panel on date click */}
      {selectedDay && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-gray-100">
            <h4 className="text-sm font-semibold text-dark">
              {formatDate(new Date(year, month - 1, selectedDay.day).toISOString())}
            </h4>
            <button onClick={() => setSelectedDay(null)}
              className="text-muted hover:text-dark transition-all">
              <FiX className="h-4 w-4" />
            </button>
          </div>

          {selectedRecord ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
              <div>
                <p className="text-xs text-muted mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${STATUS_COLORS[selectedRecord.status]?.bg || 'bg-gray-100'}
                  ${STATUS_COLORS[selectedRecord.status]?.text || 'text-gray-700'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[selectedRecord.status]?.dot || 'bg-gray-400'}`} />
                  {formatStatusLabel(selectedRecord.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Check In</p>
                <p className="text-sm font-medium text-dark">{formatTime(selectedRecord.checkInTime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Check Out</p>
                <p className="text-sm font-medium text-dark">{formatTime(selectedRecord.checkOutTime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Total Hours</p>
                <p className="text-sm font-medium text-dark">{formatHours(selectedRecord.totalHours)} hrs</p>
              </div>
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm text-muted">No attendance record for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
