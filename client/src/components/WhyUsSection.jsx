import React from 'react'
import { Clock, Shield, DollarSign, Star, Wrench, ThumbsUp } from 'lucide-react'

const FEATURES = [
    {
        icon: <Clock className="w-6 h-6" />,
        title: 'Same-Day Service',
        desc: 'Most repairs are completed the same day you bring them in. We value your time and work fast without cutting corners.',
        iconBg: 'bg-[#EC4421]/15',
        iconColor: 'text-[#EC4421]',
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: 'Warranty on Repairs',
        desc: 'All our repairs come with a warranty. We stand behind our work and ensure your device stays fixed long-term.',
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-400',
    },
    {
        icon: <DollarSign className="w-6 h-6" />,
        title: 'Competitive Pricing',
        desc: 'Fair and transparent pricing with no hidden fees. Top-quality repairs without breaking the bank.',
        iconBg: 'bg-yellow-500/15',
        iconColor: 'text-yellow-400',
    },
    {
        icon: <Wrench className="w-6 h-6" />,
        title: 'Expert Technicians',
        desc: 'Our certified technicians have years of experience repairing all major brands and device types.',
        iconBg: 'bg-sky-500/15',
        iconColor: 'text-sky-400',
    },
    {
        icon: <ThumbsUp className="w-6 h-6" />,
        title: 'Free Diagnostics',
        desc: "Not sure what's wrong with your device? We provide free diagnostics to identify the issue at no charge.",
        iconBg: 'bg-purple-500/15',
        iconColor: 'text-purple-400',
    },
    {
        icon: <Star className="w-6 h-6" />,
        title: 'Best Quality Parts Only',
        desc: 'We use only high-quality, best quality parts in all repairs to ensure the best performance and longevity.',
        iconBg: 'bg-[#EC4421]/15',
        iconColor: 'text-[#EC4421]',
    },
]

const WhyUsSection = () => {
    return (
        <section className="py-20 bg-gray-950">
            <div className="container flex flex-col gap-12">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                        <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Why Choose Us</span>
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                    </div>
                    <h2 className="md:text-5xl text-3xl font-bold tracking-tight text-white">
                        The PlusProtech Difference
                    </h2>
                    <p className="text-sm font-light tracking-tight max-w-lg text-gray-400 leading-relaxed">
                        We go above and beyond to make sure your repair experience is smooth, fast, and completely worry-free.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((feature, i) => (
                        <div
                            key={i}
                            className="group bg-gray-900 border border-gray-800 hover:border-[#EC4421]/40 rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 hover:bg-gray-800/80"
                        >
                            <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center ${feature.iconColor}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-base font-semibold tracking-tight text-white">{feature.title}</h3>
                            <p className="text-sm font-light tracking-tight text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyUsSection
