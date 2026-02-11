'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProjectById, getUploadsByProject, getSessionsByProject } from '@/lib/supabase'
import { BiographyProject, Upload, InterviewSession } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<BiographyProject | null>(null)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      const [projectData, uploadsData, sessionsData] = await Promise.all([
        getProjectById(projectId),
        getUploadsByProject(projectId),
        getSessionsByProject(projectId)
      ])
      
      setProject(projectData)
      setUploads(uploadsData)
      setSessions(sessionsData)
    } catch (err) {
      console.error('加载项目数据失败:', err)
      setError('加载失败，请刷新重试')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full mx-auto"></div>
          <p className="mt-4 text-stone-600">加载中...</p>
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error || '项目不存在'}</p>
          <Link href="/projects">
            <Button className="mt-4">返回项目列表</Button>
          </Link>
        </div>
      </main>
    )
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="container mx-auto px-4">
        {/* 返回按钮 */}
        <Link href="/projects" className="text-stone-600 hover:text-stone-800 mb-6 inline-block">
          ← 返回项目列表
        </Link>

        {/* 项目头部 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">{project.subjectName}的传记</h1>
              <p className="text-stone-600 mt-2">{project.projectGoal || '暂无项目寄语'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
          </div>

          {/* 进度条 */}
          <div className="mt-6 max-w-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-600">项目进度</span>
              <span className="font-medium">{project.progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3">
              <div
                className="bg-stone-800 h-3 rounded-full transition-all"
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 操作卡片 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href={`/projects/${projectId}/upload`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">📸 上传资料</CardTitle>
                <CardDescription>
                  已上传 {uploads.length} 个文件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  上传照片、日记、信件等，AI 将自动分析
                </p>
                <Button variant="outline" className="w-full">
                  管理资料
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/projects/${projectId}/interview`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">🎙️ 开始访谈</CardTitle>
                <CardDescription>
                  已完成 {sessions.length} 轮对话
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  与 AI 进行深度对话，挖掘人生故事
                </p>
                <Button className="w-full bg-stone-800 hover:bg-stone-700">
                  {sessions.length > 0 ? '继续访谈' : '开始访谈'}
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/projects/${projectId}/ebook`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">📖 查看传记</CardTitle>
                <CardDescription>
                  预览当前成书效果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  查看 AI 整理的传记内容和时间线
                </p>
                <Button variant="outline" className="w-full">
                  预览传记
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>传主基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {project.subjectBirthDate && (
                <div>
                  <span className="text-stone-500">出生日期：</span>
                  <span className="text-stone-800">{new Date(project.subjectBirthDate).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
              {project.subjectBirthPlace && (
                <div>
                  <span className="text-stone-500">出生地：</span>
                  <span className="text-stone-800">{project.subjectBirthPlace}</span>
                </div>
              )}
              <div>
                <span className="text-stone-500">性别：</span>
                <span className="text-stone-800">{project.subjectGender === 'male' ? '男' : project.subjectGender === 'female' ? '女' : '其他'}</span>
              </div>
              <div>
                <span className="text-stone-500">传记类型：</span>
                <span className="text-stone-800">{project.projectType === 'self' ? '为自己创建' : '为家人创建'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            {uploads.length === 0 && sessions.length === 0 ? (
              <p className="text-stone-500 text-center py-8">
                暂无活动记录，开始上传资料或进行访谈吧
              </p>
            ) : (
              <div className="space-y-4">
                {uploads.slice(0, 3).map((upload, index) => (
                  <div key={upload.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      📸
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">上传了文件：{upload.fileName}</p>
                      <p className="text-sm text-stone-500">
                        {upload.aiAnalysis ? 'AI 已分析' : '等待 AI 分析'}
                      </p>
                    </div>
                    <span className="text-sm text-stone-400">
                      {new Date(upload.uploadedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                ))}
                
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      🎙️
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">完成第 {session.sessionNumber} 轮访谈</p>
                      {session.chapter && (
                        <p className="text-sm text-stone-500">主题：{session.chapter}</p>
                      )}
                    </div>
                    <span className="text-sm text-stone-400">
                      {new Date(session.startedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
