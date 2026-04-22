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
    const bloom = document.getElementById("theme-bloom")
    if (isBlooming || !toggleBtnRef.current || !bloom) return

    const rect = toggleBtnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const nextTheme = theme === "dark" ? "light" : "dark"

    bloom.dataset.nextTheme = nextTheme
    bloom.style.setProperty("--x", `${centerX}px`)
    bloom.style.setProperty("--y", `${centerY}px`)

    setIsBlooming(true)

    requestAnimationFrame(() => {
      bloom.classList.add("active")
    })

    themeTimeoutRef.current = window.setTimeout(() => {
      toggleTheme()
    }, 150)

    cleanupTimeoutRef.current = window.setTimeout(() => {
      bloom.classList.remove("active")
      bloom.removeAttribute("data-next-theme")
      setIsBlooming(false)
    }, 600)
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
