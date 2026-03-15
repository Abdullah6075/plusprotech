import React from 'react'
import processImage from "../assets/process-image.jpg"
import { CalendarCheck, UserCheck, CheckCircle2 } from 'lucide-react'

const STEPS = [
    {
        step: '01',
        icon: <CalendarCheck className="w-6 h-6" />,
        title: 'Book an Appointment',
        desc: 'Your time is precious! Schedule your desired time slot online in just a few clicks. We prepare in advance so there is no waiting.',
        accent: 'bg-[#EC4421]',
        shadow: 'shadow-[#EC4421]/30',
    },
    {
        step: '02',
        icon: <UserCheck className="w-6 h-6" />,
        title: 'Proficient Technicians',
        desc: 'Our certified experts will thoroughly diagnose and repair your device, keeping you informed at every step of the way.',
        accent: 'bg-gray-800',
        shadow: 'shadow-gray-800/30',
    },
    {
        step: '03',
        icon: <CheckCircle2 className="w-6 h-6" />,
        title: 'Gadget Fixed & Ready',
        desc: 'Most repairs are done in under 30 minutes. We test your device before returning it to ensure full functionality.',
        accent: 'bg-[#EC4421]',
        shadow: 'shadow-[#EC4421]/30',
    },
]

const ProcessSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container flex flex-col gap-14">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                        <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">How It Works</span>
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                    </div>
                    <h2 className="md:text-5xl text-3xl font-bold tracking-tight text-gray-900">
                        Our Simple 3-Step Process
                    </h2>
                    <p className="text-sm font-light tracking-tight max-w-lg text-gray-600 leading-relaxed">
                        We follow clear steps to ensure everything gets done right. Our process is designed to keep you informed and satisfied throughout.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Steps */}
                    <div className="flex flex-col gap-8">
                        {STEPS.map((step, i) => (
                            <div key={i} className="flex gap-5 items-start group">
                                <div className={`${step.accent} w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${step.shadow} group-hover:scale-105 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <div className="flex flex-col gap-1 pt-1">
                                    <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Step {step.step}</span>
                                    <h3 className="text-lg font-bold tracking-tight text-gray-800">{step.title}</h3>
                                    <p className="text-sm font-light tracking-tight text-gray-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Image with brand-color frame accent — offset uses inset approach to avoid overflow */}
                    <div className="relative w-full h-72 sm:h-80 lg:h-[500px] p-3">
                        <div className="absolute inset-0 rounded-3xl bg-[#EC4421]/15 translate-x-3 translate-y-3" />
                        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={processImage}
                                loading="lazy"
                                decoding="async"
                                alt="Our working process"
                                width="800"
                                height="600"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProcessSection
