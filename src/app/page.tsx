"use client"

import { useEffect, useState } from "react"
import { RadialOrbitalTimelineDemo } from "@/components/radial-demo"
import { useTheme } from "@/components/theme-provider"

// ── Project data ──────────────────────────────────────────────────────────────
type ProjectEntry = {
  title: string
  desc: string
  tech: string[]
  link: string
  demoLink?: string
  screenshots?: string[]
  features?: string[]
  stackDetail?: { label: string; items: string }[]
  problem?: string
  future?: string[]
  cardImage?: string
  featured?: boolean
}

const projectData: Record<string, ProjectEntry> = {
  aihub: {
    title: "AI Hub",
    desc: "A unified AI workspace combining chat, news, and learning in one seamless environment.",
    tech: ["React", "FastAPI", "Python", "LLM", "APIs"],
    link: "https://github.com/MSameer7-tech",
    demoLink: "#",
    featured: true,
    cardImage: "/projects/aihub-chat.png",
    screenshots: [
      "/projects/aihub-chat.png",
      "/projects/aihub-news.png",
      "/projects/aihub-quiz.png",
    ],
    features: [
      "Context-aware AI with multi-session memory",
      "Real-time news integration with deduplication",
    ],
    stackDetail: [
      { label: "Frontend", items: "React, Tailwind CSS, Framer Motion" },
      { label: "Backend", items: "FastAPI, Python" },
      { label: "AI / Data", items: "Ollama (local LLM), News APIs, OpenTriviaDB" },
    ],
    problem: "AI Hub is a full-stack application designed to unify chat, news, and learning into one intelligent workspace.",
    future: ["Voice input", "User accounts", "PDF quiz generation"],
  },
  kanye: {
    title: "Kanye Quotes App",
    desc: "Python application displaying random Kanye West quotes using RESTful APIs.",
    tech: ["Python", "Tkinter", "Requests API"],
    link: "https://github.com/MSameer7-tech",
    screenshots: ["/projects/kanye-app.png", "/projects/kanye-app-2.png"],
    features: [
      "Real-time data fetching from REST APIs",
      "Clean Tkinter GUI integration",
    ],
  },
  password: {
    title: "GUI Password Manager",
    desc: "Secure tool for generating and storing passwords locally in JSON format.",
    tech: ["Python", "Tkinter", "JSON", "Cryptography"],
    link: "https://github.com/MSameer7-tech",
    screenshots: ["/projects/password-manager.png", "/projects/password-manager-2.png"],
    features: [
      "Secure password generation logic",
      "Encrypted local JSON storage",
    ]
  },
  twitter: {
    title: "Internet Speed Twitter Bot",
    desc: "Automation tool for measuring internet speed and posting to Twitter.",
    tech: ["Python", "Selenium", "Automation"],
    link: "https://github.com/MSameer7-tech",
    features: [
      "Automates speed test and tweet flow",
      "Dynamic browser interaction via Selenium",
    ]
  },
  pong: {
    title: "Interactive Pong Game",
    desc: "Classic arcade game built with Python Turtle and custom physics.",
    tech: ["Python", "Turtle Graphics"],
    link: "https://github.com/MSameer7-tech",
    features: [
      "Custom physics and collision algorithms",
      "Real-time responsive controls",
    ]
  },
  snake: {
    title: "Snake Game",
    desc: "Classic snake game with score tracking and tail management.",
    tech: ["Python", "Turtle Graphics"],
    link: "https://github.com/MSameer7-tech",
    features: [
      "Score-keeping and game state management",
      "Dynamic tail tracking logic",
    ]
  },
}

type Repo = { name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; fork: boolean }

