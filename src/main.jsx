import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import React, { useEffect, useLayoutEffect, useState, createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './index.css'
import App from './App.jsx'

const LenisContext = createContext(null)

export const useLenis = () => useContext(LenisContext)

function Root() {
  const [lenis, setLenis] = useState(null)

  useLayoutEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    setLenis(instance)

    function raf(time) {
      instance.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      instance.destroy()
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      <App />
    </LenisContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
