'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email?: string
  userMetadata?: {
    name?: string
    isAnonymous?: boolean
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInAnonymously: (name: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查当前会话
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          userMetadata: session.user.user_metadata
        })
      }
      setIsLoading(false)
    }

    checkSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            userMetadata: session.user.user_metadata
          })
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 匿名登录（最简单的方式）
  const signInAnonymously = async (name: string) => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: { name, isAnonymous: true }
      }
    })
    
    if (error) throw error
  }

  // 邮箱登录
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
  }

  // 邮箱注册
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, isAnonymous: false }
      }
    })
    
    if (error) throw error
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signInAnonymously,
      signInWithEmail,
      signUpWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 保护路由的 HOC
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth()
    const [showLogin, setShowLogin] = useState(false)

    useEffect(() => {
      if (!isLoading && !user) {
        setShowLogin(true)
      }
    }, [user, isLoading])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full"></div>
        </div>
      )
    }

    if (showLogin) {
      return <LoginPrompt onLogin={() => setShowLogin(false)} />
    }

    return <WrappedComponent {...props} />
  }
}

// 登录提示组件
function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInAnonymously } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setIsLoading(true)
    try {
      await signInAnonymously(name.trim())
      onLogin()
    } catch (error) {
      console.error('登录失败:', error)
      alert('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">时光手记</h1>
          <p className="text-stone-600">用 AI 记录人生故事</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4 text-center">
            开始创作
          </h2>
          <p className="text-stone-500 text-center mb-6">
            输入您的名字，立即开始记录珍贵记忆
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="您的名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
              required
            />
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-stone-800 text-white py-3 rounded-lg font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '进入中...' : '立即开始'}
            </button>
          </form>

          <p className="text-xs text-stone-400 text-center mt-6">
            无需注册，输入名字即可开始<br/>
            后续可随时绑定邮箱保存数据
          </p>
        </div>
      </div>
    </div>
  )
}
