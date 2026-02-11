import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Mock Supabase
const mockSignInAnonymously = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: (...args: any[]) => mockSignInAnonymously(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
  },
}))

describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default: no session
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('should initialize with no user', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('should handle anonymous sign in', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: {
        user: {
          id: 'anon-user-id',
          email: null,
          user_metadata: { name: 'Test User', isAnonymous: true },
        },
      },
      error: null,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.signInAnonymously('Test User')
    })

    expect(mockSignInAnonymously).toHaveBeenCalledWith({
      options: { data: { name: 'Test User', isAnonymous: true } },
    })
  })

  it('should handle email sign in', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'email-user-id',
          email: 'test@example.com',
          user_metadata: { name: 'Test User', isAnonymous: false },
        },
      },
      error: null,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password')
    })

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('should handle sign up', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'new-user-id',
          email: 'new@example.com',
          user_metadata: { name: 'New User', isAnonymous: false },
        },
      },
      error: null,
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.signUpWithEmail('new@example.com', 'password', 'New User')
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: { data: { name: 'New User', isAnonymous: false } },
    })
  })

  it('should handle sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockSignOut).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  it('should handle auth errors', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: null,
      error: { message: 'Auth failed' },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await expect(
      result.current.signInAnonymously('Test')
    ).rejects.toThrow('Auth failed')
  })
})
