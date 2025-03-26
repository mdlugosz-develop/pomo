/**
 * Security and authentication constants
 * Centralized location for all security-related configuration
 */

// Cookie names
export const ACCESS_TOKEN_KEY = 'access_token'
export const LAST_ACTIVITY_KEY = 'last_activity'

// Session durations (in milliseconds)
export const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
export const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour

// Check and refresh intervals
export const INACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
export const TOKEN_REFRESH_INTERVAL = 23 * 60 * 60 * 1000 // 23 hours

// Auth settings
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_REQUIRES_SPECIAL_CHAR = true
export const PASSWORD_REQUIRES_NUMBER = true

// For development/testing - set to true to enable debug mode
export const DEBUG_AUTH = process.env.NODE_ENV === 'development'

// CSRF token settings (for future implementation)
export const CSRF_TOKEN_KEY = 'csrf_token'
export const CSRF_TOKEN_EXPIRY = 2 * 60 * 60 * 1000 // 2 hours 