import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './ui/button'

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth()
    return (
        <div className="w-full bg-zinc-900 text-white">
            <div className="container flex justify-between items-center py-6">
                <div className="text-2xl font-semibold">Softshifters.</div>
                <div className="text-white">
                    {user && user?.name}
                    {user? <Button onClick={logout}>Logout</Button> : <Link to="/login">Login</Link>}
                </div>
            </div>
        </div>
    )
}

export default Navbar