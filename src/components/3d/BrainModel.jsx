import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* Procedural brain-like mesh using displaced icosahedron */
export default function BrainModel({ rotationSpeed = 1, scale = 1 }) {
  const meshRef = useRef()
  const count = 200

  // Create brain geometry with organic displacement
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 4)
    const pos = geo.attributes.position
    const vertex = new THREE.Vector3()

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i)

      // Brain-like asymmetric displacement
      const noise1 = Math.sin(vertex.x * 3.2) * Math.cos(vertex.y * 2.8) * 0.15
      const noise2 = Math.sin(vertex.y * 4.1 + 1.0) * Math.cos(vertex.z * 3.5) * 0.12
      const noise3 = Math.cos(vertex.z * 2.9 + 0.5) * Math.sin(vertex.x * 3.8) * 0.1

      // Central fissure (brain split)
      const fissure = Math.exp(-vertex.x * vertex.x * 8) * 0.12

      // Hemisphere bulges
      const bulge = (Math.abs(vertex.x) > 0.3 ? 0.08 : 0) * Math.sign(vertex.y + 0.2)

      const displacement = 1.0 + noise1 + noise2 + noise3 - fissure + bulge

      vertex.multiplyScalar(displacement)
      pos.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  // Solid dark metal material with inner violet glow
  const brainMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A0A1E'),
        roughness: 0.3,
        metalness: 0.7,
        emissive: new THREE.Color('#3D1F6E'), // Violet inner glow
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3 * rotationSpeed
      meshRef.current.rotation.x += delta * 0.05 * rotationSpeed
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} material={brainMaterial} />
      <NeuralPulses rotationSpeed={rotationSpeed} scale={scale} count={count} />
    </group>
  )
}

/* Floating particles that orbit the brain like synaptic pulses */
function NeuralPulses({ rotationSpeed, scale, count }) {
  const pointsRef = useRef()

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.8 + Math.random() * 0.8
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos]
  }, [count])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      pos[idx] += Math.sin(t * 0.5 + i) * 0.003 * rotationSpeed
      pos[idx + 1] += Math.cos(t * 0.3 + i * 0.5) * 0.003 * rotationSpeed
      pos[idx + 2] += Math.sin(t * 0.4 + i * 0.7) * 0.003 * rotationSpeed
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.rotation.y += delta * 0.1 * rotationSpeed
    pointsRef.current.scale.setScalar(scale)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#2C30E9"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
