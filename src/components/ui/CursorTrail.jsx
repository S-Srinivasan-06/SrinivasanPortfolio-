import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CursorTrail() {
  const innerRef = useRef(null)
  const outerRef = useRef(null)

  useEffect(() => {
    // Check if device is touch, we don't want custom cursor on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return

    const inner = innerRef.current
    const outer = outerRef.current
    if (!inner || !outer) return

    // Setup GSAP quickTo for performance
    const xToInner = gsap.quickTo(inner, "x", { duration: 0.1, ease: "power3" })
    const yToInner = gsap.quickTo(inner, "y", { duration: 0.1, ease: "power3" })
    
    const xToOuter = gsap.quickTo(outer, "x", { duration: 0.6, ease: "power4.out" })
    const yToOuter = gsap.quickTo(outer, "y", { duration: 0.6, ease: "power4.out" })

    const handleMouseMove = (e) => {
      xToInner(e.clientX)
      yToInner(e.clientY)
      xToOuter(e.clientX)
      yToOuter(e.clientY)
    }

    const handleMouseEnter = () => {
      gsap.to(inner, { scale: 1, opacity: 1, duration: 0.3 })
      gsap.to(outer, { scale: 1, opacity: 1, duration: 0.4 })
    }

    const handleMouseLeave = () => {
      gsap.to(inner, { scale: 0, opacity: 0, duration: 0.3 })
      gsap.to(outer, { scale: 0, opacity: 0, duration: 0.4 })
    }

    // Interactive Hover States
    const interactiveElements = document.querySelectorAll('a, button, input-[type="submit"], [role="button"]')
    
    const handleInteractEnter = () => {
      gsap.to(outer, { 
        width: 60, 
        height: 60, 
        backgroundColor: 'rgba(160, 21, 62, 0.15)', // marble red tint
        borderColor: 'rgba(160, 21, 62, 0.5)',
        duration: 0.3, 
        ease: "power2.out" 
      })
      gsap.to(inner, { scale: 0, duration: 0.2 })
    }

    const handleInteractLeave = () => {
      gsap.to(outer, { 
        width: 30, 
        height: 30, 
        backgroundColor: 'transparent',
        borderColor: 'rgba(232, 228, 220, 0.5)', // marble white tint
        duration: 0.3, 
        ease: "power2.out" 
      })
      gsap.to(inner, { scale: 1, duration: 0.2 })
    }

    // 3D Canvas Hover (Hide cursor)
    const canvases = document.querySelectorAll('canvas')
    const handleCanvasEnter = () => {
      gsap.to([inner, outer], { opacity: 0, scale: 0, duration: 0.3 })
    }
    const handleCanvasLeave = () => {
      gsap.to([inner, outer], { opacity: 1, scale: 1, duration: 0.3 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleInteractEnter)
      el.addEventListener('mouseleave', handleInteractLeave)
    })

    canvases.forEach(el => {
      el.addEventListener('mouseenter', handleCanvasEnter)
      el.addEventListener('mouseleave', handleCanvasLeave)
    })

    // Init position offscreen
    gsap.set(inner, { xPercent: -50, yPercent: -50 })
    gsap.set(outer, { xPercent: -50, yPercent: -50 })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleInteractEnter)
        el.removeEventListener('mouseleave', handleInteractLeave)
      })

      canvases.forEach(el => {
        el.removeEventListener('mouseenter', handleCanvasEnter)
        el.removeEventListener('mouseleave', handleCanvasLeave)
      })
    }
  }, [])

  return (
    <>
      <div 
        ref={innerRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[var(--color-marble-white)] pointer-events-none mix-blend-difference z-[10000]"
      />
      <div 
        ref={outerRef}
        className="fixed top-0 left-0 w-[30px] h-[30px] rounded-full border border-[var(--color-marble-white)] opacity-50 pointer-events-none mix-blend-difference z-[9999]"
      />
    </>
  )
}
