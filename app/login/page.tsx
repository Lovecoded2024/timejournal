'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const { signInAnonymously, signInWithEmail } = useAuth()
  const [activeTab, setActiveTab] = useState<'anonymous' | 'email'>('anonymous')
  
  // 匿名登录表单
  const [anonymousName, setAnonymousName] = useState('')
  
  // 邮箱登录表单
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnonymousLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!anonymousName.trim()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      await signInAnonymously(anonymousName.trim())
      router.push('/projects')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setIsLoading(true)
    setError('')
    
    try {
      await signInWithEmail(email, password)
      router.push('/projects')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">时光手记</h1>
          <p className="text-stone-600">用 AI 记录人生故事</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">欢迎回来</CardTitle>
            <CardDescription className="text-center">
              选择一种方式开始创作
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 标签切换 */}
            <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('anonymous')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'anonymous'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                快速开始
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'email'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                账号登录
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* 匿名登录表单 */}
            {activeTab === 'anonymous' && (
              <form onSubmit={handleAnonymousLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">您的名字</Label>
                  <Input
                    id="name"
                    placeholder="例如：张小明"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-700"
                  disabled={isLoading || !anonymousName.trim()}
                >
                  {isLoading ? '进入中...' : '立即开始'}
                </Button>
                <p className="text-xs text-stone-400 text-center">
                  无需注册，输入名字即可开始创作<br/>
                  数据会自动保存，后续可绑定邮箱
                </p>
              </form>
            )}

            {/* 邮箱登录表单 */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-700"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
                <div className="text-center">
                  <Link href="/signup" className="text-sm text-stone-600 hover:text-stone-800">
                    还没有账号？立即注册
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-700">
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
