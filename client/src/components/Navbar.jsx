import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth()
    return (
        <div className="container flex justify-between items-center py-6">
            <p className='text-xl tracking-tight text-gray-800'>PlusProtech.</p>
            <div className="">
                {
                    !isAuthenticated ? (
                        <Link to="/login">Login</Link>
                    ) : (
                        <div className="flex gap-3 items-center">
                                <Link to="/dashboard">{user?.name}</Link>
                            <Link to="/logout" onClick={logout}>Logout</Link>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Navbar