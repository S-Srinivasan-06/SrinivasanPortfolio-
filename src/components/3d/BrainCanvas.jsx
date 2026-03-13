import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

function CameraController({ cameraZ }) {
  const { camera } = useThree()
  useEffect(() => {
    if (cameraZ !== undefined) {
      camera.position.z = cameraZ
    }
  }, [cameraZ, camera])
  return null
}

export default function BrainCanvas({ children, cameraZ = 4, className = '' }) {
  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '300px' }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <CameraController cameraZ={cameraZ} />
        <Suspense fallback={null}>
          {/* Base ambient lighting */}
          <ambientLight intensity={0.3} />
          {/* Blue principal light */}
          <pointLight position={[5, 5, 5]} color="#1C7CBD" intensity={2} />
          {/* Red/Crimson side light */}
          <pointLight position={[-5, -3, -5]} color="#A0153E" intensity={1.5} />
          {/* Rim light from behind */}
          <pointLight position={[0, 0, -6]} color="#2C30E9" intensity={2} />
          
          {children}

          {/* Post-processing Bloom for the glowing wires */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={0.85} 
              luminanceSmoothing={0.1}
              intensity={1.2} 
              mipmapBlur 
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
