'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserMenu } from '@/components/auth/UserMenu'
import { getProjects, createProject } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { BiographyProject } from '@/types'

export default function ProjectsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [projects, setProjects] = useState<BiographyProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      loadProjects()
    }
  }, [user, authLoading, router])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      // 只显示当前用户的项目
      const userProjects = data.filter(p => p.userId === user?.id)
      setProjects(userProjects)
    } catch (err) {
      console.error('加载项目失败:', err)
      setError('加载项目失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  // 快速创建示例项目（演示用）
  const createDemoProject = async () => {
    if (!user) return
    
    try {
      const newProject = await createProject({
        userId: user.id,
        subjectName: '示例传记项目',
        subjectGender: 'male',
        projectType: 'family',
        status: 'draft',
        progressPercent: 0,
        projectGoal: '这是一个示例项目，用于演示功能'
      })
      
      router.push(`/projects/${newProject.id}`)
    } catch (err) {
      console.error('创建项目失败:', err)
      alert('创建失败，请重试')
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      interviewing: '访谈中',
      reviewing: '审核中',
      completed: '已完成'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'bg-stone-200 text-stone-700',
      interviewing: 'bg-blue-100 text-blue-700',
      reviewing: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700'
    }
    return colorMap[status] || 'bg-stone-200'
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full mx-auto"></div>
          <p className="mt-4 text-stone-600">加载中...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={loadProjects} className="mt-4">
            重试
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">我的传记项目</h1>
            <p className="text-stone-600 mt-1">管理和继续您的传记创作</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/projects/new">
              <Button className="bg-stone-800 hover:bg-stone-700">
                + 创建新项目
              </Button>
            </Link>
            <UserMenu />
          </div>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">
                还没有传记项目
              </h3>
              <p className="text-stone-600 mb-6">
                开始创建第一个传记项目，记录珍贵的人生故事
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/projects/new">
                  <Button className="bg-stone-800 hover:bg-stone-700">
                    创建传记项目
                  </Button>
                </Link>
                <Button variant="outline" onClick={createDemoProject}>
                  创建示例项目
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.subjectName}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <CardDescription>
                      {project.projectType === 'self' ? '为自己创建' : '为家人创建'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.subjectBirthDate && (
                        <div className="text-sm text-stone-600">
                          <span className="text-stone-400">出生日期：</span>
                          {new Date(project.subjectBirthDate).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                      {project.subjectBirthPlace && (
                        <div className="text-sm text-stone-600">
                          <span className="text-stone-400">出生地：</span>
                          {project.subjectBirthPlace}
                        </div>
                      )}
                      {project.projectGoal && (
                        <div className="text-sm text-stone-600 line-clamp-2">
                          <span className="text-stone-400">寄语：</span>
                          {project.projectGoal}
                        </div>
                      )}
                      
                      {/* 进度条 */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-stone-500 mb-1">
                          <span>完成度</span>
                          <span>{project.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                          <div
                            className="bg-stone-800 h-2 rounded-full transition-all"
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-stone-400 pt-2">
                        创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 创建新项目的卡片 */}
            <Link href="/projects/new">
              <Card className="h-full border-dashed border-2 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-center min-h-[250px]">
                <CardContent className="text-center">
                  <div className="text-4xl mb-2">+</div>
                  <p className="text-stone-600 font-medium">创建新项目</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
