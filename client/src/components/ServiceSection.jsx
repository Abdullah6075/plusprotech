import { useGetCategoriesQuery } from '@/services/categoryApi'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, X, ClipboardList, Bell, History, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getImageUrl } from '@/lib/utils'

const LoginAwarenessModal = ({ onContinue, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label="Close"
        />

        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Brand accent top bar */}
            <div className="h-1 w-full bg-[#EC4421]" />

            <div className="p-7 flex flex-col gap-5">
                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#EC4421]/10 rounded-2xl flex items-center justify-center text-[#EC4421]">
                    <LogIn className="w-7 h-7" />
                </div>

                {/* Heading */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">
                        Get More from Your Repair
                    </h3>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                        Logging in lets you track your repair, view your appointment history, and get notified when your device is ready.
                    </p>
                </div>

                {/* Benefits */}
                <ul className="flex flex-col gap-3">
                    {[
                        { icon: <ClipboardList className="w-4 h-4" />, text: 'Track repair status in real-time' },
                        { icon: <Bell className="w-4 h-4" />, text: 'Get notified when device is ready' },
                        { icon: <History className="w-4 h-4" />, text: 'Access full appointment history' },
                    ].map((item) => (
                        <li key={item.text} className="flex items-center gap-3">
                            <span className="w-7 h-7 bg-[#EC4421]/10 rounded-lg flex items-center justify-center text-[#EC4421] shrink-0">
                                {item.icon}
                            </span>
                            <span className="text-xs text-gray-600 tracking-tight">{item.text}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2.5 pt-1">
                    <Link
                        to="/login"
                        className="w-full bg-[#EC4421] hover:bg-[#c93519] text-white py-3 rounded-full font-semibold text-sm tracking-tight text-center transition-all shadow-lg shadow-[#EC4421]/20 hover:scale-[1.02] cursor-pointer"
                    >
                        Log In to My Account
                    </Link>
                    <button
                        type="button"
                        onClick={onContinue}
                        className="w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 py-3 rounded-full font-medium text-sm tracking-tight transition-all cursor-pointer"
                    >
                        Continue as Guest
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400">
                    Login is optional — you can always browse and book without an account.
                </p>
            </div>
        </div>
    </div>
)

const ServiceSection = () => {
    const { data, isLoading } = useGetCategoriesQuery({ limit: 1000 })
    const categories = data?.data?.categories || []
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [pendingUrl, setPendingUrl] = useState(null)

    const handleCategoryClick = (e, categoryId) => {
        e.preventDefault()
        const url = `/category/${categoryId}`
        if (isAuthenticated) {
            navigate(url)
        } else {
            setPendingUrl(url)
        }
    }

    const handleContinueAsGuest = () => {
        if (pendingUrl) navigate(pendingUrl)
        setPendingUrl(null)
    }

    const handleCloseModal = () => setPendingUrl(null)

    return (
        <>
            {/* Login awareness popup */}
            {pendingUrl && (
                <LoginAwarenessModal
                    onContinue={handleContinueAsGuest}
                    onClose={handleCloseModal}
                />
            )}

            <section id="services" className="py-20 bg-white">
                <div className="container flex flex-col gap-12">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-[#EC4421]" />
                            <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">What We Repair</span>
                            <span className="w-6 h-0.5 bg-[#EC4421]" />
                        </div>
                        <h2 className="md:text-5xl text-3xl font-bold tracking-tight text-gray-900">
                            Our Services
                        </h2>
                        <p className="text-sm font-light tracking-tight max-w-lg text-gray-600 leading-relaxed">
                            We fix all kinds of tech products including smartphones, tablets, laptops, desktops, and more. Browse our service categories below.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-full h-56 sm:h-72 rounded-2xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories?.map((category) => (
                                <a
                                    href={`/category/${category?._id}`}
                                    key={category?._id}
                                    className="group w-full cursor-pointer"
                                    onClick={(e) => handleCategoryClick(e, category?._id)}
                                >
                                    <div className="w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-md bg-gray-200">
                                        {getImageUrl(category?.image) && (
                                            <img
                                                src={getImageUrl(category?.image)}
                                                loading="lazy"
                                                decoding="async"
                                                alt={category?.name || 'Service category'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                                            <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                                                View Models <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EC4421] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <p className="text-base font-semibold tracking-tight text-gray-800">
                                            {category?.name || 'Name not found'}
                                        </p>
                                        <ArrowRight className="w-4 h-4 text-[#EC4421] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default ServiceSection
