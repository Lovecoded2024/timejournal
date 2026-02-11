'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()
  const { signUpWithEmail } = useAuth()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await signUpWithEmail(email, password, name)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-stone-800 mb-2">时光手记</h1>
            <p className="text-stone-600">用 AI 记录人生故事</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">✓ 注册成功</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-stone-600 mb-6">
                请查看您的邮箱，点击验证链接完成注册
              </p>
              <Link href="/login">
                <Button className="bg-stone-800 hover:bg-stone-700">
                  去登录
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
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
            <CardTitle className="text-center">创建账号</CardTitle>
            <CardDescription className="text-center">
              注册后可随时访问您的传记项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">您的名字</Label>
                <Input
                  id="name"
                  placeholder="例如：张小明"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
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
                  placeholder="至少6位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-stone-800 hover:bg-stone-700"
                disabled={isLoading}
              >
                {isLoading ? '注册中...' : '创建账号'}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-800">
                已有账号？立即登录
              </Link>
            </div>
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
