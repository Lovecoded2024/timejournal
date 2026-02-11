'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProject } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CreateProjectFormData } from '@/types'

export default function NewProjectPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateProjectFormData>({
    subjectName: '',
    subjectBirthDate: '',
    subjectBirthPlace: '',
    subjectGender: 'male',
    projectType: 'family',
    projectGoal: '',
    relationship: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleChange = (field: keyof CreateProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('请先登录')
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      const project = await createProject({
        userId: user.id,
        subjectName: formData.subjectName,
        subjectBirthDate: formData.subjectBirthDate || undefined,
        subjectBirthPlace: formData.subjectBirthPlace || undefined,
        subjectGender: formData.subjectGender,
        projectType: formData.projectType,
        projectGoal: formData.projectGoal || undefined,
        status: 'draft',
        progressPercent: 0
      })
      
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full mx-auto"></div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null // 会重定向到登录页
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">创建传记项目</h1>
          <p className="text-stone-600">填写基本信息，开始记录珍贵的人生故事</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>传主信息</CardTitle>
              <CardDescription>
                这是传记的主角，可以是你自己，也可以是家人
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 传记类型 */}
              <div className="space-y-3">
                <Label>传记类型</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="self"
                      checked={formData.projectType === 'self'}
                      onChange={(e) => handleChange('projectType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>为自己创建</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="family"
                      checked={formData.projectType === 'family'}
                      onChange={(e) => handleChange('projectType', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>为家人创建</span>
                  </label>
                </div>
              </div>

              {/* 关系（仅家人模式显示） */}
              {formData.projectType === 'family' && (
                <div className="space-y-2">
                  <Label htmlFor="relationship">与传主的关系</Label>
                  <Input
                    id="relationship"
                    placeholder="例如：父亲、母亲、爷爷"
                    value={formData.relationship || ''}
                    onChange={(e) => handleChange('relationship', e.target.value)}
                  />
                </div>
              )}

              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="subjectName">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subjectName"
                  placeholder="请输入传主姓名"
                  value={formData.subjectName}
                  onChange={(e) => handleChange('subjectName', e.target.value)}
                  required
                />
              </div>

              {/* 性别 */}
              <div className="space-y-3">
                <Label>性别</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.subjectGender === 'male'}
                      onChange={(e) => handleChange('subjectGender', e.target.value as 'male' | 'female' | 'other')}
                      className="w-4 h-4"
                    />
                    <span>男</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.subjectGender === 'female'}
                      onChange={(e) => handleChange('subjectGender', e.target.value as 'male' | 'female' | 'other')}
                      className="w-4 h-4"
                    />
                    <span>女</span>
                  </label>
                </div>
              </div>

              {/* 出生日期 */}
              <div className="space-y-2">
                <Label htmlFor="subjectBirthDate">出生日期</Label>
                <Input
                  id="subjectBirthDate"
                  type="date"
                  value={formData.subjectBirthDate}
                  onChange={(e) => handleChange('subjectBirthDate', e.target.value)}
                />
                <p className="text-xs text-stone-500">
                  用于 AI 理解人生阶段，可以只选年份
                </p>
              </div>

              {/* 出生地 */}
              <div className="space-y-2">
                <Label htmlFor="subjectBirthPlace">出生地</Label>
                <Input
                  id="subjectBirthPlace"
                  placeholder="例如：北京、上海"
                  value={formData.subjectBirthPlace}
                  onChange={(e) => handleChange('subjectBirthPlace', e.target.value)}
                />
              </div>

              {/* 项目目标/寄语 */}
              <div className="space-y-2">
                <Label htmlFor="projectGoal">项目寄语（可选）</Label>
                <Textarea
                  id="projectGoal"
                  placeholder="例如：送给父亲70岁生日的礼物，记录他不平凡的一生..."
                  value={formData.projectGoal}
                  onChange={(e) => handleChange('projectGoal', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-stone-500">
                  这段文字将帮助 AI 把握传记的情感基调
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-stone-800 hover:bg-stone-700"
              disabled={isSubmitting || !formData.subjectName}
            >
              {isSubmitting ? '创建中...' : '创建项目'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
