"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, MessageSquare, BarChart3, Sparkles, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Futuristic typing animation component with holographic cursor
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
      }, 70) // Slightly faster for dramatic effect

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [text, delay])

  useEffect(() => {
    if (isComplete) {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev)
      }, 450)
      return () => clearInterval(cursorInterval)
    }
  }, [isComplete])

  return (
    <span className={className}>
      {displayedText}
      {/* Futuristic holographic cursor */}
      <span className="relative inline-block ml-1 align-middle">
        {/* Glow effect */}
        <span className={`absolute -inset-1 bg-cyan-400 blur-md ${showCursor ? 'opacity-60' : 'opacity-0'} transition-opacity duration-200`} />
        {/* Main cursor bar */}
        <span className={`relative inline-block w-[4px] h-[0.9em] bg-gradient-to-b from-cyan-300 via-cyan-400 to-purple-500 rounded-sm ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff]`} />
        {/* Scan line effect */}
        <span className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/50 via-transparent to-transparent animate-pulse ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </span>
  )
}

export default function HomePage() {

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Futuristic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/25 to-pink-600/15 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-600/15 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/15 to-fuchsia-500/10 rounded-full blur-[120px] animate-[float_12s_ease-in-out_infinite]" />

        {/* Rotating gradient mesh */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-20">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(0,240,255,0.3),transparent,rgba(168,85,247,0.3),transparent)] rounded-full blur-[80px] animate-[spin_25s_linear_infinite]" />
        </div>

        {/* Futuristic grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Horizontal scan lines */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,240,255,0.01)_2px,rgba(0,240,255,0.01)_4px)]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.4)_60%,rgba(5,5,8,0.9)_100%)]" />
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); }
          33% { transform: translateY(-20px) translateX(10px) scale(1.05); }
          66% { transform: translateY(10px) translateX(-15px) scale(0.95); }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-[#0a0a12]/80 border-b border-cyan-500/10">
        {/* Top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        {/* Bottom edge glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo with neon glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500" />
              <div className="relative p-1.5 rounded-xl bg-[#0a0a12] border border-cyan-500/20">
                <Image
                  src="/logo.png"
                  alt="South Point School Logo"
                  width={42}
                  height={42}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">South Point High School</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-xs text-cyan-400/80 font-mono uppercase tracking-widest">Exhibition 2025</p>
              </div>
            </div>
          </div>
          <Link href="/admin/login">
            <button className="relative group px-5 py-2.5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400/60 transition-colors duration-300" />
              <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-400/60 rounded-tl" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-400/60 rounded-br" />
              <span className="relative font-mono text-xs text-cyan-400/80 group-hover:text-cyan-300 uppercase tracking-widest transition-colors">
                Admin Access
              </span>
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-cyan-400/90 uppercase tracking-wider">System Online • Ready for Feedback</span>
          </motion.div>

          {/* Main Heading with Typing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8"
          >
            {/* "Welcome to the" - Orbitron font */}
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-wider mb-4">
              WELCOME TO THE
            </h1>
            {/* "Biennial Exhibition" - with typing animation */}
            <div className="relative">
              {/* Underline glow effect */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-sm" />
              <span className="font-orbitron text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
                <TypingAnimation
                  text="BIENNIAL EXHIBITION"
                  className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                  delay={800}
                />
              </span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.5 }}
            className="text-lg text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed"
          >
            Help us improve by sharing your thoughts on our exhibition projects.
            Your feedback helps our students grow and excel.
          </motion.p>

          {/* CTA Button - Ultra Futuristic */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.8, type: "spring" }}
            className="relative inline-block"
          >
            {/* Outer animated ring */}
            <div className="absolute -inset-4 rounded-2xl">
              <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-purple-500/10 scale-105 animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            <Link href="/feedback">
              <button className="relative group px-12 py-6 overflow-hidden">
                {/* Outer glow pulse */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-all duration-500 animate-pulse" />

                {/* Main glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500" />

                {/* Button background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-xl" />

                {/* Inner darker layer for depth */}
                <div className="absolute inset-[2px] bg-gradient-to-b from-[#0c0c16]/40 to-transparent rounded-[10px]" />

                {/* Scan line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ transform: 'translateY(-100%)' }} />
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl" />

                {/* Border with glow */}
                <div className="absolute inset-0 border-2 border-white/30 rounded-xl group-hover:border-white/50 transition-colors" />

                {/* Corner brackets - all 4 corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white/70 rounded-tl-lg group-hover:border-cyan-300 transition-colors" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white/70 rounded-tr-lg group-hover:border-cyan-300 transition-colors" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white/70 rounded-bl-lg group-hover:border-pink-300 transition-colors" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white/70 rounded-br-lg group-hover:border-pink-300 transition-colors" />

                {/* Content */}
                <span className="relative flex items-center gap-4 text-white font-orbitron font-bold text-lg tracking-wider">
                  <Zap className="w-5 h-5 animate-pulse" />
                  GIVE YOUR FEEDBACK
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
            </Link>

            {/* Status text below button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Feedback Portal Active</span>
            </motion.div>
          </motion.div>

          {/* Feature Cards - Futuristic */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 3.2 }}
            className="mt-24"
          >
            {/* Section Header */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <span className="font-mono text-xs text-cyan-400/60 uppercase tracking-[0.3em]">What You Can Do</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Star className="w-6 h-6" />}
                title="Rate Projects"
                description="Score projects on creativity, presentation, and more"
                color="cyan"
                index={0}
              />
              <FeatureCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Leave Comments"
                description="Share detailed feedback and suggestions"
                color="purple"
                index={1}
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Help Students"
                description="Your input helps students improve"
                color="pink"
                index={2}
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-16 bg-[#0a0a12]/50 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
            © 2025 South Point High School • Team Hackminors
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color, index }: { icon: React.ReactNode; title: string; description: string; color: "cyan" | "purple" | "pink"; index: number }) {
  const colors = {
    cyan: {
      border: "border-cyan-500/30",
      hoverBorder: "hover:border-cyan-400/60",
      icon: "from-cyan-500 to-cyan-600",
      glow: "group-hover:shadow-cyan-500/30",
      accent: "bg-cyan-400",
      text: "text-cyan-400"
    },
    purple: {
      border: "border-purple-500/30",
      hoverBorder: "hover:border-purple-400/60",
      icon: "from-purple-500 to-purple-600",
      glow: "group-hover:shadow-purple-500/30",
      accent: "bg-purple-400",
      text: "text-purple-400"
    },
    pink: {
      border: "border-pink-500/30",
      hoverBorder: "hover:border-pink-400/60",
      icon: "from-pink-500 to-pink-600",
      glow: "group-hover:shadow-pink-500/30",
      accent: "bg-pink-400",
      text: "text-pink-400"
    },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.4 + index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative p-6 rounded-xl bg-[#0c0c16]/80 border ${c.border} ${c.hoverBorder} backdrop-blur-xl group transition-all duration-500 overflow-hidden ${c.glow} hover:shadow-2xl cursor-pointer`}
    >
      {/* Animated scan line */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ color: color === 'cyan' ? '#00f0ff' : color === 'purple' ? '#a855f7' : '#ec4899' }} />
      </div>

      {/* Top edge glow line */}
      <div className={`absolute top-0 left-4 right-4 h-px ${c.accent} opacity-20 group-hover:opacity-50 transition-opacity`} />

      {/* Corner brackets - more prominent */}
      <div className={`absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 ${c.border} group-hover:border-current rounded-tl-lg transition-colors`} style={{ borderColor: 'inherit' }} />
      <div className={`absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 ${c.border} group-hover:border-current rounded-tr-lg transition-colors`} />
      <div className={`absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 ${c.border} group-hover:border-current rounded-bl-lg transition-colors`} />
      <div className={`absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 ${c.border} group-hover:border-current rounded-br-lg transition-colors`} />

      {/* Icon with glow effect */}
      <div className="relative mb-5">
        <div className={`absolute -inset-2 bg-gradient-to-br ${c.icon} rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
        <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      {/* Title with accent */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${c.accent} group-hover:animate-pulse`} />
        <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors">{description}</p>

      {/* Bottom status bar */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className={`font-mono text-[10px] ${c.text} uppercase tracking-wider opacity-60`}>Module {String(index + 1).padStart(2, '0')}</span>
          <div className="flex items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${c.accent} animate-pulse`} />
            <span className="font-mono text-[10px] text-white/30 uppercase">Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

