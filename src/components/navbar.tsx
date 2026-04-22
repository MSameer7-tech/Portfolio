"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "./theme-provider"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isBlooming, setIsBlooming] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)
  const themeTimeoutRef = useRef<number | null>(null)
  const cleanupTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    return () => {
      if (themeTimeoutRef.current) window.clearTimeout(themeTimeoutRef.current)
      if (cleanupTimeoutRef.current) window.clearTimeout(cleanupTimeoutRef.current)
    }
  }, [])

  const handleThemeToggle = () => {
    if (isBlooming || !toggleBtnRef.current) return

    const rect = toggleBtnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const bloom = document.createElement("div")
    const nextTheme = theme === "dark" ? "light" : "dark"
    const maxX = Math.max(centerX, window.innerWidth - centerX)
    const maxY = Math.max(centerY, window.innerHeight - centerY)
    const radius = Math.sqrt(maxX * maxX + maxY * maxY)
    const scale = radius / 10

    bloom.classList.add("theme-bloom", nextTheme)
    bloom.style.left = `${centerX}px`
    bloom.style.top = `${centerY}px`
    document.body.appendChild(bloom)

    setIsBlooming(true)

    requestAnimationFrame(() => {
      bloom.style.transform = `translate(-50%, -50%) scale(${scale})`
    })

    themeTimeoutRef.current = window.setTimeout(() => {
      toggleTheme()
    }, 300)

    cleanupTimeoutRef.current = window.setTimeout(() => {
      bloom.remove()
      setIsBlooming(false)
    }, 800)
  }

  return (
    <>
      <button
        id="theme-toggle"
        ref={toggleBtnRef}
        className="theme-toggle"
        aria-label="Toggle theme"
        onClick={handleThemeToggle}
        disabled={isBlooming}
      >
        <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
      </button>

      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <a href="#" className="logo">MS.</a>
          <div className="nav-links">
            <a href="#about" className="hover-underline">About</a>
            <a href="#tech-stack" className="hover-underline">Skills</a>
            <a href="#projects" className="hover-underline">Projects</a>
            <a href="#github" className="hover-underline">GitHub</a>
            <a href="#contact" className="hover-underline">Contact</a>
          </div>
        </div>
      </nav>
    </>
  )
}
