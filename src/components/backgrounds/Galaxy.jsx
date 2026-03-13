import { useEffect, useRef } from 'react'

export default function Galaxy({
  density = 2.2,
  glowIntensity = 0.4,
  saturation = 0.1,
  hueShift = 170,
  twinkleIntensity = 0.7,
  speed = 0.6,
  starSpeed = 0.3,
  className = '',
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let stars = []
    let width, height

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      initStars()
    }

    const initStars = () => {
      const count = Math.floor(width * height * density / 10000)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 2,
        drift: (Math.random() - 0.5) * starSpeed,
        hue: hueShift + (Math.random() - 0.5) * 40,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const render = (t) => {
      const time = t / 1000 * speed
      ctx.clearRect(0, 0, width, height)

      // Dark background with subtle gradient
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.7
      )
      grad.addColorStop(0, `hsla(${hueShift}, ${saturation * 100}%, 8%, 1)`)
      grad.addColorStop(1, 'hsla(0, 0%, 1%, 1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Draw stars
      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase)
        const alpha = 0.3 + (0.5 + twinkle * 0.5) * twinkleIntensity * 0.7
        const size = star.size * (0.8 + twinkle * 0.2)

        // Move stars
        star.y += star.drift * 0.5
        star.x += star.drift * 0.3
        if (star.y > height + 5) star.y = -5
        if (star.y < -5) star.y = height + 5
        if (star.x > width + 5) star.x = -5
        if (star.x < -5) star.x = width + 5

        // Glow
        if (glowIntensity > 0 && size > 1) {
          const glowGrad = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, size * 4 * glowIntensity
          )
          glowGrad.addColorStop(0, `hsla(${star.hue}, ${saturation * 100 + 30}%, 70%, ${alpha * 0.3})`)
          glowGrad.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(star.x, star.y, size * 4 * glowIntensity, 0, Math.PI * 2)
          ctx.fill()
        }

        // Star core
        ctx.fillStyle = `hsla(${star.hue}, ${saturation * 100 + 20}%, 85%, ${alpha})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(render)
    }

    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [density, glowIntensity, saturation, hueShift, twinkleIntensity, speed, starSpeed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}
