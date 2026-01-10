import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice'

const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Mobile Repairing Company Management System
        </h1>
        {isAuthenticated ? (
          <div>
            <p className="text-lg text-gray-600 mb-4">
              Welcome back, {user?.name}!
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-500 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-500 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-500 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
