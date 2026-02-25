import React from 'react'
import { Link } from 'react-router-dom'
import heroImage from "../assets/hero-image.jpg"
import { useAuth } from '@/hooks/useAuth'

const HeroSection = () => {
    const { user, isAuthenticated, logout } = useAuth()

    const scrollToServices = () => {
        const el = document.getElementById('services')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }

    return (
        <div className="w-full flex flex-col justify-center items-center">
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
            <div className="container flex flex-col items-center">
                <div className="pt-16 text-center flex flex-col items-center">
                    <p className='lg:text-6xl text-4xl tracking-tight text-gray-800 text-center'>Excellent Services For Your<br /> Broken Gadgets</p>
                    <p className='lg:max-w-xl max-w-sm mt-2 lg:text-sm text-xs text-gray-700 text-center tracking-tight'>We are here to repair your mobile phone and computer. Our expert service specializes in fixing these devices quickly and affordably. Trust us to restore your mobile phone or computer to full functionality.</p>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <Link onClick={scrollToServices} className='bg-gray-800 text-white px-6 py-3 rounded-full tracking-tight lg:text-sm text-xs'>Choose a service</Link>
                        {
                            isAuthenticated ? (
                                <Link to="/dashboard" className='border border-gray-800 font-medium text-gray-800 px-6 py-3 rounded-full tracking-tight lg:text-sm text-xs'>Dashboard</Link>
                            ) : (
                                <Link to="/login" className='border border-gray-800 font-medium text-gray-800 px-6 py-3 rounded-full tracking-tight lg:text-sm text-xs'>Login</Link>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="w-full h-screen mt-40">
                <img 
                    src={heroImage} 
                    alt="Hero Image" 
                    loading="eager"
                    decoding="async"
                    width="1920"
                    height="1080"
                    className='w-full h-full object-cover' 
                />
            </div>
        </div>
    )
}

export default HeroSection