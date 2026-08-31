// ============================================================
// Brent College LMS — Utility Functions
// ============================================================

/** Extract YouTube video ID from any YouTube URL format */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?/\s]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** Build a YouTube thumbnail URL */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/** Generate a unique activation code like BRENT-X7K2-9PQM */
export function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `BRENT-${rand(4)}-${rand(4)}`
}

/** Check if a content item is still within the 24-hour edit window */
export function isEditable(createdAt: string): boolean {
  const created = new Date(createdAt)
  const lockTime = new Date(created.getTime() + 24 * 60 * 60 * 1000)
  return new Date() < lockTime
}

/** Get remaining edit time as a human-readable string */
export function getEditTimeRemaining(createdAt: string): string {
  const created = new Date(createdAt)
  const lockTime = new Date(created.getTime() + 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffMs = lockTime.getTime() - now.getTime()
  if (diffMs <= 0) return 'Locked'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/** Check if a student's access has expired */
export function isAccessExpired(accessExpiresAt: string | null): boolean {
  if (!accessExpiresAt) return false
  return new Date() > new Date(accessExpiresAt)
}

/** Format a date as a readable string */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format a datetime as a readable string */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Get days remaining until a date */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

/** Get days since a date */
export function daysSince(dateStr: string): number {
  const past = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - past.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/** Calculate course completion percentage */
export function calcProgress(completedIds: string[], totalLessons: number): number {
  if (totalLessons === 0) return 0
  return Math.round((completedIds.length / totalLessons) * 100)
}

/** Truncate text to a maximum length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Create a synthetic email from an admission number */
export function admissionToEmail(admissionNumber: string): string {
  const clean = admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${clean}@eclatinstitute.internal`
}

/** Get initials from a full name */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

/** Pluralize a word */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + 's')
}

/** Deep clone an object */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/** Sanitize input strings to prevent XSS and injection attacks */
export function sanitizeInput(str: string): string {
  if (!str) return ''
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/** Validate safe URLs (http, https, blob, or relative paths) */
export function isSafeUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) return true
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
