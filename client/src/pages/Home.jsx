import React, { useEffect } from 'react'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import ServiceSection from '@/components/ServiceSection'
import ProcessSection from '@/components/ProcessSection'
import ReviewsSection from '@/components/ReviewsSection'
import FAQSection from '@/components/FAQSection'
import Footer from '@/components/Footer'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'

const Home = () => {

  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [hash])


  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete window.lenis;
    };
  }, []);
  return (
    <div className="w-full">
      <HeroSection />
      <div id="about"><AboutSection /></div>
      <div id="services"><ServiceSection /></div>
      <ProcessSection />
      <div id="reviews"><ReviewsSection /></div>
      <div id="faq"><FAQSection /></div>
      <Footer />
    </div>
  )
}

export default Home
