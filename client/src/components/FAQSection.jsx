import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'How long does it take to repair my device?',
    answer: "Repair time depends on the type of service and device complexity. Most screen repairs and common fixes are completed within 30 minutes to a few hours. We'll provide an estimated timeframe when you schedule your appointment.",
  },
  {
    id: 2,
    question: 'Do you offer a warranty on repairs?',
    answer: "Yes, we offer a warranty on all our repairs. The warranty period varies by service type — typically 30 to 90 days. We'll provide full warranty details when your repair is completed.",
  },
  {
    id: 3,
    question: 'What types of devices do you repair?',
    answer: 'We repair smartphones, tablets, laptops, and desktop computers. This includes screen replacements, battery replacements, software issues, water damage, and more. Browse our services to see the full range of repairs we offer.',
  },
  {
    id: 4,
    question: 'Do I need to schedule an appointment?',
    answer: 'We recommend scheduling an appointment to ensure we can serve you promptly. Walk-ins are welcome based on availability, but appointments help us prepare and reduce your wait time.',
  },
]

const FAQItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-800 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="w-full flex items-center justify-between py-6 text-left hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span className="md:text-xl text-sm font-medium tracking-tight text-white pr-4">
          {item.question}
        </span>
        <span className="shrink-0 transition-transform duration-200">
          {isOpen ? (
            <Minus className="h-5 w-5 text-[#EC4421]" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-10">
              <p className="md:text-sm text-xs font-light tracking-tight text-gray-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FAQSection = () => {
  const [openId, setOpenId] = useState(1)

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="faq" className="py-20 bg-gray-950">
      <div className="container">
        <div className="flex flex-col lg:grid grid-cols-12 gap-12 lg:gap-16">
          {/* Left */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-4 h-0.5 bg-[#EC4421]" />
                <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">FAQ</span>
              </div>
              <h2 className="md:text-5xl text-3xl tracking-tight text-white font-bold leading-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="md:text-lg text-base tracking-tight text-white font-semibold">
                Still have a question?
              </h3>
              <p className="md:text-sm text-xs font-light tracking-tight text-gray-400 max-w-sm leading-relaxed">
                Don&apos;t worry, we&apos;re here for a free consultation. Just click the button below to get in touch.
              </p>
              <a
                href="mailto:protech0786@gmail.com"
                className="inline-flex items-center justify-center bg-[#EC4421] hover:bg-[#c93519] text-white px-6 py-3 rounded-full tracking-tight md:text-sm text-xs font-semibold transition-all w-fit shadow-lg shadow-[#EC4421]/25 hover:scale-105 mt-1 cursor-pointer"
              >
                CONTACT US
              </a>
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="lg:col-span-8">
            <div className="border-t border-gray-800">
              {FAQ_ITEMS.map((item) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
