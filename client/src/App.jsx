import React from 'react'
import { Button } from './components/ui/button'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
