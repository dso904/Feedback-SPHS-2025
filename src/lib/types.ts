// Database Types for the Feedback System

export interface Project {
    id: string
    name: string
    subject: string
    created_at: string
}

export interface Feedback {
    id: string
    project_id?: string
    subject?: string
    user_role: 'Guardian' | 'Ex-Student' | 'Student' | 'Teacher' | 'Other Guest'
    q1: number
    q2: number
    q3: number
    q4: number
    q5: number
    q6: number
    total: number
    percent: number
    comment?: string
    created_at: string
    // Joined data
    project?: Project
}

export interface Question {
    id: number
    q1: string
    q2: string
    q3: string
    q4: string
    q5: string
    q6: string
}

export interface Admin {
    id: string
    email: string
    name: string
}

// Form types
export interface FeedbackFormData {
    userRole: Feedback['user_role']
    projectId: string
    subject: string
    ratings: {
        q1: number
        q2: number
        q3: number
        q4: number
        q5: number
        q6: number
    }
    comment?: string
}

// User roles for the feedback form
export const USER_ROLES = [
    { value: 'Guardian', label: 'Guardian', icon: '👨‍👩‍👧' },
    { value: 'Ex-Student', label: 'Ex-Student', icon: '🎓' },
    { value: 'Student', label: 'Student', icon: '📚' },
    { value: 'Teacher', label: 'Teacher', icon: '👩‍🏫' },
    { value: 'Other Guest', label: 'Other Guest', icon: '👤' },
] as const

// Rating labels
export const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] as const

// Default questions (can be overridden from database)
export const DEFAULT_QUESTIONS = {
    q1: 'Topic Selection',
    q2: 'Communication & Presentation Skills',
    q3: 'Originality & Creativity',
    q4: 'Clarity',
    q5: 'Enthusiasm for the subject',
    q6: 'Overall rating',
}
