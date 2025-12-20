// Utility to track feedback submission using multiple storage methods

const STORAGE_KEY = "sphs_feedback_submitted"
const COOKIE_NAME = "sphs_feedback_done"
const EXPIRY_DAYS = 30 // Cookie expires after 30 days

/**
 * Check if user has already submitted feedback
 */
export function hasSubmittedFeedback(): boolean {
    if (typeof window === "undefined") return false

    // Check localStorage
    const localStorageFlag = localStorage.getItem(STORAGE_KEY)
    if (localStorageFlag === "true") return true

    // Check sessionStorage (backup)
    const sessionStorageFlag = sessionStorage.getItem(STORAGE_KEY)
    if (sessionStorageFlag === "true") return true

    // Check cookie
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=")
        if (name === COOKIE_NAME && value === "true") return true
    }

    return false
}

/**
 * Mark feedback as submitted - stores in multiple places for redundancy
 */
export function markFeedbackSubmitted(): void {
    if (typeof window === "undefined") return

    // Set localStorage
    try {
        localStorage.setItem(STORAGE_KEY, "true")
    } catch (e) {
        console.warn("localStorage not available:", e)
    }

    // Set sessionStorage (for current session, survives page refresh)
    try {
        sessionStorage.setItem(STORAGE_KEY, "true")
    } catch (e) {
        console.warn("sessionStorage not available:", e)
    }

    // Set cookie with expiry
    const expires = new Date()
    expires.setDate(expires.getDate() + EXPIRY_DAYS)
    document.cookie = `${COOKIE_NAME}=true; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
}

/**
 * Clear the submission flag (for testing/admin purposes only)
 */
export function clearFeedbackSubmission(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
