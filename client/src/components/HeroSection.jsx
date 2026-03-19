import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import logo from "../assets/logo.png"
import { useAuth } from '@/hooks/useAuth'
import { Menu, X, LayoutDashboard, Star, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

import slide1 from '../assets/carousal-image1.jpeg'
import slide2 from '../assets/carousal-image2.jpeg'
import slide3 from '../assets/carousal-image3.jpeg'
import slide4 from '../assets/carousal-image4.jpeg'
import slide5 from '../assets/carousal-image5.jpeg'

const SLIDES = [slide1, slide2, slide3, slide4, slide5]
const AUTOPLAY_INTERVAL = 5000

const NAV_LINKS = ['about', 'services', 'reviews', 'faq']

const TRUST_BADGES = [
    { icon: <Star className="w-4 h-4" />, text: '5-Star Rated Service' },
    { icon: <ShieldCheck className="w-4 h-4" />, text: 'Warranty on All Repairs' },
    { icon: <Clock className="w-4 h-4" />, text: 'Most Repairs in 30 Min' },
]

const HeroSection = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const isPaused = false
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const goToSlide = useCallback((index) => {
        setCurrentSlide((index + SLIDES.length) % SLIDES.length)
    }, [])

    const goNext = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])
    const goPrev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])

    // Autoplay
    useEffect(() => {
        const timer = setInterval(goNext, AUTOPLAY_INTERVAL)
        return () => clearInterval(timer)
    }, [goNext])

    const scrollTo = (id) => {
        setMenuOpen(false)
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="w-full">
            {/* ── Sticky Navbar ── */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
                        : 'bg-transparent'
                }`}
            >
                <div className="container flex justify-between items-center py-3.5">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer">
                        <img
                            src={logo}
                            alt="PlusProtech"
                            className="h-10 w-auto object-contain"
                            loading="eager"
                            decoding="async"
                        />
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-7">
                        {NAV_LINKS.map((id) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className={`text-sm capitalize tracking-tight font-medium transition-colors hover:text-[#EC4421] cursor-pointer ${
                                    scrolled ? 'text-gray-600' : 'text-white/80'
                                }`}
                            >
                                {id}
                            </button>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <Link
                                to="/login"
                                className="bg-[#EC4421] hover:bg-[#c93519] text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all shadow-lg shadow-[#EC4421]/25 hover:scale-105 cursor-pointer"
                            >
                                Login
                            </Link>
                        ) : (
                            <div className="flex gap-3 items-center">
                                <Link
                                    to="/dashboard"
                                    className={`text-sm font-medium tracking-tight transition-colors cursor-pointer ${
                                        scrolled ? 'text-gray-700' : 'text-white'
                                    }`}
                                >
                                    {user?.name}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-[#EC4421] hover:bg-[#c93519] text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        className={`md:hidden transition-colors cursor-pointer ${scrolled ? 'text-gray-800' : 'text-white'}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
                        <div className="container py-5 flex flex-col gap-3">
                            {NAV_LINKS.map((id) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id)}
                                    className="text-sm text-gray-600 text-left capitalize py-1.5 hover:text-[#EC4421] transition-colors font-medium cursor-pointer"
                                >
                                    {id}
                                </button>
                            ))}
                            <div className="pt-2 border-t border-gray-100">
                                {!isAuthenticated ? (
                                    <Link
                                        to="/login"
                                        className="block bg-[#EC4421] text-white px-5 py-2.5 rounded-full text-sm font-semibold text-center cursor-pointer"
                                    >
                                        Login
                                    </Link>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link to="/dashboard" className="text-sm text-gray-700 py-1 font-medium cursor-pointer">{user?.name}</Link>
                                        <button type="button" onClick={logout} className="bg-[#EC4421] text-white px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── Hero Carousel ── */}
            <div
                className="relative w-full min-h-screen flex items-center overflow-hidden"
            >
                {/* Carousel slides — crossfade */}
                {SLIDES.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`PlusProtech shop slide ${i + 1}`}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className={`absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-1000 ${
                            i === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden={i !== currentSlide}
                    />
                ))}

                {/* Multi-layer overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/80 to-gray-900/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30 z-10" />

                {/* Decorative brand-color accent bar on left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EC4421] z-20" />

                {/* Prev / Next arrows */}
                <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous slide"
                    className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-[#EC4421] border border-white/20 hover:border-[#EC4421] flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next slide"
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-[#EC4421] border border-white/20 hover:border-[#EC4421] flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Hero content */}
                <div className="relative z-20 container pt-28 pb-20">
                    <div className="max-w-2xl flex flex-col gap-6">

                        {/* Eyebrow badge */}
                        <div className="flex items-center gap-2 w-fit">
                            <span className="w-6 h-0.5 bg-[#EC4421]" />
                            <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">
                                Moline, Illinois
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="lg:text-6xl md:text-5xl text-[2.25rem] font-bold tracking-tight text-white leading-[1.08]">
                            Expert Repairs<br />
                            for Every <span className="text-[#EC4421]">Device</span><br />
                            You Own
                        </h1>

                        {/* Sub-headline */}
                        <p className="text-white/65 lg:text-base text-sm tracking-tight leading-relaxed max-w-lg">
                            Smartphones, tablets, laptops, and computers — our certified technicians fix them all. Fast turnarounds, fair pricing, and a satisfaction guarantee on every repair.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4 flex-wrap mt-2">
                            <button
                                onClick={() => scrollTo('services')}
                                className="bg-[#EC4421] hover:bg-[#c93519] text-white px-8 py-4 rounded-full font-semibold tracking-tight text-sm transition-all shadow-2xl shadow-[#EC4421]/30 hover:shadow-[#EC4421]/50 hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                Browse Services
                            </button>
                            <Link
                                to={isAuthenticated ? '/dashboard' : '/login'}
                                className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 hover:border-white/50 text-white px-8 py-4 rounded-full font-semibold tracking-tight text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Customer Dashboard
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-4 mt-2">
                            {TRUST_BADGES.map((badge) => (
                                <div key={badge.text} className="flex items-center gap-2">
                                    <span className="text-[#EC4421]">{badge.icon}</span>
                                    <span className="text-white/60 text-xs tracking-tight">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dot indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goToSlide(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                                i === currentSlide
                                    ? 'w-6 h-2 bg-[#EC4421]'
                                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>

                {/* Progress bar at the bottom of the slide */}
                {!isPaused && (
                    <div
                        key={currentSlide}
                        className="absolute bottom-0 left-0 h-0.5 bg-[#EC4421] z-20"
                        style={{
                            animation: `slideProgress ${AUTOPLAY_INTERVAL}ms linear forwards`,
                        }}
                    />
                )}
            </div>

            <style>{`
                @keyframes slideProgress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    )
}

export default HeroSection
