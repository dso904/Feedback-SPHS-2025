"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, MessageSquare, BarChart3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs that float and shift */}
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/30 to-pink-600/20 rounded-full blur-[100px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/25 to-blue-600/20 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/20 to-fuchsia-500/15 rounded-full blur-[120px] animate-[float_12s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-indigo-500/20 to-purple-600/15 rounded-full blur-[80px] animate-[float_9s_ease-in-out_infinite_1s]" />

        {/* Swirling aurora effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-cyan-900/10 animate-[pulse_4s_ease-in-out_infinite]" />

        {/* Rotating gradient mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-30">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,purple,transparent,cyan,transparent)] rounded-full blur-[60px] animate-[spin_20s_linear_infinite]" />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.5)_70%,rgba(5,5,8,0.9)_100%)]" />
      </div>

      {/* Custom keyframe styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(10px) scale(1.05); }
          66% { transform: translateY(10px) translateX(-15px) scale(0.95); }
        }
      `}</style>


      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-gradient-to-r from-purple-950/80 via-slate-950/90 to-cyan-950/80 border-b border-purple-500/20">
        {/* Gradient line at bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo with animated gradient border */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
              <div className="relative p-1 rounded-xl bg-slate-900">
                <Image
                  src="/logo.png"
                  alt="South Point School Logo"
                  width={45}
                  height={45}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">South Point High School</h1>
              <p className="text-xs bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-medium">Biennial Exhibition 2025</p>
            </div>
          </div>
          <Link href="/admin/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-cyan-500/10 border border-white/10 hover:border-purple-500/30 transition-all">
              Admin Login
            </Button>
          </Link>
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
