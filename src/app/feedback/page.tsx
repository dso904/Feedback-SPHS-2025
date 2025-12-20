"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Check, Star, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { USER_ROLES, RATING_LABELS, DEFAULT_QUESTIONS } from "@/lib/types"
import { SuccessAnimation } from "@/components/success-animation"
import { hasSubmittedFeedback, markFeedbackSubmitted } from "@/lib/feedback-guard"
import ReCAPTCHA from "react-google-recaptcha"

interface Subject {
    id: string
    name: string
    icon: string
}

const STEPS = [
    { id: 1, title: "Who are you?" },
    { id: 2, title: "Select Subject" },
    { id: 3, title: "Rate & Comment" },
    { id: 4, title: "Confirm" },
]

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""

export default function FeedbackPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loadingSubjects, setLoadingSubjects] = useState(true)
    const [countdown, setCountdown] = useState(5)
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [checkingStatus, setCheckingStatus] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        userRole: "",
        subject: "",
        ratings: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
        comment: "",
    })

    // Check if user has already submitted feedback (only if protection is enabled)
    useEffect(() => {
        const checkProtectionAndSubmission = async () => {
            try {
                // First check if protection is enabled in admin settings
                const res = await fetch("/api/settings/protection")
                const data = await res.json()

                // Only enforce guard if protection is enabled
                if (data.enabled && hasSubmittedFeedback()) {
                    router.replace("/already-submitted")
                } else {
                    setCheckingStatus(false)
                }
            } catch {
                // If API fails, allow access (fail open for testing)
                setCheckingStatus(false)
            }
        }

        checkProtectionAndSubmission()
    }, [router])

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        try {
            const res = await fetch("/api/subjects")
            const data = await res.json()
            setSubjects(data || [])
        } catch (error) {
            console.error("Failed to fetch subjects:", error)
        } finally {
            setLoadingSubjects(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.userRole !== ""
            case 2: return formData.subject !== ""
            case 3: return Object.values(formData.ratings).every(r => r > 0)
            default: return true
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_role: formData.userRole,
                    subject: formData.subject,
                    q1: formData.ratings.q1,
                    q2: formData.ratings.q2,
                    q3: formData.ratings.q3,
                    q4: formData.ratings.q4,
                    q5: formData.ratings.q5,
                    q6: formData.ratings.q6,
                    comment: formData.comment,
                }),
            })

            if (!res.ok) throw new Error("Failed to submit")

            // Mark as submitted in localStorage/cookies to prevent re-submission
            markFeedbackSubmitted()

            // Show thank you screen
            setShowSuccess(true)
            setCountdown(5)

            // Start countdown then redirect to locked completion page
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        // Redirect to locked completion page
                        // Using replace() to prevent back navigation
                        window.location.replace("/complete")
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch {
            toast.error("Failed to submit feedback. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    // Show loading while checking submission status
    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    // If showing success, render thank you screen
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative flex items-center justify-center">
                {/* Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative z-10 text-center px-6"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                        <Check className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Thank You Text */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl lg:text-5xl font-bold text-white mb-4"
                    >
                        Thank You!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-white/70 mb-8 max-w-md mx-auto"
                    >
                        Your feedback has been submitted successfully. We appreciate your time and input!
                    </motion.p>

                    {/* School Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-3 mb-8"
                    >
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                        <span className="text-white/60 font-medium">South Point High School</span>
                    </motion.div>

                    {/* Countdown */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 inline-block"
                    >
                        <p className="text-white/50 text-sm">Redirecting in</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            {countdown} seconds
                        </p>
                    </motion.div>
                </motion.div>

                {/* Confetti Effect */}
                <SuccessAnimation show={true} onComplete={() => { }} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-4 lg:p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-xl" />
                        <span className="text-white font-semibold hidden sm:block">South Point High School</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-4 pb-12 lg:px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center ${currentStep >= step.id ? "text-purple-400" : "text-white/40"
                                        }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${currentStep > step.id
                                            ? "bg-purple-500 text-white"
                                            : currentStep === step.id
                                                ? "bg-purple-500/30 border-2 border-purple-500 text-white"
                                                : "bg-white/10 text-white/40"
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span className="text-xs hidden sm:block">{step.title}</span>
                                </div>
                            ))}
                        </div>
                        <Progress value={progress} className="h-2 bg-white/10" />
                    </div>

                    {/* Step Content */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {currentStep === 1 && (
                                    <StepOne
                                        value={formData.userRole}
                                        onChange={(role) => setFormData({ ...formData, userRole: role })}
                                    />
                                )}
                                {currentStep === 2 && (
                                    <StepTwo
                                        value={formData.subject}
                                        onChange={(subject) => setFormData({ ...formData, subject })}
                                        subjects={subjects}
                                        loading={loadingSubjects}
                                    />
                                )}
                                {currentStep === 3 && (
                                    <StepThree
                                        ratings={formData.ratings}
                                        comment={formData.comment}
                                        onChange={(ratings, comment) => setFormData({ ...formData, ratings: ratings as typeof formData.ratings, comment })}
                                    />
                                )}
                                {currentStep === 4 && (
                                    <StepFour
                                        formData={formData}
                                        onCaptchaChange={(verified) => setCaptchaVerified(verified)}
                                        siteKey={RECAPTCHA_SITE_KEY}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep((s) => s - 1)}
                                disabled={currentStep === 1}
                                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    onClick={() => setCurrentStep((s) => s + 1)}
                                    disabled={!canProceed()}
                                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !captchaVerified}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

// Step 1: User Role Selection
function StepOne({ value, onChange }: { value: string; onChange: (role: string) => void }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Who are you?</h2>
            <p className="text-white/60 mb-6">Select your role to help us understand your perspective</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {USER_ROLES.map((role) => (
                    <motion.button
                        key={role.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(role.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${value === role.value
                            ? "bg-purple-500/20 border-purple-500 text-white"
                            : "bg-white/5 border-white/10 text-white/80 hover:border-white/30"
                            }`}
                    >
                        <span className="text-2xl mb-2 block">{role.icon}</span>
                        <span className="font-medium text-sm">{role.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

// Step 2: Subject Selection
function StepTwo({ value, onChange, subjects, loading }: {
    value: string
    onChange: (subject: string) => void
    subjects: Subject[]
    loading: boolean
}) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                <p className="text-white/60">Loading subjects...</p>
            </div>
        )
    }

    if (subjects.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-white/60">No subjects available. Please contact admin.</p>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Select Subject</h2>
            <p className="text-white/60 mb-6">Choose the subject you want to give feedback for</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
                {subjects.map((subject) => (
                    <motion.button
                        key={subject.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(subject.name)}
                        className={`p-4 rounded-xl border-2 transition-all ${value === subject.name
                            ? "bg-cyan-500/20 border-cyan-500 text-white"
                            : "bg-white/5 border-white/10 text-white/80 hover:border-white/30"
                            }`}
                    >
                        <span className="text-2xl mb-2 block">{subject.icon || "📚"}</span>
                        <span className="font-medium text-sm">{subject.name}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

// Step 3: Ratings & Comment
function StepThree({
    ratings,
    comment,
    onChange,
}: {
    ratings: Record<string, number>
    comment: string
    onChange: (ratings: Record<string, number>, comment: string) => void
}) {
    const questions = Object.entries(DEFAULT_QUESTIONS)

    const handleRating = (key: string, value: number) => {
        onChange({ ...ratings, [key]: value }, comment)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Rate Your Experience</h2>
            <p className="text-white/60 mb-6">Please rate each aspect from 1 to 5 stars</p>

            <div className="space-y-6">
                {questions.map(([key, question]) => (
                    <div key={key}>
                        <p className="text-white mb-2 text-sm">{question}</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRating(key, star)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (ratings[key] || 0)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-white/30"
                                            }`}
                                    />
                                </motion.button>
                            ))}
                            <span className="text-white/60 text-sm ml-2 self-center">
                                {ratings[key] ? RATING_LABELS[ratings[key] - 1] : ""}
                            </span>
                        </div>
                    </div>
                ))}

                <div>
                    <p className="text-white mb-2 text-sm">Additional Comments (Optional)</p>
                    <Textarea
                        value={comment}
                        onChange={(e) => onChange(ratings, e.target.value)}
                        placeholder="Share any additional thoughts..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-24"
                    />
                </div>
            </div>
        </div>
    )
}

