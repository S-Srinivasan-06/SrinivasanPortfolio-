import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ─── Letter Stagger Reveal ─── */
export function StaggerText({ text, className = '', delay = 0 }) {
  const letters = text.split('')
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

/* ─── Glowing Pulse Text ─── */
export function GlowText({ text, className = '' }) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{
        textShadow: [
          '0 0 20px rgba(209,31,106,0.4), 0 0 60px rgba(44,48,233,0.2)',
          '0 0 40px rgba(209,31,106,0.6), 0 0 80px rgba(44,48,233,0.4)',
          '0 0 20px rgba(209,31,106,0.4), 0 0 60px rgba(44,48,233,0.2)',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {text}
    </motion.span>
  )
}

/* ─── Typewriter Effect ─── */
export function TypewriterText({ texts, className = '' }) {
  const ref = useRef(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let charIndex = 0
    let deleting = false
    let timeout

    const type = () => {
      const current = texts[indexRef.current]
      if (!deleting) {
        el.textContent = current.slice(0, charIndex + 1)
        charIndex++
        if (charIndex === current.length) {
          deleting = true
          timeout = setTimeout(type, 2000)
          return
        }
      } else {
        el.textContent = current.slice(0, charIndex - 1)
        charIndex--
        if (charIndex === 0) {
          deleting = false
          indexRef.current = (indexRef.current + 1) % texts.length
        }
      }
      timeout = setTimeout(type, deleting ? 40 : 80)
    }

    timeout = setTimeout(type, 1000)
    return () => clearTimeout(timeout)
  }, [texts])

  return (
    <span className={className}>
      <span ref={ref} />
      <motion.span
        className="inline-block w-[2px] h-[1em] bg-crimson ml-1 align-middle"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  )
}

/* ─── Fade Up Block ─── */
export function FadeUp({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Blur Hover Text ─── */
export function BlurText({ text, className = '' }) {
  return (
    <motion.span
      initial={{ filter: 'blur(8px)', opacity: 0.6 }}
      whileHover={{ filter: 'blur(0px)', opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`inline-block transition-all cursor-default ${className}`}
    >
      {text}
    </motion.span>
  )
}
