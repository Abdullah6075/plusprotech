import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'How long does it take to repair my device?',
    answer: 'Repair time depends on the type of service and device complexity. Most screen repairs and common fixes are completed within 30 minutes to a few hours. We\'ll provide an estimated timeframe when you schedule your appointment.',
  },
  {
    id: 2,
    question: 'Do you offer a warranty on repairs?',
    answer: 'Yes, we offer a warranty on all our repairs. The warranty period varies by service type—typically 30 to 90 days. We\'ll provide full warranty details when your repair is completed.',
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
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="w-full flex items-center justify-between py-8 text-left hover:opacity-80 transition-opacity"
      >
        <span className="md:text-2xl text-sm font-light tracking-tight text-gray-800 pr-4">
          {item.question}
        </span>
        <span className="shrink-0 transition-transform duration-200">
          {isOpen ? (
            <Minus className="h-5 w-5 text-gray-700" />
          ) : (
            <Plus className="h-5 w-5 text-gray-700" />
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
            <div className="pb-4 pr-10">
              <p className="md:text-md text-sm font-light tracking-tight text-gray-600">
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
    <section id="faq" className="container pb-20">
      <div className="flex flex-col md:grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Heading & CTA */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between">
          <h2 className="md:text-5xl text-3xl tracking-tight text-gray-800 font-medium mb-4 flex items-center gap-4">
            FAQ
          <div className="w-full h-0.5 bg-gray-200 " />
          </h2>
          <div className="">
          <h3 className="md:text-xl text-sm tracking-tight text-gray-800 font-medium">
            Still have a question?
          </h3>
          <p className="md:text-sm text-xs font-light tracking-tight text-gray-700 mb-4 max-w-sm">
            Don&apos;t worry, we&apos;re here for free consultation. Just click the button below to get in touch.
          </p>
          <a
            href="mailto:protech0786@gmail.com"
            className="inline-flex items-center justify-center bg-gray-800 text-white px-6 py-3 rounded-full tracking-tight md:text-sm text-xs font-medium hover:bg-gray-700 transition-colors w-fit"
          >
            CONTACT US
          </a>
          </div>
        </div>

        {/* Right: FAQ Accordion */}
        <div className="lg:col-span-8 flex flex-col justify-center items-center">
          <div className="border-t border-gray-200">
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
    </section>
  )
}

export default FAQSection
