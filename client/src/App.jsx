import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from './store/authSlice'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Categories from './pages/Categories'
import Services from './pages/Services'
import Models from './pages/Models'
import ModelServices from './pages/ModelServices'
import Appointments from './pages/Appointments'
import ProtectedRoute from './components/ProtectedRoute'

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Dashboard Redirect Component
 * Redirects to appropriate page based on user role
 */
const DashboardRedirect = () => {
  const user = useSelector(selectCurrentUser);
  const role = user?.role || 'customer';
  
  if (role === 'admin') {
    return <Navigate to="/dashboard/categories" replace />;
  }
  
  return <Navigate to="/dashboard/appointments" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route 
          path='/login' 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path='/register' 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path='/forgot-password' 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DashboardRedirect />} />
          <Route path='categories' element={<Categories />} />
          <Route path='services' element={<Services />} />
          <Route path='models' element={<Models />} />
          <Route path='model-services' element={<ModelServices />} />
          <Route path='appointments' element={<Appointments />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
