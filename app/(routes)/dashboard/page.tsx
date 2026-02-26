import React from 'react'
import Navbar from '@/app/_shared/navbar';
import DashboardPage from './_component/History';


function Dashboard() {
  return (
    <div>
      <Navbar/>
      <div className="pt-24">
        <DashboardPage/>
      </div>
    </div>
  )
}

export default Dashboard