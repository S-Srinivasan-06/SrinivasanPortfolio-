import { motion } from 'framer-motion'

const animOptions = {
  initial: { scaleX: 1, originX: 0 },
  animate: { 
    scaleX: 0, 
    originX: 1, 
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] }
  },
}

const animOptionsBlue = {
  initial: { scaleX: 1, originX: 0 },
  animate: { 
    scaleX: 0, 
    originX: 1, 
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.08 }
  },
}

export default function PageTransition({ children }) {
  return (
    <>
      {children}
      
      {/* Red Layer — reveals page by animating scaleX from 1 to 0 */}
      <motion.div
        className="fixed inset-0 z-[99999] bg-[var(--color-marble-red)] origin-right pointer-events-none"
        variants={animOptions}
        initial="initial"
        animate="animate"
      />

      {/* Blue Layer — slightly delayed reveal */}
      <motion.div
        className="fixed inset-0 z-[99998] bg-[var(--color-cobalt-mid)] origin-right pointer-events-none"
        variants={animOptionsBlue}
        initial="initial"
        animate="animate"
      />
    </>
  )
}