// Step 4: Confirmation with CAPTCHA
function StepFour({
    formData,
    onCaptchaChange,
    siteKey
}: {
    formData: { userRole: string; subject: string; ratings: Record<string, number>; comment: string }
    onCaptchaChange: (verified: boolean) => void
    siteKey: string
}) {
    const avgRating = Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 6
    const percent = Math.round((avgRating / 5) * 100)

    const handleCaptcha = (token: string | null) => {
        onCaptchaChange(!!token)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Feedback</h2>
            <p className="text-white/60 mb-6">Please review your feedback before submitting</p>

            <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-white/60 text-sm">Your Role</p>
                            <p className="text-white font-medium">{formData.userRole}</p>
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Subject</p>
                            <p className="text-white font-medium">{formData.subject}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-3">Your Ratings</p>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 ${star <= Math.round(avgRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-white/30"
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{percent}%</p>
                            <p className="text-white/60 text-sm">Overall Score</p>
                        </div>
                    </div>
                </div>

                {formData.comment && (
                    <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-2">Your Comment</p>
                        <p className="text-white/80 text-sm">{formData.comment}</p>
                    </div>
                )}

                {/* reCAPTCHA */}
                <div className="bg-white/5 rounded-xl p-4 flex flex-col items-center">
                    <p className="text-white/60 text-sm mb-3 text-center">Verify you&apos;re human</p>
                    {siteKey ? (
                        <ReCAPTCHA
                            sitekey={siteKey}
                            onChange={handleCaptcha}
                            theme="dark"
                        />
                    ) : (
                        <p className="text-yellow-400 text-sm">⚠️ reCAPTCHA not configured</p>
                    )}
                </div>
            </div>
        </div>
    )
}
