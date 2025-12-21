"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, Loader2, CheckCircle, Shield, AlertTriangle, X } from "lucide-react"
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
            const res = await fetch("/api/settings/protection")
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
            const res = await fetch("/api/settings/protection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newValue }),
            })

            if (!res.ok) throw new Error("Failed to update")

            setProtectionEnabled(newValue)
            toast.success(newValue ? "Feedback protection ENABLED" : "Feedback protection DISABLED")
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

            toast.success("Password changed successfully!")
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
        if (!password) return { strength: 0, label: "" }
        let strength = 0
        if (password.length >= 6) strength++
        if (password.length >= 10) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"]
        const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"]
        return { strength, label: labels[strength], color: colors[strength] }
    }

    const passwordStrength = getPasswordStrength(passwords.new)

    return (
        <AdminSidebar>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
                <p className="text-slate-600 dark:text-white/60">Manage your account and system settings</p>
            </motion.div>

            <div className="max-w-2xl space-y-6">
                {/* Feedback Protection Toggle Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" />
                                Feedback Protection
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-white/40">
                                Control whether users can submit multiple feedbacks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {protectionEnabled ? (
                                            <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                                                <CheckCircle className="w-4 h-4" />
                                                Protection ENABLED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                                <AlertTriangle className="w-4 h-4" />
                                                Protection DISABLED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 dark:text-white/50 text-sm">
                                        {protectionEnabled
                                            ? "Users cannot submit multiple feedbacks from the same device."
                                            : "Users can submit unlimited feedbacks (testing mode)."}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleProtection}
                                    disabled={protectionLoading || protectionUpdating}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${protectionEnabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                                        } ${protectionUpdating ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${protectionEnabled ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    >
                                        {protectionUpdating && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                                    </span>
                                </button>
                            </div>

                            {/* Info box */}
                            <div className={`mt-4 p-3 rounded-lg text-sm ${protectionEnabled
                                ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                                : "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                                }`}>
                                {protectionEnabled ? (
                                    <p><strong>Exhibition Mode:</strong> Duplicate feedback prevention is active. Enable this during the actual exhibition.</p>
                                ) : (
                                    <p><strong>Testing Mode:</strong> Multiple feedbacks allowed for testing purposes. Remember to enable protection before the exhibition!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Profile Card */}
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" />
                            Profile
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-white/40">Your account information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                                {session?.user?.name?.[0] || "A"}
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-semibold text-lg">{session?.user?.name || "Admin"}</p>
                                <p className="text-slate-500 dark:text-white/60">{session?.user?.email}</p>
                                <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified Admin
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password Card */}
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-cyan-500" />
                            Change Password
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-white/40">Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current" className="text-slate-700 dark:text-white/80">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => { setPasswords({ ...passwords, current: e.target.value }); setErrors({ ...errors, current: "" }) }}
                                    placeholder="••••••••"
                                    className={`bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.current ? "border-red-500" : ""}`}
                                />
                                {errors.current && <p className="text-red-500 text-sm">{errors.current}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new" className="text-slate-700 dark:text-white/80">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => { setPasswords({ ...passwords, new: e.target.value }); setErrors({ ...errors, new: "" }) }}
                                    placeholder="••••••••"
                                    className={`bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.new ? "border-red-500" : ""}`}
                                />
                                {errors.new && <p className="text-red-500 text-sm">{errors.new}</p>}
                                {passwords.new && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex-1 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-white/60">{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm" className="text-slate-700 dark:text-white/80">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setErrors({ ...errors, confirm: "" }) }}
                                    placeholder="••••••••"
                                    className={`bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.confirm ? "border-red-500" : ""}`}
                                />
                                {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
                                {/* Password match indicator */}
                                {passwords.confirm && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {passwords.new === passwords.confirm ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-green-500">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4 text-red-500" />
                                                <span className="text-sm text-red-500">Passwords do not match</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminSidebar>
    )
}
