"use client"

/**
 * Client-Side Device Fingerprinting Utility
 * 
 * Uses FingerprintJS to generate a unique device identifier.
 * This is used in combination with IP tracking to detect duplicate submissions.
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Cache the fingerprint to avoid regenerating on every call
let cachedFingerprint: string | null = null

/**
 * Get the device fingerprint using FingerprintJS
 * 
 * The fingerprint is a hash based on browser characteristics:
 * - Canvas rendering
 * - WebGL capabilities
 * - Audio context
 * - Installed fonts
 * - Screen resolution
 * - Timezone
 * - And more...
 * 
 * @returns Promise<string> - The visitor ID (fingerprint hash)
 */
export async function getDeviceFingerprint(): Promise<string> {
    // Return cached value if available
    if (cachedFingerprint) {
        return cachedFingerprint
    }

    try {
        // Load the FingerprintJS agent
        const fp = await FingerprintJS.load()

        // Get the visitor identifier
        const result = await fp.get()

        // Cache and return the visitorId
        cachedFingerprint = result.visitorId
        return result.visitorId
    } catch (error) {
        console.error('FingerprintJS error:', error)

        // Fallback: Use a stored random ID
        return getFallbackFingerprint()
    }
}

/**
 * Fallback fingerprint generator when FingerprintJS fails
 * Uses localStorage to persist a random UUID
 */
function getFallbackFingerprint(): string {
    const FALLBACK_KEY = 'sphs_device_fallback_id'

    try {
        let fallbackId = localStorage.getItem(FALLBACK_KEY)

        if (!fallbackId) {
            // Generate a new UUID
            fallbackId = crypto.randomUUID()
            localStorage.setItem(FALLBACK_KEY, fallbackId)
        }

        cachedFingerprint = fallbackId
        return fallbackId
    } catch {
        // If localStorage fails, generate a session-only ID
        const sessionId = crypto.randomUUID()
        cachedFingerprint = sessionId
        return sessionId
    }
}

/**
 * Clear the cached fingerprint (for testing purposes)
 */
export function clearFingerprintCache(): void {
    cachedFingerprint = null
}

/**
 * Store the fingerprint in localStorage for quick access
 * This is called after a successful submission
 */
export function storeFingerprint(fingerprint: string): void {
    try {
        localStorage.setItem('sphs_device_fingerprint', fingerprint)
    } catch (error) {
        console.warn('Failed to store fingerprint:', error)
    }
}

/**
 * Get stored fingerprint from localStorage
 * Returns null if not found
 */
export function getStoredFingerprint(): string | null {
    try {
        return localStorage.getItem('sphs_device_fingerprint')
    } catch {
        return null
    }
}

/**
 * Truncate fingerprint for display (privacy)
 * Example: a1b2c3d4e5f6g7h8 -> a1b2c3...h8
 */
export function truncateFingerprint(fingerprint: string): string {
    if (fingerprint.length <= 12) return fingerprint
    return `${fingerprint.slice(0, 6)}...${fingerprint.slice(-2)}`
}
