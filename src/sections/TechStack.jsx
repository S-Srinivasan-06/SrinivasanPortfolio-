import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Deterministic pseudo-random ───
function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

// ─── Tech Stack Data ───
const categories = [
  {
    cat: 'Backend Core', color: '#A0153E',
    items: [
      { name: 'Java', pos: [-2, 1, 0] },
      { name: 'Spring Boot', pos: [-2.5, 2, -1] },
      { name: 'Spring Framework', pos: [-1.5, 2.5, -0.5] },
      { name: 'Hibernate ORM', pos: [-3, 1.5, -2] },
      { name: 'REST API', pos: [-1.8, 0, 1] },
      { name: 'Maven', pos: [-3.5, 0.5, -1] },
      { name: 'Gradle', pos: [-2.2, -0.5, 0] },
    ],
  },
  {
    cat: 'DevOps & Cloud', color: '#0C61AD',
    items: [
      { name: 'AWS', pos: [2, 1.5, -1] },
      { name: 'Docker', pos: [2.5, 0.5, 0] },
      { name: 'Git', pos: [3, 2, -2] },
      { name: 'GitHub', pos: [1.5, 2.5, -0.5] },
      { name: 'CI/CD', pos: [3.5, 1, -1] },
    ],
  },
  {
    cat: 'Databases', color: '#7B2FBE',
    items: [
      { name: 'PostgreSQL', pos: [0, -2, 1] },
      { name: 'SQL*Plus', pos: [1, -2.5, 0] },
      { name: 'Database Design', pos: [-1, -2.2, 0.5] },
    ],
  },
  {
    cat: 'API Dev & Testing', color: '#D11F6A',
    items: [
      { name: 'Postman', pos: [-2, -2, -1] },
      { name: 'Insomnia', pos: [-2.5, -1.5, -2] },
      { name: 'OpenAPI/Swagger', pos: [-1.5, -1, -1.5] },
    ],
  },
  {
    cat: 'Agentic AI', color: '#1C7CBD',
    items: [
      { name: 'Agentic AI Systems', pos: [0, 2.5, 1] },
      { name: 'Gemini API', pos: [0.5, 3.5, 0] },
      { name: 'Ollama', pos: [-0.5, 3, 0.5] },
      { name: 'LLM Integration', pos: [1, 2.8, 1.5] },
      { name: 'Prompt Engineering', pos: [-1, 3.2, 1.2] },
    ],
  },
  {
    cat: 'Frontend', color: '#ECCEFD',
    items: [
      { name: 'React', pos: [2, -1, 1] },
      { name: 'JavaScript', pos: [2.5, -2, 0.5] },
      { name: 'GSAP', pos: [3, -1.5, 1.5] },
      { name: 'Tailwind CSS', pos: [1.5, -1.5, 2] },
      { name: 'Three.js', pos: [3.5, -0.5, 1] },
      { name: 'Vite', pos: [2.2, -0.5, 2.5] },
      { name: 'Framer Motion', pos: [2.8, -2.5, 1] },
    ],
  },
  {
    cat: 'IDEs & Tools', color: '#4A4A5A',
    items: [
      { name: 'IntelliJ IDEA', pos: [0, 0, -3] },
      { name: 'VS Code', pos: [1, 0.5, -2.5] },
      { name: 'Antigravity', pos: [-1, -0.5, -3] },
    ],
  },
]

// ─── Precomputed data ───
const categoryCentroids = categories.map((cat) => {
  const s = cat.items.reduce(
    (a, it) => [a[0] + it.pos[0], a[1] + it.pos[1], a[2] + it.pos[2]],
    [0, 0, 0]
  )
  const n = cat.items.length
  return new THREE.Vector3(s[0] / n, s[1] / n, s[2] / n)
})

