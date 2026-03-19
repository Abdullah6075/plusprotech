import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const CONTACT_ITEMS = [
    {
        icon: <MapPin className="w-5 h-5" />,
        label: 'Address',
        content: (
            <p className="text-sm text-gray-600 font-light mt-0.5 leading-relaxed">
                1823 7th St<br />
                Moline, IL 61265, USA
            </p>
        ),
        iconBg: 'bg-[#EC4421]/10',
        iconColor: 'text-[#EC4421]',
    },
    {
        icon: <Phone className="w-5 h-5" />,
        label: 'Phone',
        content: (
            <a href="tel:3097627500" className="text-sm text-gray-600 font-light mt-0.5 hover:text-[#EC4421] transition-colors block cursor-pointer">
                309-762-7500
            </a>
        ),
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
    {
        icon: <Mail className="w-5 h-5" />,
        label: 'Email',
        content: (
            <a href="mailto:info@plusprotech.com" className="text-sm text-gray-600 font-light mt-0.5 hover:text-[#EC4421] transition-colors block break-all cursor-pointer">
                info@plusprotech.com
            </a>
        ),
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
    {
        icon: <Clock className="w-5 h-5" />,
        label: 'Business Hours',
        content: (
            <p className="text-sm text-gray-600 font-light mt-0.5 leading-relaxed">
                Mon – Sat: 9:00 AM – 7:00 PM<br />
                Sunday: Closed
            </p>
        ),
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
    },
]

const MapSection = () => {
    return (
        <section id="map" className="py-20 bg-white">
            <div className="container flex flex-col gap-12">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                        <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Find Us</span>
                        <span className="w-6 h-0.5 bg-[#EC4421]" />
                    </div>
                    <h2 className="md:text-5xl text-3xl font-bold tracking-tight text-gray-900">
                        Visit Our Shop
                    </h2>
                    <p className="text-sm font-light tracking-tight max-w-lg text-gray-600 leading-relaxed">
                        Come see us at our Moline, Illinois location. We&apos;re conveniently located and ready to help with any device repair.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                    {/* Contact card */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-7 flex flex-col gap-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-0.5 bg-[#EC4421]" />
                            <h3 className="text-lg font-bold tracking-tight text-gray-900">Contact Information</h3>
                        </div>
                        <div className="flex flex-col gap-5">
                            {CONTACT_ITEMS.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center ${item.iconColor} shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 tracking-tight">{item.label}</p>
                                        {item.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a
                            href="https://maps.google.com/?q=Plus+Pro+Tech,+1823+7th+St,+Moline,+IL+61265"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto bg-[#EC4421] hover:bg-[#c93519] text-white text-sm font-semibold px-6 py-3 rounded-full text-center transition-all shadow-lg shadow-[#EC4421]/20 hover:scale-105 cursor-pointer"
                        >
                            Get Directions
                        </a>
                    </div>

                    {/* Google Map */}
                    <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-md border border-gray-100">
                        <iframe
                            src="https://maps.google.com/maps?q=Plus+Pro+Tech,+1823+7th+St,+Moline,+IL+61265,+USA&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="420"
                            style={{ border: 0, display: 'block', minHeight: '320px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Plus Pro Tech — 1823 7th St, Moline, IL 61265"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default MapSection
