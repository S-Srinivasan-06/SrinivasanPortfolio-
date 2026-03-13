import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import CursorTrail from './components/ui/CursorTrail'
import HeroSection from './sections/HeroSection'
import TechStack from './sections/TechStack'
// Removed ProjectsPlaceholder import
import AboutSection from './sections/AboutSection'

gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    // Refresh ScrollTrigger after initial render
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        <div className="relative min-h-screen bg-[var(--color-black-deep)] text-[var(--color-marble-white)] font-body selection:bg-[var(--color-marble-red)] selection:text-white">
          <CursorTrail />
          <Navbar />
          <main>
            <HeroSection />
            <TechStack />
            <AboutSection />
          </main>
        </div>
      </PageTransition>
    </AnimatePresence>
  )
}

export default App