// Camera Stops: 0 = Entry, 1-7 = Categories, 8 = Free Explore Map
const cameraStops = [
  { pos: new THREE.Vector3(0, 0, 8), target: new THREE.Vector3(0, 0.5, 0) },
  ...categoryCentroids.map((c, i) => {
    const maxDist = Math.max(
      ...categories[i].items.map((it) =>
        new THREE.Vector3(...it.pos).distanceTo(c)
      )
    )
    const zOff = Math.max(3, maxDist + 2)
    return { pos: new THREE.Vector3(c.x, c.y, c.z + zOff), target: c.clone() }
  }),
  { pos: new THREE.Vector3(0, 0, 8.5), target: new THREE.Vector3(0, 0.5, 0) }, // Final summary / Free Explore
]

const TOTAL_STOPS = cameraStops.length

// Deterministic tubes
const tubesData = (() => {
  const tubes = []
  let seed = 0
  categories.forEach((cat, catIdx) => {
    for (let i = 0; i < cat.items.length - 1; i++) {
      seed++
      tubes.push({
        start: cat.items[i].pos,
        end: cat.items[i + 1].pos,
        color: cat.color,
        seed,
      })
    }
    if (catIdx > 0) {
      seed++
      tubes.push({
        start: cat.items[0].pos,
        end: categories[0].items[0].pos,
        color: cat.color,
        seed,
      })
    }
  })
  return tubes
})()

// Shared geometries
const NODE_SPHERE = new THREE.SphereGeometry(0.09, 16, 16)
const NODE_GLOW = new THREE.SphereGeometry(0.16, 16, 16)
const _lerpVec = new THREE.Vector3()

// ─── CameraController ───
function CameraController({ scrollProgressRef }) {
  const { camera } = useThree()
  const tPos = useMemo(() => new THREE.Vector3(0, 0, 8), [])
  const tLook = useMemo(() => new THREE.Vector3(0, 0.5, 0), [])
  const cLook = useMemo(() => new THREE.Vector3(0, 0.5, 0), [])

  useFrame((_, delta) => {
    const p = scrollProgressRef.current
    const segs = TOTAL_STOPS - 1
    const raw = p * segs
    const idx = Math.min(segs - 1, Math.floor(raw))
    const t = raw - idx
    const st = t * t * (3 - 2 * t) // smoothstep

    tPos.lerpVectors(cameraStops[idx].pos, cameraStops[idx + 1].pos, st)
    tLook.lerpVectors(cameraStops[idx].target, cameraStops[idx + 1].target, st)

    const f = 1 - Math.pow(0.003, delta)
    camera.position.lerp(tPos, f)
    cLook.lerp(tLook, f)
    camera.lookAt(cLook)
  })

  return null
}

