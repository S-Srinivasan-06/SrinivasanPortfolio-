import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Tech', href: '#skills' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle scroll state for border color transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) setScrolled(true)
      else setScrolled(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle active section tracking
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Map section IDs to nav names
            const id = entry.target.getAttribute('id')
            if (id === 'home') setActiveSection('Home')
            else if (id === 'about') setActiveSection('About')
            else if (id === 'skills') setActiveSection('Tech')
          }
        })
      },
      { threshold: 0.3 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => sections.forEach((section) => observer.unobserve(section))
  }, [])

  const handleScrollTo = (e, href) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      // Use Lenis via window.scrollTo (Lenis intercepts this if running)
      // or standard smooth scroll behavior
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        className="fixed top-6 left-1/2 z-[9999] rounded-full backdrop-blur-xl transition-colors duration-700 ease-out"
        style={{
          background: 'rgba(5, 5, 10, 0.65)',
          border: scrolled 
            ? '1px solid rgba(28, 124, 189, 0.3)' // blue pulse transition
            : '1px solid rgba(220, 20, 60, 0.2)' // marble red micro-border
        }}
      >
        <div className="flex items-center justify-between px-6 py-3 min-w-[320px] md:min-w-[480px]">
          {/* Logo Monogram */}
          <a
            href="#home"
            onClick={(e) => handleScrollTo(e, '#home')}
            className="font-mono text-xl font-bold tracking-tighter"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-marble-red)] to-[var(--color-cobalt-electric)]">
              SS
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.name
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="relative text-sm font-medium transition-all duration-300 hover:tracking-wide group"
                  style={{ color: isActive ? 'var(--color-marble-white)' : 'var(--color-gray-cool)' }}
                >
                  {link.name}
                  <span 
                    className="absolute -bottom-1 left-0 h-[2px] transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--color-marble-red)',
                      width: isActive ? '100%' : '0%',
                      opacity: isActive ? 1 : 0
                    }}
                  />
                </a>
              )
            })}
          </div>

          {/* Mobile Hamburger Touch Target */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 focus:outline-none z-50 text-[var(--color-marble-white)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <motion.span 
              animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-current transition-transform origin-center"
            />
            <motion.span 
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-current transition-opacity"
            />
            <motion.span 
              animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-current transition-transform origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[9990] bg-[var(--color-black-deep)] flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-4xl font-display font-medium tracking-wide text-[var(--color-marble-white)] hover:text-[var(--color-marble-red)] transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
