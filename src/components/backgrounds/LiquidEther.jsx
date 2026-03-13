import { useEffect, useRef } from 'react'

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mouseForce;
  uniform float u_cursorSize;
  uniform float u_autoSpeed;
  uniform float u_autoIntensity;
  uniform float u_viscous;
  uniform vec3 u_color0;
  uniform vec3 u_color1;
  uniform vec3 u_color2;

  #define PI 3.14159265359

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = uv * aspect;

    float t = u_time * u_autoSpeed * 0.3;

    // Warping
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + t * 0.15),
      fbm(p + vec2(5.2, 1.3) + t * 0.12)
    );
    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.1),
      fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.08)
    );
    float f = fbm(p + 4.0 * r);

    // Mouse interaction
    vec2 mouseUV = u_mouse * aspect;
    float mouseDist = length(p - mouseUV);
    float mouseEffect = smoothstep(u_cursorSize / 100.0, 0.0, mouseDist) * u_mouseForce / 100.0;
    f += mouseEffect * 0.3;

    // Viscous flow
    float flow = sin(f * u_viscous + t) * 0.5 + 0.5;

    // Color mixing
    vec3 color = mix(u_color0, u_color1, clamp(f * f * 2.0, 0.0, 1.0));
    color = mix(color, u_color2, clamp(length(q) * 1.5, 0.0, 1.0));
    color = mix(color, u_color0 * 0.5, clamp(length(r.x), 0.0, 1.0));

    // Add ethereal glow
    color += vec3(flow * 0.07);
    color *= (0.8 + 0.2 * f * f * f);

    gl_FragColor = vec4(color, 1.0);
  }
`

function hexToVec3(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return [r, g, b]
}

export default function LiquidEther({
  color0 = 'eccefd',
  color1 = '2c30e9',
  color2 = '1c7cbd',
  cursorSize = 135,
  mouseForce = 33,
  autoSpeed = 0.8,
  autoIntensity = 0.6,
  viscous = 25,
  className = '',
}) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vertexShader)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fragmentShader)
    gl.compileShader(fs)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Fullscreen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uMouseForce = gl.getUniformLocation(program, 'u_mouseForce')
    const uCursorSize = gl.getUniformLocation(program, 'u_cursorSize')
    const uAutoSpeed = gl.getUniformLocation(program, 'u_autoSpeed')
    const uAutoIntensity = gl.getUniformLocation(program, 'u_autoIntensity')
    const uViscous = gl.getUniformLocation(program, 'u_viscous')
    const uColor0 = gl.getUniformLocation(program, 'u_color0')
    const uColor1 = gl.getUniformLocation(program, 'u_color1')
    const uColor2 = gl.getUniformLocation(program, 'u_color2')

    gl.uniform1f(uMouseForce, mouseForce)
    gl.uniform1f(uCursorSize, cursorSize)
    gl.uniform1f(uAutoSpeed, autoSpeed)
    gl.uniform1f(uAutoIntensity, autoIntensity)
    gl.uniform1f(uViscous, viscous)
    gl.uniform3fv(uColor0, hexToVec3(color0))
    gl.uniform3fv(uColor1, hexToVec3(color1))
    gl.uniform3fv(uColor2, hexToVec3(color2))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouseMove)

    const startTime = performance.now()
    const render = () => {
      const t = (performance.now() - startTime) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animRef.current = requestAnimationFrame(render)
    }
    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [color0, color1, color2, cursorSize, mouseForce, autoSpeed, autoIntensity, viscous])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}
