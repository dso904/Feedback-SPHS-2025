"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "danger" | "warning" | "default"
    onConfirm: () => Promise<void> | void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    onConfirm,
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    const variantStyles = {
        danger: {
            icon: <Trash2 className="w-6 h-6 text-red-400" />,
            bg: "bg-red-500/10",
            button: "bg-red-600 hover:bg-red-500",
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
            bg: "bg-amber-500/10",
            button: "bg-amber-600 hover:bg-amber-500",
        },
        default: {
            icon: null,
            bg: "bg-white/5",
            button: "bg-gradient-to-r from-purple-600 to-cyan-600",
        },
    }

    const styles = variantStyles[variant]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                <DialogHeader>
                    <AnimatePresence>
                        {styles.icon && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-14 h-14 rounded-full ${styles.bg} flex items-center justify-center mx-auto mb-4`}
                            >
                                {styles.icon}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <DialogTitle className="text-xl text-center">{title}</DialogTitle>
                    <DialogDescription className="text-white/60 text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex-1 ${styles.button}`}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
