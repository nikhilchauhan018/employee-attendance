import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  let [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setShowSidebar(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
