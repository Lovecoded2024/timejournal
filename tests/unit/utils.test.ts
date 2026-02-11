import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('cn utility', () => {
  it('should merge class names correctly', async () => {
    const { cn } = await import('@/lib/utils')
    const result = cn('base-class', 'additional-class')
    expect(result).toBe('base-class additional-class')
  })

  it('should handle conditional classes', async () => {
    const { cn } = await import('@/lib/utils')
    const isActive = true
    const result = cn('base', isActive && 'active', !isActive && 'inactive')
    expect(result).toBe('base active')
  })

  it('should handle tailwind merge conflicts', async () => {
    const { cn } = await import('@/lib/utils')
    const result = cn('px-2 py-1', 'px-4')
    // px-4 should override px-2
    expect(result).toContain('px-4')
    expect(result).not.toContain('px-2')
  })

  it('should filter out falsy values', async () => {
    const { cn } = await import('@/lib/utils')
    const result = cn('base', false && 'hidden', null, undefined, 'visible')
    expect(result).toBe('base visible')
  })
})
