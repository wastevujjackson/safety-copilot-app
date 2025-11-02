// Application constants

// App URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Platform owner email
export const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL;

// Session configuration
export const SESSION_CONFIG = {
  EXPIRES_IN_HOURS: 24,
  REFRESH_THRESHOLD_MINUTES: 30,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

// Rate limiting (requests per minute)
export const RATE_LIMITS = {
  ANONYMOUS: 10,
  USER: 60,
  ADMIN: 120,
  PLATFORM_OWNER: 300,
} as const;

// Token pricing (per 1k tokens)
export const TOKEN_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  STATIC: -1, // Never expire
  LONG: 86400, // 24 hours
  MEDIUM: 3600, // 1 hour
  SHORT: 300, // 5 minutes
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
} as const;
