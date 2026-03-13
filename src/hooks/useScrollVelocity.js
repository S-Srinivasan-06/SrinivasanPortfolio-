import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useScrollVelocity(triggerRef, { start = 'top top', end = 'bottom bottom' } = {}) {
  const [velocity, setVelocity] = useState(0)
  const [progress, setProgress] = useState(0)
  const lastScroll = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    if (!triggerRef?.current) return

    const st = ScrollTrigger.create({
      trigger: triggerRef.current,
      start,
      end,
      scrub: true,
      onUpdate: (self) => {
        const currentTime = Date.now()
        const dt = (currentTime - lastTime.current) / 1000
        const scrollDelta = Math.abs(self.scroll() - lastScroll.current)

        const rawVelocity = dt > 0 ? scrollDelta / dt : 0
        // Normalize velocity to 0-1 range (roughly 0-3000px/s mapped)
        const normalizedVelocity = Math.min(rawVelocity / 3000, 1)

        setVelocity(normalizedVelocity)
        setProgress(self.progress)

        lastScroll.current = self.scroll()
        lastTime.current = currentTime
      },
    })

    return () => st.kill()
  }, [triggerRef, start, end])

  return { velocity, progress }
}
