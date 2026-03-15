import React from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { MapPin, Phone, Mail } from 'lucide-react'
import { Instagram } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Find Us', id: 'map' },
  { label: 'FAQ', id: 'faq' },
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="container pt-16 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo & Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-5 cursor-pointer">
              <img
                src={logo}
                alt="PlusProtech"
                className="h-12 w-auto object-contain"
                loading="lazy"
                decoding="async"
                width="120"
                height="48"
              />
            </Link>
            <p className="text-sm font-light tracking-tight text-gray-400 max-w-md mb-6 leading-relaxed">
              Professional device repair services for smartphones, tablets, laptops, and computers. We bring your broken gadgets back to life with expert care and affordable pricing.
            </p>
            <a
              href="https://www.instagram.com/plusprotech_/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#EC4421] hover:text-white hover:border-[#EC4421] transition-all duration-200 inline-flex cursor-pointer"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-4 h-0.5 bg-[#EC4421]" />
              <h4 className="text-xs font-semibold tracking-[0.15em] text-gray-300 uppercase">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm font-light tracking-tight text-gray-400 hover:text-[#EC4421] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-4 h-0.5 bg-[#EC4421]" />
              <h4 className="text-xs font-semibold tracking-[0.15em] text-gray-300 uppercase">
                Contact Us
              </h4>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#EC4421] mt-0.5" />
                <span className="text-sm font-light tracking-tight text-gray-400">
                  1823 7th St<br />
                  Moline, IL 61265
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#EC4421]" />
                <a
                  href="tel:3097627500"
                  className="text-sm font-light tracking-tight text-gray-400 hover:text-[#EC4421] transition-colors cursor-pointer"
                >
                  309-762-7500
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#EC4421]" />
                <a
                  href="mailto:info@plusprotech.com"
                  className="text-sm font-light tracking-tight text-gray-400 hover:text-[#EC4421] transition-colors cursor-pointer"
                >
                  info@plusprotech.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 mt-12 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs font-light tracking-tight text-gray-500">
            © {new Date().getFullYear()} PlusProtech. All rights reserved.
          </p>
          <p className="text-xs font-light tracking-tight text-gray-600">
            1823 7th St, Moline, IL 61265
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
