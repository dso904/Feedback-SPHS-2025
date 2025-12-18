import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(date))
}

// Calculate percentage from rating
export function calculatePercentage(total: number, maxTotal: number = 30) {
  return Math.round((total / maxTotal) * 100)
}

// Get rating color based on percentage
export function getRatingColor(percent: number) {
  if (percent >= 80) return 'text-green-500'
  if (percent >= 60) return 'text-yellow-500'
  if (percent >= 40) return 'text-orange-500'
  return 'text-red-500'
}

// Get rating label from score
export function getRatingLabel(score: number) {
  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return labels[score - 1] || 'Unknown'
}
