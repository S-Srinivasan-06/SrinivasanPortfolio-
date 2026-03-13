import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TypewriterText } from '../components/AnimatedText'
import Balatro from '../components/reactbits/Balatro/Balatro'
import FaultyTerminal from '../components/reactbits/FaultyTerminal/FaultyTerminal'

const roles = [
  'Backend Engineer',
  'Agentic AI Developer',
  'Spring Boot Architect',
  'AI Systems Builder',
]

const CHARS = '$%&*#@!?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const ScrambleText = ({ text, isGlitching }) => {
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    if (!isGlitching) {
      setDisplayText(text)
      return
    }

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char) =>
            char === ' '
              ? char
              : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join('')
      )
    }, 50)

    return () => clearInterval(interval)
  }, [isGlitching, text])

  return <span>{displayText}</span>
}

export default function HeroSection() {
  const containerRef = useRef(null)
  const [isGlitching, setIsGlitching] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  /* ---------------- SCROLL INDICATOR ---------------- */
  // Fades out very quickly right as the user starts scrolling
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  /* ---------------- PHASE 1 : THE RUNE SEQUENCE ---------------- */
  // Slower, more atmospheric rune entry
  const runeYellowScale = useTransform(scrollYProgress, [0, 0.4], [15, 1])
  const runeYellowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.45, 0.55], [0, 1, 1, 0])

  const runePurpleScale = useTransform(scrollYProgress, [0.15, 0.5], [0.6, 2.8])
  const runePurpleOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.5, 0.6], [0, 1, 1, 0])

  const runeCoreOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.6], [0, 1, 0])

  /* ---------------- PHASE 2 : ASYMMETRICAL GLOWING VEIL & CURTAIN SPLIT ---------------- */

  // Smoother transition for the glows
  const leftVeilGlow = useTransform(
    scrollYProgress,
    [0.4, 0.6, 0.75],
    [
      'drop-shadow(0px 0 0px rgba(255,255,255,0)) drop-shadow(0px 0 0px rgba(123,44,191,0))',
      'drop-shadow(2px 0 10px rgba(255,255,255,0.4)) drop-shadow(10px 0 30px rgba(123,44,191,0.5))',
      'drop-shadow(4px 0 15px rgba(255,255,255,1)) drop-shadow(40px 0 80px rgba(123,44,191,1))'
    ]
  )

  const rightVeilGlow = useTransform(
    scrollYProgress,
    [0.4, 0.6, 0.75],
    [
      'drop-shadow(0px 0 0px rgba(255,255,255,0)) drop-shadow(0px 0 0px rgba(255,183,3,0))',
      'drop-shadow(-2px 0 10px rgba(255,255,255,0.4)) drop-shadow(-10px 0 30px rgba(255,183,3,0.5))',
      'drop-shadow(-4px 0 15px rgba(255,255,255,1)) drop-shadow(-40px 0 80px rgba(255,183,3,1))'
    ]
  )

  // Curtains start sliding later but with a longer duration for grace
  const leftCurtainX = useTransform(scrollYProgress, [0.7, 0.98], ['0vw', '-100vw'])
  const rightCurtainX = useTransform(scrollYProgress, [0.7, 0.98], ['0vw', '100vw'])

  /* ---------------- PHASE 3 : TEXT REVEAL ---------------- */
  // Name reveals as the curtains reach 75% open state
  const textOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1])
  const nameScale = useTransform(scrollYProgress, [0.8, 0.95], [0.9, 1])
  const nameY = useTransform(scrollYProgress, [0.8, 0.95], [40, 0])

  const curtainTerminalProps = {
    scale: 2.4,
    digitSize: 1.5,
    scanlineIntensity: 0.15,
    glitchAmount: 1.5,
    flickerAmount: 0.1,
    noiseAmp: 0.8,
    chromaticAberration: 0.4,
    dither: 0.3,
    curvature: 0.15,
    tint: "#040b08",
    brightness: 0.9,
    mouseReact: false
  }

  const balatroBase = "#0a0014"
  const balatroAccent1 = "#7b2cbf"
  const balatroAccent2 = "#ffb703"

  return (
    <section id="home" ref={containerRef} className="relative w-full h-[400vh] bg-[#020202]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#020202]">

        {/* MAIN HERO CONTENT */}
        <div className="absolute inset-0 z-10 w-full h-full overflow-hidden pointer-events-auto">

          <div className="absolute inset-0 opacity-90 transition-opacity duration-700 pointer-events-none">
            {isGlitching ? (
              <FaultyTerminal
                scale={2.4}
                digitSize={1.7}
                scanlineIntensity={0.05}
                glitchAmount={4}
                flickerAmount={0.2}
                noiseAmp={1.5}
                chromaticAberration={0.3}
                dither={0.4}
                curvature={0.05}
                tint="#ffffff"
                mouseStrength={0.55}
                brightness={1.2}
                mouseReact={true}
              />
            ) : (
              <Balatro
                spinRotation={-1}
                spinSpeed={2.5}
                color1={balatroBase}
                color2={balatroAccent1}
                color3={balatroAccent2}
                contrast={2.8}
                lighting={0.3}
                spinAmount={0.25}
                pixelFilter={2000}
                mouseInteraction={false}
              />
            )}
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none opacity-80" />

          <div className="relative z-20 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24">

            {/* Minimalist Name */}
            <div
              className="flex flex-col items-start mb-6 cursor-crosshair group py-4 relative"
              onMouseEnter={() => setIsGlitching(true)}
              onMouseLeave={() => setIsGlitching(false)}
            >
              <h1
                className={`text-[3.5rem] md:text-[5rem] lg:text-[7.5rem] font-display font-bold tracking-[0.15em] leading-[0.9] transition-all duration-300 ${isGlitching ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'drop-shadow-lg'
                  }`}
              >
                <motion.div
                  style={{ opacity: textOpacity, scale: nameScale, y: nameY }}
                  className="text-white"
                >
                  <ScrambleText text="SRINIVASAN" isGlitching={isGlitching} />
                </motion.div>
              </h1>
            </div>

            {/* Roles & Info */}
            <div className={`text-lg md:text-xl font-mono font-medium tracking-tight mb-8 flex items-center gap-4 transition-colors duration-300 ${isGlitching ? 'text-white' : 'text-gray-300'}`}>
              <span className={`w-12 h-[2px] transition-colors duration-300 ${isGlitching ? 'bg-white shadow-[0_0_8px_white]' : 'bg-[#7b2cbf]'}`} />
              <div className={isGlitching ? 'text-white' : 'text-gray-200'}>
                <TypewriterText texts={roles} typingSpeed={50} deletingSpeed={25} delayBetweenTexts={2500} />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`relative group px-12 md:px-14 py-4 md:py-5 font-display font-bold uppercase tracking-[0.2em] text-xs md:text-sm overflow-hidden text-white border border-white/20 hover:border-[#ffb703] transition-all duration-300 bg-white/5 backdrop-blur-sm`}
              >
                <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-[#7b2cbf] to-[#5a189a] transition-transform duration-300 ease-out group-hover:translate-y-0" />
                <span className="relative z-10">LET'S CONNECT</span>
              </a>
            </div>
          </div>
        </div>

        {/* ---------------- SCROLL INDICATOR ---------------- */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-40 pointer-events-none"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-white/60 font-mono text-xs md:text-sm uppercase tracking-[0.3em] animate-pulse">
            Scroll
          </span>
          <div className="w-[1px] h-12 md:h-16 bg-gradient-to-b from-white/60 to-transparent animate-[bounce_2s_infinite]" />
        </motion.div>

        {/* ---------------- THE RUNE OVERLAY ---------------- */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Golden Yellow Ring */}
          <motion.div
            className="absolute w-64 h-64 rounded-full border-[3px] border-[#ffb703] 
                       shadow-[0_0_60px_20px_rgba(255,183,3,0.5),0_0_150px_60px_rgba(255,183,3,0.3),0_0_300px_100px_rgba(255,183,3,0.1)]"
            style={{ scale: runeYellowScale, opacity: runeYellowOpacity }}
          />
          {/* Purple Ring (Added multi-layered glow) */}
          <motion.div
            className="absolute w-48 h-48 rounded-full border-[6px] border-[#7b2cbf] 
                       shadow-[0_0_40px_10px_rgba(123,44,191,0.6),0_0_100px_30px_rgba(123,44,191,0.3)]"
            style={{ scale: runePurpleScale, opacity: runePurpleOpacity }}
          />
          {/* Balatro Base Core */}
          <motion.div
            className="absolute w-32 h-32 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]"
            style={{ backgroundColor: balatroBase, opacity: runeCoreOpacity }}
          />
        </div>

        {/* ---------------- AAA CURTAINS ---------------- */}

        {/* LEFT CURTAIN */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ x: leftCurtainX, filter: leftVeilGlow }}
        >
          <div
            className="absolute inset-0 w-full h-full bg-[#030705]"
            style={{ clipPath: 'polygon(-50vw 0%, calc(50vw + 28.8675vh + 1px) 0%, calc(50vw - 28.8675vh + 1px) 100%, -50vw 100%)' }}
          >
            <FaultyTerminal {...curtainTerminalProps} />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/40" />
          </div>
        </motion.div>

        {/* RIGHT CURTAIN */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ x: rightCurtainX, filter: rightVeilGlow }}
        >
          <div
            className="absolute inset-0 w-full h-full bg-[#030705]"
            style={{ clipPath: 'polygon(calc(50vw + 28.8675vh) 0%, 150vw 0%, 150vw 100%, calc(50vw - 28.8675vh) 100%)' }}
          >
            <FaultyTerminal {...curtainTerminalProps} />
            <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-black/40" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}