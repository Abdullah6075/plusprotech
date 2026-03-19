import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const FEATURES = [
    'Free diagnostics on all devices',
    'Best Quality parts used in all repairs',
    'Trained and certified technicians',
    'Transparent pricing — no hidden fees',
]

const STATS = [
    { value: '20+', label: 'Years of Experience', bg: 'bg-[#EC4421]' },
    { value: '5,03,000+', label: 'Gadgets Fixed', bg: 'bg-gray-800' },
    { value: '5,01,900+', label: 'Satisfied Customers', bg: 'bg-gray-700' },
    { value: '30 min', label: 'Avg. Repair Time', bg: 'bg-[#EC4421]/85' },
]

const AboutSection = () => {
    return (
        <section id="about" className="py-20" style={{ background: '#FFF7F5' }}>
            <div className="container">
                <div className="flex flex-col lg:grid grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-[#EC4421]" />
                            <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">About Us</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                            Your Trusted <span className="text-[#EC4421]">Tech Repair</span> Partner
                        </h2>
                        <p className="text-gray-600 text-base font-light tracking-tight leading-relaxed">
                            We promise customer satisfaction with our high-quality repairs and sales. Our prices are fair and competitive. We ensure broken cellphones, tablets and PCs don&apos;t keep you separated for long. Your device is valuable to you — we know that!
                        </p>
                        <ul className="flex flex-col gap-3">
                            {FEATURES.map((f) => (
                                <li key={f} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#EC4421] shrink-0" />
                                    <span className="text-sm text-gray-700 tracking-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right — stat cards */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-5">
                        {STATS.map((stat) => (
                            <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 sm:p-7 flex flex-col gap-2 shadow-lg`}>
                                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs sm:text-sm font-light text-white/85 tracking-tight">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
