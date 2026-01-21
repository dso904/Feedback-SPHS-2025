"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, Loader2, CheckCircle, Shield, AlertTriangle, X, Settings, Cpu, Zap, Eye, EyeOff } from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { toast } from "sonner"

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({ current: "", new: "", confirm: "" })

    // Protection toggle state
    const [protectionEnabled, setProtectionEnabled] = useState(false)
    const [protectionLoading, setProtectionLoading] = useState(true)
    const [protectionUpdating, setProtectionUpdating] = useState(false)

    // Password visibility toggle (current and new share the same toggle)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    // Fetch protection setting on mount
    useEffect(() => {
        fetchProtectionSetting()
    }, [])

    const fetchProtectionSetting = async () => {
        try {
            const res = await fetch(`/api/settings/protection?t=${Date.now()}`, {
                cache: "no-store"
            })
            const data = await res.json()
            setProtectionEnabled(data.enabled || false)
        } catch (error) {
            console.error("Failed to fetch protection setting:", error)
        } finally {
            setProtectionLoading(false)
        }
    }

    const toggleProtection = async () => {
        setProtectionUpdating(true)
        try {
            const newValue = !protectionEnabled
            const res = await fetch(`/api/settings/protection?t=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({ enabled: newValue }),
            })

            if (!res.ok) throw new Error("Failed to update")

            setProtectionEnabled(newValue)
            toast.success(newValue ? "Shield ACTIVATED" : "Shield DEACTIVATED")
        } catch {
            toast.error("Failed to update protection setting")
        } finally {
            setProtectionUpdating(false)
        }
    }

    const validatePasswords = () => {
        const newErrors = { current: "", new: "", confirm: "" }
        let isValid = true

        if (!passwords.current) {
            newErrors.current = "Current password is required"
            isValid = false
        }

        if (!passwords.new) {
            newErrors.new = "New password is required"
            isValid = false
        } else if (passwords.new.length < 6) {
            newErrors.new = "Password must be at least 6 characters"
            isValid = false
        }

        if (passwords.new !== passwords.confirm) {
            newErrors.confirm = "Passwords don't match"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validatePasswords()) return

        setLoading(true)
        try {
            const res = await fetch("/api/admin/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.error === "Current password is incorrect") {
                    setErrors({ ...errors, current: "Current password is incorrect" })
                } else {
                    toast.error(data.error || "Failed to update password")
                }
                return
            }

            toast.success("Access codes updated successfully!")
            setPasswords({ current: "", new: "", confirm: "" })
            setErrors({ current: "", new: "", confirm: "" })
        } catch {
            toast.error("Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: "", color: "" }
        let strength = 0
        if (password.length >= 6) strength++
        if (password.length >= 10) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        const labels = ["", "WEAK", "FAIR", "GOOD", "STRONG", "MAXIMUM"]
        const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-cyan-500", "bg-green-500"]
        return { strength, label: labels[strength], color: colors[strength] }
    }

    const passwordStrength = getPasswordStrength(passwords.new)

    return (
        <AdminSidebar>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">System Configuration</span>
                </div>
                <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                    SYSTEM CONFIG
                </h1>
                <p className="font-mono text-white/50 text-sm mt-1">Manage security protocols and access credentials</p>
            </motion.div>

            <div className="max-w-2xl space-y-6">
                {/* Feedback Protection Toggle */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="data-module p-5 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${protectionEnabled ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                                    <Shield className={`w-5 h-5 ${protectionEnabled ? 'text-green-400' : 'text-amber-400'}`} />
                                </div>
                                <div>
                                    <h3 className="font-orbitron text-sm text-white tracking-wide">DEFENSE SHIELD</h3>
                                    <p className="font-mono text-xs text-white/40">Duplicate feedback prevention</p>
                                </div>
                            </div>
                        </div>

                        {/* Toggle Section */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${protectionEnabled ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {protectionEnabled ? (
                                        <span className="flex items-center gap-1.5 font-mono text-sm text-green-400">
                                            <Zap className="w-4 h-4" />
                                            SHIELD ACTIVE
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 font-mono text-sm text-amber-400">
                                            <AlertTriangle className="w-4 h-4" />
                                            SHIELD OFFLINE
                                        </span>
                                    )}
                                </div>
                                <p className="font-mono text-xs text-white/50">
                                    {protectionEnabled
                                        ? "Duplicate entries blocked per device"
                                        : "Unlimited submissions allowed (testing)"}
                                </p>
                            </div>
                            <button
                                onClick={toggleProtection}
                                disabled={protectionLoading || protectionUpdating}
                                className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0a0a12] ${protectionEnabled
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-white/10 border border-white/20"
                                    } ${protectionUpdating ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                            >
                                <span
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 flex items-center justify-center ${protectionEnabled ? "translate-x-8" : "translate-x-0"
                                        }`}
                                >
                                    {protectionUpdating && <Loader2 className="w-3 h-3 animate-spin text-slate-600" />}
                                </span>
                            </button>
                        </div>

                        {/* Info box */}
                        <div className={`mt-4 p-3 rounded-lg font-mono text-xs ${protectionEnabled
                            ? "bg-green-500/5 border border-green-500/20 text-green-400"
                            : "bg-amber-500/5 border border-amber-500/20 text-amber-400"
                            }`}>
                            {protectionEnabled ? (
                                <p><span className="text-white/60">// MODE:</span> EXHIBITION — Enable this during actual event</p>
                            ) : (
                                <p><span className="text-white/60">// MODE:</span> TESTING — Remember to activate before exhibition!</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="data-module p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-orbitron text-sm text-white tracking-wide">OPERATOR PROFILE</h3>
                                <p className="font-mono text-xs text-white/40">Current session information</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-50 animate-pulse" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-orbitron text-white text-2xl font-bold border-2 border-[#0a0a12]">
                                    {session?.user?.name?.[0]?.toUpperCase() || "A"}
                                </div>
                            </div>
                            <div>
                                <p className="font-mono text-lg text-white">{session?.user?.name || "Admin"}</p>
                                <p className="font-mono text-xs text-white/50">{session?.user?.email}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }} />
                                    <span className="font-mono text-[10px] text-green-400 uppercase tracking-wider">Authorized</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Change Password Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="data-module p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Lock className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-orbitron text-sm text-white tracking-wide">ACCESS CODES</h3>
                                <p className="font-mono text-xs text-white/40">Update security credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current" className="font-mono text-xs text-white/60 uppercase tracking-wider">Current Access Code</Label>
                                <div className="relative">
                                    <Input
                                        id="current"
                                        type={showPassword ? "text" : "password"}
                                        value={passwords.current}
                                        onChange={(e) => { setPasswords({ ...passwords, current: e.target.value }); setErrors({ ...errors, current: "" }) }}
                                        placeholder="••••••••"
                                        className={`input-futuristic pr-12 ${errors.current ? "border-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.current && <p className="font-mono text-xs text-red-400">{errors.current}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new" className="font-mono text-xs text-white/60 uppercase tracking-wider">New Access Code</Label>
                                <Input
                                    id="new"
                                    type={showPassword ? "text" : "password"}
                                    value={passwords.new}
                                    onChange={(e) => { setPasswords({ ...passwords, new: e.target.value }); setErrors({ ...errors, new: "" }) }}
                                    placeholder="••••••••"
                                    className={`input-futuristic ${errors.new ? "border-red-500" : ""}`}
                                />
                                {errors.new && <p className="font-mono text-xs text-red-400">{errors.new}</p>}
                                {passwords.new && (
                                    <div className="flex items-center gap-3 mt-2 p-2 rounded-lg bg-white/5">
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${passwordStrength.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <span className={`font-mono text-[10px] ${passwordStrength.strength >= 4 ? 'text-cyan-400' : passwordStrength.strength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="font-mono text-xs text-white/60 uppercase tracking-wider">Confirm Access Code</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setErrors({ ...errors, confirm: "" }) }}
                                    placeholder="••••••••"
                                    className={`input-futuristic ${errors.confirm ? "border-red-500" : ""}`}
                                />
                                {errors.confirm && <p className="font-mono text-xs text-red-400">{errors.confirm}</p>}
                                {passwords.confirm && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {passwords.new === passwords.confirm ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <span className="font-mono text-xs text-green-400">CODES MATCH</span>
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4 text-red-400" />
                                                <span className="font-mono text-xs text-red-400">CODES MISMATCH</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" disabled={loading} className="w-full futuristic-btn py-3">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        UPDATING...
                                    </>
                                ) : (
                                    <>
                                        <Cpu className="w-4 h-4 mr-2" />
                                        UPDATE ACCESS CODES
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AdminSidebar>
    )
}
