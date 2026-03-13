import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FadeUp, BlurText } from '../components/AnimatedText'
import { SiGithub, SiReact, SiSpringboot, SiPostgresql, SiDocker } from 'react-icons/si'
import { FiMail } from 'react-icons/fi'
import { FaLinkedin } from 'react-icons/fa'

gsap.registerPlugin(ScrollTrigger)

const socialLinks = [
  { label: 'Email', value: 'srinivasansubr...', href: 'mailto:srinivasansubr2006@gmail.com', Icon: FiMail },
  { label: 'LinkedIn', value: 'Srinivasan', href: 'https://www.linkedin.com/in/s-srinivasan-a69006315', Icon: FaLinkedin },
  { label: 'GitHub', value: 'S-Srinivasan-06', href: 'https://github.com/S-Srinivasan-06', Icon: SiGithub },
]

export default function AboutSection() {
  const statsRef = useRef(null)

  useEffect(() => {
    if (!statsRef.current) return
    const counters = statsRef.current.querySelectorAll('.gsap-counter')

    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'))
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            ease: 'power3.out',
            snap: { innerHTML: 1 },
            onUpdate: function () {
              counter.innerHTML = Math.round(this.targets()[0].innerHTML) + '+'
            }
          })
        })
      }
    })
  }, [])

  return (
    <section id="about" className="relative w-full min-h-screen bg-[var(--color-black-deep)] py-32 px-8 overflow-hidden">

      {/* Background Noise / Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[var(--color-marble-crimson)] rounded-full blur-[150px] mix-blend-screen opacity-10 translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[var(--color-cobalt-deep)] rounded-full blur-[150px] mix-blend-screen opacity-10 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

        {/* Left Side: 60% Content */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-display font-display font-bold track-tit text-[var(--color-marble-red)] mb-8"
          >
            ABOUT ME
          </motion.h2>

          <FadeUp delay={0.2} className="text-body text-[var(--color-marble-white)] space-y-6 max-w-2xl leading-relaxed">
            <p>
              Hi, I'm Srinivasan — a Backend Engineer and Agentic AI Developer. I specialize in building scalable server-side systems with Java and Spring Boot, and intelligent agentic workflows powered by LLMs like Gemini and Ollama.
            </p>
            <p>
              My technical expertise bridges the gap between robust transactional systems and modern Generative AI. Whether it's crafting resilient REST APIs, orchestrating microservices, or wiring up LangChain workflows, I focus on systems that scale elegantly.
            </p>
            <p>
              When I'm not architecting APIs or training agents, I'm exploring the intersection of AI and developer tooling, constantly iterating on better ways to write, test, and deploy code.
            </p>
          </FadeUp>

          {/* Stats Row */}
          <div ref={statsRef} className="gap-6 mt-10 mb-1 border-y border-[var(--color-gray-dim)] py-6">


            {/* Social Links Row */}
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.label !== 'Email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="group flex items-center gap-3 px-6 py-3 rounded-full glass-panel transition-all duration-300 hover:border-[var(--color-cobalt-electric)] hover:glow-blue"
                >
                  <link.Icon className="w-5 h-5 text-[var(--color-marble-white)] group-hover:text-[var(--color-cobalt-electric)] transition-colors" />
                  <span className="text-sm font-medium tracking-wide">
                    {link.label}
                  </span>
                </motion.a>
              ))}

              {/* Download Resume (disabled) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 + socialLinks.length * 0.1 }}
                className="relative px-6 py-3 rounded-full glass-panel opacity-50 cursor-not-allowed border-[var(--color-gray-dim)] flex items-center gap-3 group"
              >
                <span className="text-sm font-medium tracking-wide">Resume</span>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-black-deep)] border border-[var(--color-gray-dim)] text-xs py-1 px-3 rounded whitespace-nowrap">
                  Coming soon
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Side: 40% Visual */}
        <div className="w-full lg:w-[40%] flex justify-center items-center relative aspect-square">
          {/* Abstract Geometric Frame */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-[70%] h-[70%] rounded-full relative z-10 overflow-hidden flex items-center justify-center p-1"
            style={{
              background: 'linear-gradient(135deg, var(--color-marble-red) 0%, var(--color-cobalt-electric) 100%)'
            }}
          >
            <div className="w-full h-full rounded-full bg-[var(--color-black-surface)] flex items-center justify-center relative inner-shadow overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
              <div className="text-center z-10">
                <div className="text-3xl font-mono text-[var(--color-gray-dim)]">{'</>'}</div>
              </div>
            </div>
          </motion.div>

          {/* Orbiting Tech Icons */}
          <div className="absolute inset-0 z-0 animate-[spin_30s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-gray-cool)] opacity-50 animate-[spin_30s_linear_infinite_reverse]">
              <SiReact size={32} />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-[var(--color-gray-cool)] opacity-50 animate-[spin_30s_linear_infinite_reverse]">
              <SiPostgresql size={32} />
            </div>
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 text-[var(--color-gray-cool)] opacity-50 animate-[spin_30s_linear_infinite_reverse]">
              <SiDocker size={32} />
            </div>
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-[var(--color-gray-cool)] opacity-50 animate-[spin_30s_linear_infinite_reverse]">
              <SiSpringboot size={32} />
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto mt-32 pt-8 border-t border-[var(--color-gray-dim)] flex flex-col md:flex-row items-center justify-between text-caption font-mono uppercase text-[var(--color-gray-cool)]">
        <p>© 2026 Srinivasan. All rights reserved.</p>
        <p className="mt-4 md:mt-0">
          Crafted with <span className="text-[var(--color-marble-red)]">♥</span> using React, GSAP, & Three.js
        </p>
      </div>

    </section>
  )
}
