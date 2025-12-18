"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FolderKanban, MessageSquare, FileQuestion, Search } from "lucide-react"

interface EmptyStateProps {
    type: "projects" | "feedback" | "search" | "generic"
    title?: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}

const illustrations = {
    projects: {
        icon: FolderKanban,
        defaultTitle: "No Projects Yet",
        defaultDescription: "Create your first project to start collecting feedback",
    },
    feedback: {
        icon: MessageSquare,
        defaultTitle: "No Feedback Yet",
        defaultDescription: "Feedback submissions will appear here once visitors start rating",
    },
    search: {
        icon: Search,
        defaultTitle: "No Results Found",
        defaultDescription: "Try adjusting your search or filter criteria",
    },
    generic: {
        icon: FileQuestion,
        defaultTitle: "Nothing Here",
        defaultDescription: "This section is empty",
    },
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
    const { icon: Icon, defaultTitle, defaultDescription } = illustrations[type]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
        >
            {/* Animated illustration */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="relative mb-6"
            >
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-purple-500/5 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-cyan-500/10 animate-pulse delay-300" />
                </div>

                {/* Icon */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white/40" />
                </div>
            </motion.div>

            {/* Text */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-white mb-2"
            >
                {title || defaultTitle}
            </motion.h3>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/50 text-center max-w-sm mb-6"
            >
                {description || defaultDescription}
            </motion.p>

            {/* Action button */}
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        onClick={action.onClick}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                    >
                        {action.label}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}
