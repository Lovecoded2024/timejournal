'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatInterface, Message } from '@/components/interview/ChatInterface'
import { chatWithMiniMax, getBiographySystemPrompt } from '@/lib/minimax'

// 模拟项目信息
const mockProject = {
  id: '1',
  subjectName: '王明远',
  subjectBirthDate: '1955-03-15',
  currentChapter: '大学时光'
}

export default function InterviewPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `你好！我是你的 AI 采访助手。今天我们聊聊${mockProject.subjectName}的${mockProject.currentChapter}吧。\n\n我看到你们已经上传了一些资料。能跟我讲讲这段时间有什么特别的回忆吗？`,
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  
  // 已知的_facts（实际应从数据库获取）
  const knownFacts = [
    '1975年进入山东大学',
    '专业是中文系',
    '宿舍有4个人'
  ]

  const handleSendMessage = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // 添加 AI 加载状态
    const loadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // 构建系统提示词
      const systemPrompt = getBiographySystemPrompt({
        subjectName: mockProject.subjectName,
        currentChapter: mockProject.currentChapter,
        knownFacts
      })

      // 构建消息历史
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))

      // 调用 MiniMax API
      const response = await chatWithMiniMax({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content }
        ],
        temperature: 0.7
      })

      const aiContent = response.choices?.[0]?.message?.content || '抱歉，我遇到了一些问题，请重试。'

      // 替换加载消息为实际回复
      setMessages(prev => 
        prev.filter(m => m.id !== 'loading').concat({
          id: Date.now().toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date()
        })
      )

    } catch (error) {
      console.error('AI 回复失败:', error)
      
      // 替换加载消息为错误提示
      setMessages(prev => 
        prev.filter(m => m.id !== 'loading').concat({
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，我暂时无法回复。请检查网络连接或稍后重试。',
          timestamp: new Date()
        })
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages, knownFacts])

  const handleEndSession = () => {
    // TODO: 保存会话摘要到数据库
    alert('访谈已结束，会话记录已保存')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 返回按钮 */}
        <Link 
          href={`/projects/${projectId}`} 
          className="text-stone-600 hover:text-stone-800 mb-6 inline-block"
        >
          ← 返回项目
        </Link>

        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">
                访谈：{mockProject.currentChapter}
              </h1>
              <p className="text-stone-600 mt-2">
                与 AI 采访助手对话，挖掘 {mockProject.subjectName} 的人生故事
              </p>
            </div>
            <Button variant="outline" onClick={handleEndSession}>
              结束访谈
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 左侧：访谈主题和提示 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">当前主题</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-stone-800">{mockProject.currentChapter}</p>
                <p className="text-sm text-stone-500 mt-2">
                  建议聊的话题：
                </p>
                <ul className="text-sm text-stone-600 mt-1 space-y-1">
                  <li>• 入学第一天的情景</li>
                  <li>• 宿舍生活和室友</li>
                  <li>• 印象深刻的老师</li>
                  <li>• 毕业时的感受</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">💡 采访技巧</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 text-sm space-y-2">
                <p>• 从具体细节入手，比如"那天下雨了吗？"</p>
                <p>• 追问感受："当时心情怎么样？"</p>
                <p>• 连接现在："那段经历对你后来有什么影响？"</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">访谈进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">已聊天数</span>
                    <span className="font-medium">{messages.filter(m => m.role !== 'system').length} 条</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">当前模式</span>
                    <span className="font-medium">{mode === 'text' ? '文字' : '语音'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：聊天界面 */}
          <div className="md:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">AI 采访助手</CardTitle>
                    <CardDescription>
                      像老朋友一样自然对话
                    </CardDescription>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  mode={mode}
                  onModeChange={setMode}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
