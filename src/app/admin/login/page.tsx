"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail, Loader2, Shield, ArrowLeft, Cpu, Zap, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Access denied: Invalid credentials")
            } else {
                toast.success("Access granted!")
                // Use hidden form POST to enable browser's form resubmission dialog on refresh
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = '/api/admin/enter'
                document.body.appendChild(form)
                form.submit()
            }
        } catch {
            toast.error("System error: Connection failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px] animate-pulse delay-700" />
                <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Radial vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.5)_70%,rgba(5,5,8,0.95)_100%)]" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 font-mono text-sm text-cyan-400/60 hover:text-cyan-400 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    EXIT TO MAIN
                </Link>

                {/* Login Card */}
                <div className="relative">
                    {/* Card border glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur-sm opacity-50" />

                    <div className="relative bg-[#0c0c16]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-500/60 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-500/60 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-500/60 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-500/60 rounded-br-2xl" />

                        {/* Header */}
                        <div className="text-center mb-8">
                            {/* Logo with holographic effect */}
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mx-auto mb-6 relative"
                            >
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-40 animate-pulse" />
                                <div className="relative w-20 h-20 rounded-2xl bg-[#0a0a12] border border-cyan-500/30 flex items-center justify-center">
                                    <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-lg" />
                                    {/* Scan line */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent rounded-2xl animate-pulse" />
                                </div>
                            </motion.div>

                            <h1 className="font-orbitron text-2xl font-bold text-white tracking-wider flex items-center justify-center gap-2">
                                <Shield className="w-6 h-6 text-cyan-400" />
                                ACCESS PORTAL
                            </h1>
                            <p className="font-mono text-xs text-white/50 mt-2 uppercase tracking-widest">
                                Authorization Required
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-mono text-xs text-white/60 uppercase tracking-wider flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-cyan-400" />
                                    Email ID
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder=""
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-futuristic h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-mono text-xs text-white/60 uppercase tracking-wider flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-purple-400" />
                                    Access Code
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="input-futuristic h-12 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 futuristic-btn text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        INITIATE ACCESS
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Status indicator */}
                        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/5">
                            <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }} />
                            <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
                                Secure Connection Established
                            </span>
                        </div>
                    </div>
                </div>

                {/* Security badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                >
                    <div className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                        <Cpu className="w-3 h-3" />
                        Encrypted • South Point Mission Control
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
