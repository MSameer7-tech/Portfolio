"use client"

import { Code, FileText, Zap, User, Clock, Monitor } from "lucide-react"
import { RadialOrbitalTimeline } from "@/components/ui/radial-orbital-timeline"

const timelineData = [
    {
        id: 1,
        title: "Python",
        date: "Primary Language",
        content: "Used for automation, AI tools, backend scripting, and GUI development. My most fluent and frequently-used language.",
        category: "Programming",
        icon: Code,
        relatedIds: [2, 3, 4],
        status: "completed" as const,
        energy: 95,
    },
    {
        id: 2,
        title: "Data Structures",
        date: "Core CS",
        content: "Deep understanding of arrays, trees, graphs, hash maps, and computational efficiency. Core foundation of all software.",
        category: "Computer Science",
        icon: FileText,
        relatedIds: [1, 3],
        status: "completed" as const,
        energy: 85,
    },
    {
        id: 3,
        title: "Machine Learning",
        date: "AI Focus",
        content: "Studying supervised learning, neural networks, and model training. Actively building projects with scikit-learn and exploring deep learning.",
        category: "AI",
        icon: Zap,
        relatedIds: [1, 2, 4],
        status: "in-progress" as const,
        energy: 70,
    },
    {
        id: 4,
        title: "Automation",
        date: "Tools & Scripting",
        content: "Building automation bots, web scrapers, and tool pipelines using Python and Selenium. Twitter bot is a live example.",
        category: "Automation",
        icon: User,
        relatedIds: [1, 3, 5],
        status: "in-progress" as const,
        energy: 80,
    },
    {
        id: 5,
        title: "Tkinter",
        date: "GUI Development",
        content: "Creating polished desktop GUI applications in Python. Built the Kanye Quotes App and Password Manager with this.",
        category: "Development",
        icon: Monitor,
        relatedIds: [1, 4],
        status: "completed" as const,
        energy: 82,
    },
    {
        id: 6,
        title: "OOP",
        date: "Design Patterns",
        content: "Applying object-oriented architecture across projects — encapsulation, inheritance, polymorphism in Python and C++.",
        category: "Computer Science",
        icon: Clock,
        relatedIds: [1, 2],
        status: "completed" as const,
        energy: 88,
    },
]

export function RadialOrbitalTimelineDemo() {
    return <RadialOrbitalTimeline timelineData={timelineData} />
}
