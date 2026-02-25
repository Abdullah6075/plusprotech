import React from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { MapPin, Phone, Mail } from 'lucide-react'

import { Facebook, Instagram, Twitter } from 'lucide-react'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    icon: <Facebook className="w-5 h-5" aria-hidden="true" />,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/plusprotech_/',
    icon: <Instagram className="w-5 h-5" aria-hidden="true" />,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: <Twitter className="w-5 h-5" aria-hidden="true" />,
  },
]

const QUICK_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'FAQ', id: 'faq' },
]

// Add this handler inside the Footer component
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const Footer = () => {
  return (
    <footer className="container pt-16 text-gray-800 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo & Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logo}
                alt="PlusProtech"
                className="h-10 w-auto object-contain"
                loading="lazy"
                decoding="async"
                width="120"
                height="40"
              />
            </Link>
            <h3 className="text-xl font-medium tracking-tight text-gray-800 mb-2">
              PlusProtech
            </h3>
            <p className="text-sm font-light tracking-tight text-gray-600 max-w-md mb-6">
              Professional device repair services for smartphones, tablets, laptops, and computers. We bring your broken gadgets back to life with expert care and affordable pricing.
            </p>
            {/* <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-all duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-gray-800 uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm font-light tracking-tight text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-gray-800 uppercase mb-4">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-gray-500 mt-0.5" />
                <span className="text-sm font-light tracking-tight text-gray-600">
                  1823 7th Street<br />
                  Moline, Illinois
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-gray-500" />
                <a
                  href="tel:3097627500"
                  className="text-sm font-light tracking-tight text-gray-600 hover:text-gray-800 transition-colors"
                >
                  309-762-7500
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-gray-500" />
                <a
                  href="mailto:protech0786@gmail.com"
                  className="text-sm font-light tracking-tight text-gray-600 hover:text-gray-800 transition-colors"
                >
                  protech0786@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 mt-10 border-t border-gray-200">
          <p className="text-sm font-light tracking-tight text-gray-500 text-center">
            © {new Date().getFullYear()} PlusProtech. All rights reserved.
          </p>
        </div>
    </footer>
  )
}

export default Footer