// ─── TechNode ───
function TechNode({
  name,
  pos,
  color,
  index,
  isActive,
  categoryId,
  onPointerOver,
  onPointerOut,
  dragActive,
}) {
  const groupRef = useRef()
  const matRef = useRef()
  const glowRef = useRef()

  // Make the base color and a super-bright version for when it's active
  const baseColor = useMemo(() => new THREE.Color(color), [color])
  const superGlow = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.5),
    [color]
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const drift = Math.sin(t * 0.5 + index * 1.7) * 0.03
    groupRef.current.position.y = pos[1] + drift

    if (matRef.current) {
      const pulse = 0.6 + Math.sin(t * 2 + index * 0.9) * 0.3
      // Extreme glow for all categories by increasing emissive intensity and lerping color to white
      matRef.current.emissive.copy(isActive ? superGlow : baseColor)
      matRef.current.emissiveIntensity = isActive ? 2.5 : pulse * 0.7
      matRef.current.opacity = isActive ? 1 : 0.65
    }
    if (glowRef.current) {
      glowRef.current.opacity = isActive
        ? 0.18 + Math.sin(t * 1.5 + index) * 0.08
        : 0.08 + Math.sin(t * 1.2 + index * 0.7) * 0.04
    }

    const sc = isActive ? 1.2 : 0.85
    _lerpVec.set(sc, sc, sc)
    groupRef.current.scale.lerp(_lerpVec, 0.08)
  })

  return (
    <group
      ref={groupRef}
      position={pos}
      onPointerOver={() => !dragActive && onPointerOver && onPointerOver(categoryId)}
      onPointerOut={() => !dragActive && onPointerOut && onPointerOut()}
    >
      <mesh geometry={NODE_SPHERE}>
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.9}
          roughness={0.15}
          metalness={0.8}
          transparent
          opacity={1}
        />
      </mesh>
      <mesh geometry={NODE_GLOW}>
        <meshBasicMaterial
          ref={glowRef}
          color={color}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Auto-expanded label — visible when category is active */}
      <Html
        distanceFactor={8}
        zIndexRange={[100, 0]}
        style={{
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          opacity: isActive ? 1 : 0,
          transform: `scale(${isActive ? 1 : 0.5}) translateY(-28px)`,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            background: 'rgba(10, 10, 18, 0.8)',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${color}90`,
            fontFamily: 'var(--font-mono)',
            color: '#E8E4DC',
            fontSize: '11px',
            letterSpacing: '0.04em',
            boxShadow: `0 0 20px ${color}40`,
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}

// ─── TechTube ───
function TechTube({ start, end, color, seed, isActive }) {
  const geo = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5)
    mid.x += (seededRandom(seed * 3) - 0.5) * 1
    mid.y += (seededRandom(seed * 3 + 1) - 0.5) * 1
    mid.z += (seededRandom(seed * 3 + 2) - 0.5) * 1
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([s, mid, e]),
      20,
      0.015,
      8,
      false
    )
  }, [start, end, seed])

  const baseColor = useMemo(() => new THREE.Color(color), [color])
  const superGlow = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.4),
    [color]
  )

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={color}
        emissive={isActive ? superGlow : baseColor}
        emissiveIntensity={isActive ? 1.5 : 0.2}
        transparent
        opacity={isActive ? 0.9 : 0.25}
      />
    </mesh>
  )
}

// ─── CategoryLabel (3D floating heading) ───
function CategoryLabel({ text, position, color, isActive }) {
  return (
    <Html
      position={[position.x, position.y + 1.4, position.z]}
      center
      distanceFactor={6}
      style={{
        transition: 'all 0.6s ease',
        opacity: isActive ? 1 : 0,
        transform: `scale(${isActive ? 1 : 0.6})`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 700,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          textShadow: `0 0 30px ${color}80`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </Html>
  )
}

// ─── NetworkGroup ───
function NetworkGroup({ dragRef, activeCategory, scrollComplete, hoveredCat, setHoveredCat }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const d = dragRef.current

    if (scrollComplete && !d.active) {
      d.rotY += d.velX
      d.rotX += d.velY
      d.velX *= 0.95
      d.velY *= 0.95
      if (Math.abs(d.velX) < 0.00005) d.velX = 0
      if (Math.abs(d.velY) < 0.00005) d.velY = 0
    }
    if (!scrollComplete) {
      d.rotY = 0
      d.rotX = 0
      d.velX = 0
      d.velY = 0
    }

    // Reduced mouse parallax
    const mx = state.pointer.x * 0.05
    const my = state.pointer.y * 0.05

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      d.rotY + mx,
      0.08
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      d.rotX - my,
      0.08
    )
  })

  // Build a lookup of which category each tube belongs to
  let nodeGlobalIdx = 0

  return (
    <group ref={groupRef} scale={0.8}>
      {/* Category labels */}
      {categories.map((cat, ci) => (
        <CategoryLabel
          key={`label-${ci}`}
          text={cat.cat}
          position={categoryCentroids[ci]}
          color={cat.color}
          isActive={ci === activeCategory || (activeCategory === 7 && ci === hoveredCat)}
        />
      ))}

      {/* Nodes */}
      {categories.map((cat, ci) =>
        cat.items.map((item) => (
          <TechNode
            key={item.name}
            name={item.name}
            pos={item.pos}
            color={cat.color}
            index={nodeGlobalIdx++}
            isActive={ci === activeCategory || (activeCategory === 7 && ci === hoveredCat)}
            categoryId={ci}
            onPointerOver={activeCategory === 7 ? setHoveredCat : undefined}
            onPointerOut={activeCategory === 7 ? () => setHoveredCat(-1) : undefined}
            dragActive={dragRef.current.active}
          />
        ))
      )}

      {/* Tubes */}
      {tubesData.map((t, i) => {
        // Determine which category this tube is part of
        let tubeCat = -1
        let count = 0
        for (let ci = 0; ci < categories.length; ci++) {
          const nTubes = categories[ci].items.length - 1 + (ci > 0 ? 1 : 0)
          if (i < count + nTubes) {
            tubeCat = ci
            break
          }
          count += nTubes
        }
        return (
          <TechTube
            key={`tube-${i}`}
            start={t.start}
            end={t.end}
            color={t.color}
            seed={t.seed}
            isActive={tubeCat === activeCategory || (activeCategory === 7 && tubeCat === hoveredCat)}
          />
        )
      })}
    </group>
  )
}

// ─── Right Panel ───
function CategoryPanel({ activeCategory }) {
  const isFreeExplore = activeCategory === 7
  const isOverview = activeCategory === -1

  return (
    <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 w-64 pointer-events-none">
      <AnimatePresence mode="wait">
        {isFreeExplore ? (
          <motion.div
            key="free-explore"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45 }}
            className="text-right"
            style={{
              background: 'rgba(10, 10, 20, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: `0 0 40px rgba(0,0,0,0.5)`,
            }}
          >
            <h3
              className="text-lg font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: 'var(--color-marble-white)', fontFamily: 'var(--font-display)' }}
            >
              FREE EXPLORE
            </h3>
            <p className="text-sm font-mono text-[var(--color-gray-cool)] leading-relaxed">
              Drag to rotate the network.
              <br />
              <br />
              Hover over a cluster colour to light up and expand its node names.
            </p>
          </motion.div>
        ) : isOverview ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-right"
          >
            <p
              className="text-sm font-mono uppercase tracking-widest"
              style={{ color: 'var(--color-gray-cool)' }}
            >
              Scroll to explore
            </p>
            <motion.div
              className="mt-3 mx-auto w-px h-10"
              style={{
                background:
                  'linear-gradient(to bottom, var(--color-marble-red), transparent)',
              }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            style={{
              background: 'rgba(10, 10, 20, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${categories[activeCategory].color}30`,
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: `0 0 40px ${categories[activeCategory].color}15, 0 8px 32px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: categories[activeCategory].color,
                  boxShadow: `0 0 12px ${categories[activeCategory].color}`,
                }}
              />
              <h3
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{
                  color: categories[activeCategory].color,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {categories[activeCategory].cat}
              </h3>
            </div>

            <div
              className="h-px w-full mb-5"
              style={{
                background: `linear-gradient(to right, ${categories[activeCategory].color}50, transparent)`,
              }}
            />

            {/* Items */}
            <div className="space-y-3">
              {categories[activeCategory].items.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.35 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: categories[activeCategory].color,
                      opacity: 0.7,
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: '#E8E4DC',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.name}
                  </span>
                </motion.div>
              ))}
            </div>

            <p
              className="mt-5 text-xs"
              style={{
                color: 'var(--color-gray-dim)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {activeCategory + 1} / {categories.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───
export default function TechStack() {
  const sectionRef = useRef()
  const titleRef = useRef()
  const scrollProgressRef = useRef(0)
  const [activeCategory, setActiveCategory] = useState(-1)
  const [hoveredCat, setHoveredCat] = useState(-1)
  const [scrollComplete, setScrollComplete] = useState(false)

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velX: 0,
    velY: 0,
    rotX: 0,
    rotY: 0,
  })

  // ScrollTrigger
  useEffect(() => {
    const proxy = { progress: 0 }

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5, // 1.5 seconds of smoothing lag
      animation: gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        onUpdate: () => {
          const p = proxy.progress
          scrollProgressRef.current = p
          const raw = p * (TOTAL_STOPS - 1)
          const newCat = Math.round(raw) - 1
          const clamped = Math.max(-1, Math.min(categories.length, newCat))
          setActiveCategory((prev) => (prev !== clamped ? clamped : prev))
          setScrollComplete(newCat >= 7)

          // Animate title: shrink immediately as scroll goes from overview to exactly the first category
          if (titleRef.current) {
            const stepSize = 1 / (TOTAL_STOPS - 1)
            const titleProgress = Math.min(1, p / stepSize)
            const scale = 1 - titleProgress * 0.75
            const opacity = 1 - titleProgress * 0.8
            titleRef.current.style.transform = `scale(${scale})`
            titleRef.current.style.opacity = opacity
            titleRef.current.style.transformOrigin = 'top left'
          }
        },
      }),
    })
    return () => trigger.kill()
  }, [])

  // Drag handlers — only enabled after scroll sequence completes
  const onPointerDown = useCallback(
    (e) => {
      if (!scrollComplete) return
      const d = dragRef.current
      d.active = true
      d.lastX = e.clientX
      d.lastY = e.clientY
      d.velX = 0
      d.velY = 0
    },
    [scrollComplete]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (!scrollComplete) return
      const d = dragRef.current
      if (!d.active) return
      const dx = e.clientX - d.lastX
      const dy = e.clientY - d.lastY
      d.velX = dx * 0.002
      d.velY = dy * 0.002
      d.rotY += d.velX
      d.rotX += d.velY
      d.lastX = e.clientX
      d.lastY = e.clientY
    },
    [scrollComplete]
  )

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false
  }, [])

  useEffect(() => {
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [onPointerUp])

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative"
      style={{ height: '800vh' }}
    >
      <div className="sticky top-0 h-screen w-full bg-[var(--color-black-deep)] overflow-hidden">
        {/* Title — shrinks heavily on scroll parallel to explore till backend */}
        <div
          ref={titleRef}
          className="absolute top-20 left-8 md:left-16 lg:left-24 z-30 pointer-events-none"
          style={{
            transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-display font-display font-bold track-tit text-[var(--color-marble-white)] mb-2"
          >
            THE TECH STACK
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            viewport={{ once: true }}
            className="text-caption font-mono uppercase text-[var(--color-gray-cool)]"
          >
            Technologies wired into my architecture
          </motion.p>
        </div>

        {/* Canvas */}
        <div
          className={`absolute inset-0 z-10 ${
            scrollComplete ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <CameraController scrollProgressRef={scrollProgressRef} />
              <NetworkGroup
                dragRef={dragRef}
                activeCategory={activeCategory}
                scrollComplete={scrollComplete}
                hoveredCat={hoveredCat}
                setHoveredCat={setHoveredCat}
              />
              <EffectComposer disableNormalPass>
                <Bloom
                  luminanceThreshold={0.2}
                  luminanceSmoothing={0.9}
                  intensity={1.2}
                />
              </EffectComposer>
            </Suspense>
          </Canvas>
        </div>

        {/* Right panel */}
        <CategoryPanel activeCategory={activeCategory} />

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3 pointer-events-none">
          {categories.map((cat, i) => (
            <div
              key={cat.cat}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === activeCategory ? '24px' : '8px',
                height: '8px',
                backgroundColor:
                  i === activeCategory || (activeCategory === 7 && i === hoveredCat)
                    ? cat.color
                    : 'var(--color-gray-dim)',
                boxShadow:
                  i === activeCategory || (activeCategory === 7 && i === hoveredCat)
                    ? `0 0 12px ${cat.color}`
                    : 'none',
                borderRadius: '4px',
              }}
            />
          ))}
          {/* Final state dot */}
          <div
            className="rounded-full transition-all duration-500"
            style={{
              width: activeCategory === 7 ? '24px' : '8px',
              height: '8px',
              backgroundColor:
                activeCategory === 7 ? 'var(--color-marble-white)' : 'var(--color-gray-dim)',
              boxShadow: activeCategory === 7 ? `0 0 12px var(--color-marble-white)` : 'none',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[var(--color-black-deep)] to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[var(--color-black-deep)] to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  )
}
