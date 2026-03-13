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
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_pixelFilter;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float star(vec2 uv, float flare) {
    float d = length(uv);
    float m = 0.05 / d;
    float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
    m += rays * flare;
    m *= smoothstep(1.0, 0.2, d);
    return m;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

    // Pixelation effect
    float pixelSize = u_resolution.x / u_pixelFilter;
    uv = floor(uv * pixelSize) / pixelSize;

    float t = u_time * 0.2;

    // Warping layers
    vec2 warp = vec2(
      sin(uv.y * 3.0 + t) * 0.1,
      cos(uv.x * 3.0 + t * 1.3) * 0.1
    );
    uv += warp;

    // Swirl
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    angle += sin(radius * 8.0 - t * 2.0) * 0.5;
    angle += cos(radius * 5.0 + t * 1.5) * 0.3;
    vec2 swirled = vec2(cos(angle), sin(angle)) * radius;

    // Color mixing
    float f1 = sin(swirled.x * 5.0 + t) * cos(swirled.y * 5.0 - t * 0.7);
    float f2 = sin(swirled.y * 4.0 + t * 1.2) * cos(swirled.x * 3.0 + t * 0.8);
    float f3 = sin((swirled.x + swirled.y) * 3.0 + t * 0.6);

    vec3 color = u_color1 * smoothstep(-0.5, 0.5, f1);
    color += u_color2 * smoothstep(-0.3, 0.7, f2);
    color += u_color3 * smoothstep(-0.4, 0.6, f3);

    // Bloom / glow
    float glow = smoothstep(0.8, 0.0, radius) * 0.3;
    color += glow;

    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.2, radius);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`

function hexToVec3(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return [r, g, b]
}

export default function Balatro({
  color1 = '010101',
  color2 = '0c61ad',
  color3 = '0d1139',
  pixelFilter = 2000,
  className = '',
}) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: true })
    if (!gl) return

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

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes = gl.getUniformLocation(program, 'u_resolution')
    const uC1 = gl.getUniformLocation(program, 'u_color1')
    const uC2 = gl.getUniformLocation(program, 'u_color2')
    const uC3 = gl.getUniformLocation(program, 'u_color3')
    const uPix = gl.getUniformLocation(program, 'u_pixelFilter')

    gl.uniform3fv(uC1, hexToVec3(color1))
    gl.uniform3fv(uC2, hexToVec3(color2))
    gl.uniform3fv(uC3, hexToVec3(color3))
    gl.uniform1f(uPix, pixelFilter)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()
    const render = () => {
      const t = (performance.now() - startTime) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animRef.current = requestAnimationFrame(render)
    }
    animRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [color1, color2, color3, pixelFilter])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}