export default function Page() {
  const { theme } = useTheme()
  const [scrollProgress, setScrollProgress] = useState(0)
  const [modalData, setModalData] = useState<ProjectEntry | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  const handleOpenLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images)
    setLightboxIdx(index)
  }

  const closeLightbox = () => {
    setLightboxImages(null)
    setLightboxIdx(0)
  }

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)

    setIsSubmittingContact(true)
    setContactError(null)

    try {
      const res = await fetch("https://formspree.io/f/mbdqjygd", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })

      if (!res.ok) {
        throw new Error("Something went wrong while sending your message.")
      }

      form.reset()
      setContactSubmitted(true)
    } catch {
      setContactError("Something went wrong. Please try again.")
    } finally {
      setIsSubmittingContact(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImages) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev + 1) % lightboxImages.length)
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxImages])

  const [taglineIdx, setTaglineIdx] = useState(0)
  const [taglineVisible, setTaglineVisible] = useState(true)
  const [repos, setRepos] = useState<Repo[]>([])
  const taglines = ["AI & ML Student", "Python Developer", "Automation Builder"]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty("--x", `${x}%`)
    card.style.setProperty("--y", `${y}%`)
  }

  // ── Tagline cycle ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineVisible(false)
      setTimeout(() => {
        setTaglineIdx(i => (i + 1) % taglines.length)
        setTaglineVisible(true)
      }, 600)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // ── Scroll events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      setScrollProgress((window.scrollY / total) * 100)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // ── Scroll reveal ─────────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle("active", e.isIntersecting)),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ── GitHub repos ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("https://api.github.com/users/MSameer7-tech/repos?sort=updated&per_page=6")
      .then(r => r.json())
      .then((data: Repo[]) => Array.isArray(data) && setRepos(data.filter(r => !r.fork)))
      .catch(() => { })
  }, [])

  return (
    <>
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />

      <section id="hero">
        <div className="container hero-content reveal center-text">
          <div className="hero-badge">AI ENGINEER PORTFOLIO</div>
          <h1 className="hero-title">
            Mohammad <span className="shimmer-pulse">Sameer</span>
          </h1>
          <div
            className="hero-tagline"
            style={{ opacity: taglineVisible ? 1 : 0, transition: "opacity 0.6s ease" }}
          >
            {taglines[taglineIdx]}
          </div>
          <div className="hero-bio">
            <p>BTech student specializing in Artificial Intelligence and Machine Learning.</p>
            <p>I build practical software tools using Python — automation, data structures, and object-oriented programming.</p>
          </div>
          <div className="hero-tech">Python • Machine Learning • Automation • AI Tools</div>
          <div className="social-links">
            <a href="https://github.com/MSameer7-tech" target="_blank" aria-label="GitHub"><i className="fab fa-github" /></a>
            <a href="https://www.linkedin.com/in/mohammad-sameer-926a66323/" target="_blank" aria-label="LinkedIn"><i className="fab fa-linkedin" /></a>
            <a href="https://instagram.com/isameerxo" target="_blank" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href="mailto:mohammadsameerwork@gmail.com" aria-label="Email"><i className="fas fa-envelope" /></a>
          </div>
          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary glow-effect">View Projects</a>
            <a href="#contact" className="btn btn-secondary glow-effect">Contact</a>
          </div>
        </div>
        <div className="scroll-indicator"><i className="fas fa-chevron-down" /></div>
      </section>

      {/* Marquee */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ </span>
          <span>ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ </span>
          <span>ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ </span>
          <span>ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ ABOUT ME ✶ LEARNING ✶ </span>
        </div>
      </div>

      {/* ══ About ══════════════════════════════════════════════════════════ */}
      <section id="about" className="section">
        <div className="container reveal">
          <h2 className="section-title">Who I Am</h2>
          <div className="about-grid">
            <div className="about-content parallax-item reveal" data-speed="0.1" style={{ maxWidth: 700, textAlign: "left" }}>
              <p style={{ marginBottom: "1rem" }}>I enjoy building systems that solve real problems, not just isolated features. My focus is on combining clean design with practical functionality — whether it's automation tools, AI-driven applications, or data-backed solutions.</p>
              <p>I like thinking in terms of workflows: how data flows, how users interact, and how systems can be made smarter and more efficient. Most of my work revolves around turning ideas into usable, scalable applications with a strong emphasis on simplicity and performance.</p>
            </div>
            <div className="learning-section parallax-item about-right" data-speed="-0.1">
              <div className="status-grid">
                <div className="status-card tilt-card current-card reveal">
                  <i className="fas fa-book-open status-icon float-anim card-icon" />
                  <h4>Currently Learning</h4>
                  <p>Machine Learning fundamentals and advanced Python development.</p>
                </div>
                <div className="status-card tilt-card current-card reveal">
                  <i className="fas fa-laptop-code status-icon float-anim card-icon" style={{ animationDelay: "1s" }} />
                  <h4>Currently Building</h4>
                  <p>New AI-based projects and software automation tools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-divider outline-style">
        <div className="marquee-track reverse">
          <span>TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ </span>
          <span>TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ </span>
          <span>TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ </span>
          <span>TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ TECH STACK ✶ SKILLS ✶ </span>
        </div>
      </div>

      {/* ══ Tech Stack ══════════════════════════════════════════════════════ */}
      <section id="tech-stack" className="section bg-alt over-hidden" style={{ padding: "4rem 0" }}>
        <h2
          className="section-title center-text reveal"
          style={{ textAlign: "center", width: "100%", marginBottom: "5rem" }}
        >
          Interactive Tech Stack
        </h2>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <RadialOrbitalTimelineDemo />
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>FEATURED PROJECTS ✶ WORK ✶ FEATURED PROJECTS ✶ WORK ✶ </span>
          <span>FEATURED PROJECTS ✶ WORK ✶ FEATURED PROJECTS ✶ WORK ✶ </span>
          <span>FEATURED PROJECTS ✶ WORK ✶ FEATURED PROJECTS ✶ WORK ✶ </span>
          <span>FEATURED PROJECTS ✶ WORK ✶ FEATURED PROJECTS ✶ WORK ✶ </span>
        </div>
      </div>

      {/* ══ Projects ═══════════════════════════════════════════════════════ */}
      <section id="projects" className="section" style={{ padding: "5rem 0" }}>
        <div className="container">
          <h2 className="section-title reveal">Creative Work</h2>

          {/* ── AI Hub — Featured ──────────────────────────────────── */}
            <div
              className="project-card-featured tilt-card reveal card-hover"
              onClick={() => setModalData(projectData.aihub)}
              onMouseMove={handleMouseMove}
            >
              <div className="featured-badge"><i className="fas fa-star" /> Featured Project</div>
              <div className="project-image-wrapper featured-image-wrapper">
                <img
                  src="/projects/aihub-chat.png"
                  alt="AI Hub — Chat Interface"
                  className="project-img featured-img image-preview"
                  onClick={e => { e.stopPropagation(); handleOpenLightbox(projectData.aihub.screenshots || ["/projects/aihub-chat.png"], 0) }}
                />
                <div className="project-overlay">
                  <span className="view-text">View Details</span>
                </div>
              </div>
              <div className="project-info featured-info">
                <div className="featured-header">
                  <h3 className="featured-title">AI Hub</h3>
                  <p>{projectData.aihub.desc}</p>
                  
                  <div className="impact-section">
                    <span className="impact-label">Impact</span>
                    <ul className="impact-list">
                      {projectData.aihub.features?.slice(0,2).map((f, i) => (
                        <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                      ))}
                    </ul>
                  </div>

                </div>
                <div className="tech-stack">
                  <span>React</span><span>FastAPI</span><span>Python</span><span>LLM</span><span>APIs</span>
                </div>
                <div className="project-actions">
                  <a href="#" className="btn btn-primary btn-sm glow-effect button-hover" onClick={e => e.stopPropagation()}>
                    <i className="fas fa-external-link-alt" /> Live Demo
                  </a>
                  <a href="https://github.com/MSameer7-tech" target="_blank" className="glow-link button-hover" onClick={e => e.stopPropagation()}>
                    <i className="fab fa-github" /> GitHub
                  </a>
                  <button
                    className="btn btn-outline btn-sm glow-effect button-hover"
                    onClick={e => { e.stopPropagation(); setModalData(projectData.aihub) }}
                  >
                    View Details <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            </div>

          <div className="projects-grid-large">
            {/* Project 1 (Twitter Bot) */}
            <div className="project-card-large tilt-card reveal parallax-item card-hover" data-project="twitter" data-speed="0.03" onClick={() => setModalData(projectData.twitter)} onMouseMove={handleMouseMove}>
              <div className="project-image-wrapper">
                <img src="https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=1000" alt="Twitter Bot" className="project-img parallax-img" />
                <div className="project-overlay"><span className="view-text">Click for Details</span></div>
              </div>
              <div className="project-info">
                <h3>Internet Speed Twitter Bot</h3>
                <p>{projectData.twitter.desc}</p>
                <div className="impact-section">
                  <span className="impact-label">Impact</span>
                  <ul className="impact-list">
                    {projectData.twitter.features?.slice(0,2).map((f, i) => (
                      <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="tech-stack"><span>Python</span><span>Selenium</span><span>Automation</span></div>
                <div className="project-actions">
                  <a href="https://github.com/MSameer7-tech" target="_blank" className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => e.stopPropagation()}><i className="fab fa-github" /> Source</a>
                  <button className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => { e.stopPropagation(); setModalData(projectData.twitter); }}>Explore <i className="fas fa-arrow-right" /></button>
                </div>
              </div>
            </div>

            {/* Project 1 -> 2 (Kanye) */}
            <div className="project-card-large tilt-card reveal parallax-item offset-grid card-hover" data-project="kanye" data-speed="0.05" onClick={() => setModalData(projectData.kanye)} onMouseMove={handleMouseMove}>
              <div className="project-image-wrapper">
                <img src="/projects/kanye-app.png" alt="Kanye Quotes App Screenshot" className="project-img parallax-img image-preview" onClick={e => { e.stopPropagation(); handleOpenLightbox(projectData.kanye.screenshots || ["/projects/kanye-app.png"], 0) }} />
                <div className="project-overlay"><span className="view-text">Click for Details</span></div>
              </div>
              <div className="project-info">
                <h3>Kanye Quotes App</h3>
                <p>{projectData.kanye.desc}</p>
                <div className="impact-section">
                  <span className="impact-label">Impact</span>
                  <ul className="impact-list">
                    {projectData.kanye.features?.slice(0,2).map((f, i) => (
                      <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="tech-stack"><span>Python</span><span>Tkinter</span><span>API</span></div>
                <div className="project-actions">
                  <a href="https://github.com/MSameer7-tech" target="_blank" className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => e.stopPropagation()}>
                    <i className="fab fa-github" /> Source
                  </a>
                  <button className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => { e.stopPropagation(); setModalData(projectData.kanye) }}>Explore <i className="fas fa-arrow-right" /></button>
                </div>
              </div>
            </div>

            {/* Project 3 (Password Manager) */}
            <div className="project-card-large tilt-card reveal parallax-item offset-grid card-hover" data-project="password" data-speed="-0.05" onClick={() => setModalData(projectData.password)} onMouseMove={handleMouseMove}>
              <div className="project-image-wrapper">
                <img src="/projects/password-manager.png" alt="GUI Password Manager Screenshot" className="project-img parallax-img image-preview" onClick={e => { e.stopPropagation(); handleOpenLightbox(projectData.password.screenshots || ["/projects/password-manager.png"], 0) }} />
                <div className="project-overlay"><span className="view-text">Click for Details</span></div>
              </div>
              <div className="project-info">
                <h3>GUI Password Manager</h3>
                <p>{projectData.password.desc}</p>
                <div className="impact-section">
                  <span className="impact-label">Impact</span>
                  <ul className="impact-list">
                    {projectData.password.features?.slice(0,2).map((f, i) => (
                      <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="tech-stack"><span>Python</span><span>JSON</span><span>Security</span></div>
                <div className="project-actions">
                  <a href="https://github.com/MSameer7-tech" target="_blank" className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => e.stopPropagation()}>
                    <i className="fab fa-github" /> Source
                  </a>
                  <button className="btn btn-outline btn-sm glow-effect button-hover" onClick={e => { e.stopPropagation(); setModalData(projectData.password) }}>Explore <i className="fas fa-arrow-right" /></button>
                </div>
              </div>
            </div>

            {/* Projects 4 & 5 */}
            <div className="projects-side-by-side">
              <div className="project-card tilt-card reveal card-hover" data-project="pong" onClick={() => setModalData(projectData.pong)} onMouseMove={handleMouseMove}>
                <div className="project-content">
                  <i className="fas fa-gamepad watermark-icon" />
                  <h3>Interactive Pong Game</h3>
                  <p>{projectData.pong.desc}</p>
                  <div className="impact-section">
                    <span className="impact-label">Impact</span>
                    <ul className="impact-list">
                      {projectData.pong.features?.slice(0,2).map((f, i) => (
                        <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="tech-stack"><span>Python</span><span>Turtle</span></div>
                  <button className="btn btn-primary btn-sm glow-effect button-hover" onClick={e => { e.stopPropagation(); setModalData(projectData.pong) }}>Details</button>
                </div>
              </div>
              <div className="project-card tilt-card reveal card-hover" data-project="snake" style={{ transitionDelay: "0.2s" }} onClick={() => setModalData(projectData.snake)} onMouseMove={handleMouseMove}>
                <div className="project-content">
                  <i className="fas fa-worm watermark-icon" />
                  <h3>Snake Game</h3>
                  <p>{projectData.snake.desc}</p>
                  <div className="impact-section">
                    <span className="impact-label">Impact</span>
                    <ul className="impact-list">
                      {projectData.snake.features?.slice(0,2).map((f, i) => (
                        <li key={i} className="impact-item"><span className="impact-dot"></span> {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="tech-stack"><span>Python</span><span>Turtle</span></div>
                  <button className="btn btn-primary btn-sm glow-effect button-hover" onClick={e => { e.stopPropagation(); setModalData(projectData.snake) }}>Details</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-divider outline-style">
        <div className="marquee-track reverse">
          <span>GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ </span>
          <span>GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ </span>
          <span>GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ </span>
          <span>GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ GITHUB ✶ STATS ✶ </span>
        </div>
      </div>

      {/* ══ GitHub ══════════════════════════════════════════════════════════ */}
      <section id="github" className="section bg-alt over-hidden">
        <div className="container reveal">
          <h2 className="section-title">GitHub Activity</h2>
          <p className="section-subtitle">Visualizing my open-source contributions and development frequency.</p>
          <div className="github-heatmap-container tilt-card parallax-item" data-speed="0.05">
            <img id="github-heatmap-img" src={`https://ghchart.rshah.org/${theme === "dark" ? "FFFFFF" : "000000"}/MSameer7-tech`} alt="GitHub Contribution Heatmap" />
          </div>
          <div className="github-container mt-4">
            <div className="github-stats-wrapper tilt-card">
              <img id="github-stats-img" src={`https://github-readme-stats.vercel.app/api?username=MSameer7-tech&show_icons=true&theme=radical&hide_border=true&bg_color=00000000&text_color=${theme === "dark" ? "ffffff" : "000000"}&icon_color=${theme === "dark" ? "ffffff" : "000000"}&title_color=${theme === "dark" ? "ffffff" : "000000"}`} alt="GitHub Stats" />
            </div>
            <h3 className="subsection-title mt-4">Top Repositories</h3>
            <div className="repos-grid" id="repos-container">
              {repos.length === 0
                ? <div className="loader">Loading Repositories...</div>
                : repos.map(repo => (
                  <a key={repo.name} href={repo.html_url} target="_blank" className="repo-card tilt-card">
                    <div className="repo-header"><i className="far fa-folder glow-icon" /><span>{repo.name}</span></div>
                    <p style={{ fontSize: "0.95rem", marginBottom: 0 }}>{repo.description || "No description provided."}</p>
                    <div className="repo-stats">
                      {repo.language && <span><i className="fas fa-circle" style={{ fontSize: "0.6rem", verticalAlign: "middle", marginRight: 6 }} />{repo.language}</span>}
                      <span><i className="far fa-star" /> {repo.stargazers_count}</span>
                      <span><i className="fas fa-code-branch" /> {repo.forks_count}</span>
                    </div>
                  </a>
                ))
              }
            </div>
          </div>
        </div>
      </section>

      {/* ══ Resume ══════════════════════════════════════════════════════════ */}
      <section id="resume" className="section section-sm center-text relative over-hidden">
        <div className="abstract-shape shape-1 float-anim" />
        <div className="abstract-shape shape-2 float-anim" style={{ animationDelay: "2s", right: "10%", left: "auto" }} />
        <div className="container reveal z-index-1">
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>Ready to collaborate?</h2>
          <p style={{ marginBottom: "2rem", fontSize: "1.2rem" }}>Review my full background and experience.</p>
          <a href="#" className="btn btn-primary btn-lg glow-effect"><i className="fas fa-download" /> Download Resume</a>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-divider">
        <div className="marquee-track">
          <span>CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ </span>
          <span>CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ </span>
          <span>CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ </span>
          <span>CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ CONTACT ✶ CONNECT ✶ </span>
        </div>
      </div>

      {/* ══ Contact ═════════════════════════════════════════════════════════ */}
      <section id="contact" className="section contact-section">
        <div className="container reveal">
          <div className="contact-grid">
            <div className="contact-info parallax-item" data-speed="0.1">
              <h2 className="section-title contact-title">Get in Touch</h2>
              <p className="contact-description">{"Feel free to reach out for collaborations, internships, or just a friendly chat about AI and programming. Let's build something amazing together."}</p>
              <ul className="contact-list contact-links">
                <li><a href="mailto:mohammadsameerwork@gmail.com" className="hover-underline"><i className="fas fa-envelope glow-icon" /> mohammadsameerwork@gmail.com</a></li>
                <li><a href="https://github.com/MSameer7-tech" target="_blank" className="hover-underline"><i className="fab fa-github glow-icon" /> MSameer7-tech</a></li>
                <li><a href="https://www.linkedin.com/in/mohammad-sameer-926a66323/" target="_blank" className="hover-underline"><i className="fab fa-linkedin glow-icon" /> LinkedIn Profile</a></li>
                <li><a href="https://instagram.com/isameerxo" target="_blank" className="hover-underline"><i className="fab fa-instagram glow-icon" /> @isameerxo</a></li>
              </ul>
            </div>
            <div className="contact-form-container tilt-card">
              <form
                className="contact-form"
                action="https://formspree.io/f/mbdqjygd"
                method="POST"
                onSubmit={handleContactSubmit}
              >
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" required placeholder="John Doe" />
                  <div className="input-line" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" required placeholder="john@example.com" />
                  <div className="input-line" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={4} required placeholder="Your message here..." />
                  <div className="input-line" />
                </div>
                <input type="hidden" name="_subject" value="New Portfolio Message" />

                {!contactSubmitted && (
                  <button
                    type="submit"
                    id="submitBtn"
                    className="btn btn-primary glow-effect w-100"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? "Sending..." : "SEND MESSAGE"}
                  </button>
                )}

                <div className={`success-message ${contactSubmitted ? "show" : ""}`} id="successMessage" aria-live="polite">
                  <div className="tick" />
                  <p>Message Sent Successfully</p>
                </div>

                {contactError && <p className="contact-error">{contactError}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>© Mohammad Sameer – Crafted with Code.</p>
        </div>
      </footer>

      {/* ── Project Modal ─────────────────────────────────────────────────── */}
      {modalData && (
        <div
          id="project-modal"
          className="modal"
          style={{ display: "flex" }}
          onClick={e => { if (e.target === e.currentTarget) setModalData(null) }}
        >
          <div className={`modal-content tilt-card ${modalData.featured ? "modal-content-featured" : ""}`}>
            <button
              type="button"
              className="close-modal project-close"
              onClick={() => setModalData(null)}
              aria-label="Close project modal"
            >
              ✕
            </button>

            {modalData.featured ? (
              /* ── Rich AI Hub modal ── */
              <>
                <div className="modal-featured-header">
                  <div className="modal-featured-badge"><i className="fas fa-robot" /> AI Project</div>
                  <h2 className="modal-featured-title">{modalData.title}</h2>
                  <p className="modal-featured-intro">{modalData.problem}</p>
                </div>

                {/* Screenshot gallery */}
                {modalData.screenshots && (
                  <div className="modal-screenshot-gallery">
                    {modalData.screenshots.map((src, i) => (
                      <div key={i} className="modal-screenshot-item">
                        <img src={src} alt={`${modalData.title} screenshot ${i + 1}`} className="modal-screenshot-img image-preview" onClick={(e) => { e.stopPropagation(); handleOpenLightbox(modalData.screenshots!, i); }} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-featured-body">
                  {/* Key features */}
                  {modalData.features && (
                    <div className="modal-section">
                      <h4 className="modal-section-title"><i className="fas fa-bolt" /> Key Features</h4>
                      <ul className="modal-feature-list">
                        {modalData.features.map((f, i) => (
                          <li key={i}><i className="fas fa-check-circle" /> {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tech stack */}
                  {modalData.stackDetail && (
                    <div className="modal-section">
                      <h4 className="modal-section-title"><i className="fas fa-layer-group" /> Tech Stack</h4>
                      <div className="modal-stack-grid">
                        {modalData.stackDetail.map((s, i) => (
                          <div key={i} className="modal-stack-row">
                            <span className="modal-stack-label">{s.label}</span>
                            <span className="modal-stack-items">{s.items}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Future plans */}
                  {modalData.future && (
                    <div className="modal-section">
                      <h4 className="modal-section-title"><i className="fas fa-rocket" /> Future Plans</h4>
                      <ul className="modal-future-list">
                        {modalData.future.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="modal-actions mt-4">
                  <a href={modalData.demoLink || "#"} className="btn btn-primary glow-effect" target="_blank">
                    <i className="fas fa-external-link-alt" /> Live Demo
                  </a>
                  <a href={modalData.link || "#"} className="btn btn-outline glow-effect" target="_blank">
                    <i className="fab fa-github" /> GitHub
                  </a>
                </div>
              </>
            ) : (
              /* ── Simple modal for other projects ── */
              <>
                <h2>{modalData.title}</h2>
                <div className="modal-body">
                  <p className="mt-3">{modalData.desc || ""}</p>
                  
                  {/* Screenshot gallery */}
                  {modalData.screenshots && (
                    <div className="modal-screenshot-gallery mt-4">
                      {modalData.screenshots.map((src, i) => (
                        <div key={i} className="modal-screenshot-item">
                          <img src={src} alt={`${modalData.title} screenshot ${i + 1}`} className="modal-screenshot-img image-preview" onClick={(e) => { e.stopPropagation(); handleOpenLightbox(modalData.screenshots!, i); }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="tech-stack mt-3">
                    {modalData.tech?.map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className="modal-actions mt-4">
                    <a href={modalData.link || "#"} className="btn btn-outline glow-effect" target="_blank">
                      <i className="fab fa-github" /> View Source
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImages && (
        <div className="modal-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={e => { e.stopPropagation(); closeLightbox(); }}><i className="fas fa-times" /></button>
          
          {lightboxImages.length > 1 && (
            <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length); }}><i className="fas fa-chevron-left" /></button>
          )}

          {/* Used framer-motion approach explicitly requested via prompt ("Framer Motion transition") -> we mapped basic CSS scale via the prompt structure */}
          <img src={lightboxImages[lightboxIdx]} alt="Preview" className="modal-image" onClick={e => e.stopPropagation()} />
          
          {lightboxImages.length > 1 && (
            <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % lightboxImages.length); }}><i className="fas fa-chevron-right" /></button>
          )}
        </div>
      )}
    </>
  )
}
