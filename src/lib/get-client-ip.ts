/**
 * Server-Side IP Extraction Utility
 * 
 * Extracts the client's real IP address from various request headers.
 * Handles multiple deployment environments: Vercel, Cloudflare, Nginx, etc.
 */

/**
 * Get the client's IP address from request headers
 * 
 * Priority order:
 * 1. Vercel-specific headers (for Vercel deployment)
 * 2. Cloudflare headers (if using Cloudflare)
 * 3. Standard proxy headers (X-Forwarded-For, X-Real-IP)
 * 4. Fallback to 'unknown'
 * 
 * @param request - The incoming Request object
 * @returns The client's IP address or 'unknown'
 */
export function getClientIP(request: Request): string {
    const headers = request.headers

    // 1. Vercel-specific headers (highest priority for Vercel deployment)
    const vercelForwardedFor = headers.get('x-vercel-forwarded-for')
    if (vercelForwardedFor) {
        // Can be comma-separated, take the first (original client)
        return vercelForwardedFor.split(',')[0].trim()
    }

    // 2. Cloudflare connecting IP
    const cfConnectingIP = headers.get('cf-connecting-ip')
    if (cfConnectingIP) {
        return cfConnectingIP.trim()
    }

    // 3. Standard X-Forwarded-For header
    // Format: client, proxy1, proxy2, ...
    const xForwardedFor = headers.get('x-forwarded-for')
    if (xForwardedFor) {
        // Take the first IP (original client)
        return xForwardedFor.split(',')[0].trim()
    }

    // 4. X-Real-IP header (common in nginx setups)
    const xRealIP = headers.get('x-real-ip')
    if (xRealIP) {
        return xRealIP.trim()
    }

    // 5. True-Client-IP (used by some CDNs)
    const trueClientIP = headers.get('true-client-ip')
    if (trueClientIP) {
        return trueClientIP.trim()
    }

    // Fallback: Can't determine IP
    return 'unknown'
}

/**
 * Mask an IP address for display (privacy)
 * Example: 192.168.1.100 -> 192.168.1.xxx
 * 
 * @param ip - Full IP address
 * @returns Partially masked IP address
 */
export function maskIP(ip: string): string {
    if (ip === 'unknown') return ip

    // Handle localhost IPs - display clearly
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        return `${ip} (localhost)`
    }

    // Handle IPv4-mapped IPv6 localhost
    if (ip === '::ffff:127.0.0.1') {
        return '127.0.0.1 (localhost)'
    }

    // Handle IPv4
    if (ip.includes('.') && !ip.includes(':')) {
        const parts = ip.split('.')
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
        }
    }

    // Handle full IPv6 (mask last 2 segments for privacy)
    if (ip.includes(':')) {
        // For short localhost like ::1, just return it
        if (ip.length <= 3) {
            return ip
        }
        const parts = ip.split(':')
        if (parts.length > 2) {
            // Mask last two segments
            parts[parts.length - 1] = 'xxxx'
            if (parts.length > 1) {
                parts[parts.length - 2] = 'xxxx'
            }
            return parts.join(':')
        }
    }

    return ip
}

/**
 * Check if an IP is a localhost/development IP
 * 
 * @param ip - IP address to check
 * @returns True if it's a localhost IP
 */
export function isLocalhostIP(ip: string): boolean {
    const localhostIPs = [
        '127.0.0.1',
        '::1',
        'localhost',
        '0.0.0.0',
        '::ffff:127.0.0.1'
    ]
    return localhostIPs.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.')
}
