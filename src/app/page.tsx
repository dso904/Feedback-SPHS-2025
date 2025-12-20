"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, MessageSquare, BarChart3, Moon, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"

// Typing animation component
function TypingAnimation({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsComplete(true)
        }
      }, 80) // Typing speed

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [text, delay])

  // Blinking cursor effect
  useEffect(() => {
    if (isComplete) {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 530)
      return () => clearInterval(cursorInterval)
    }
  }, [isComplete])

  return (
    <span className={className}>
      {displayedText}
      <span className={`inline-block w-[3px] h-[1em] bg-current ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
        |
      </span>
    </span>
  )
}

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background elements - darker and more subtle */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep purple glow */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        {/* Cyan accent glow */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        {/* Center gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/5 to-transparent rounded-full" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
              <Image
                src="/logo.png"
                alt="South Point School Logo"
                width={45}
                height={45}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">South Point High School</h1>
              <p className="text-xs text-purple-400/80">Biennial Exhibition 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            {mounted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-5 h-5 text-purple-400 group-hover:-rotate-12 transition-transform" />
                )}
              </motion.button>
            )}
            <Link href="/admin/login">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8 backdrop-blur-sm"
          >
            <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
            <span>Your Feedback is Valuable to Us!</span>
          </motion.div>

          {/* Main Heading with Typing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Welcome to the{" "}
              <span className="block mt-2">
                <TypingAnimation
                  text="Biennial Exhibition"
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                  delay={800}
                />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.5 }}
            className="text-lg text-gray-400/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Help us improve by sharing your thoughts on our exhibition projects.
            Your feedback helps our students grow and excel.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.8 }}
          >
            <Link href="/feedback">
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-2xl shadow-purple-500/20 group border border-purple-400/20 hover:border-purple-400/40 transition-all hover:scale-105"
              >
                Give Your Feedback
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.2 }}
            className="grid md:grid-cols-3 gap-5 mt-20"
          >
            <FeatureCard
              icon={<Star className="w-6 h-6" />}
              title="Rate Projects"
              description="Score projects on creativity, presentation, and more"
              gradient="from-purple-500 to-violet-600"
            />
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Leave Comments"
              description="Share detailed feedback and suggestions"
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Help Students"
              description="Your input helps students improve"
              gradient="from-cyan-500 to-blue-600"
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-16 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500/80 text-sm">
          © 2025 South Point High School. Team Hackminors. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300 group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
