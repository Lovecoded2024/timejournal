'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock, User, MapPin, Calendar, Download, FileText, Image as ImageIcon } from 'lucide-react'

// 模拟传记数据
const mockBiography = {
  title: '王明远传记：一个时代的记忆',
  subject: {
    name: '王明远',
    birthDate: '1955年3月15日',
    birthPlace: '山东济南',
    summary: '一位普通的大学教师，见证了中国改革开放的伟大历程。他的人生故事，是千万中国人的缩影。'
  },
  chapters: [
    {
      id: 1,
      title: '第一章：童年时光',
      period: '1955-1966',
      summary: '出生在一个普通的工人家庭，童年在济南老城区度过。',
      content: '1955年春天，王明远出生在济南市历下区的一个普通工人家庭。父亲王德明是纺织厂的技工，母亲李秀英在家操持家务...',
      highlights: [
        '1955年3月15日出生于济南',
        '父亲王德明是纺织厂技工',
        '童年住在老城区四合院'
      ]
    },
    {
      id: 2,
      title: '第二章：求学岁月',
      period: '1966-1975',
      summary: '经历了文化大革命，在动荡中坚持学习。',
      content: '1966年，文化大革命开始，年仅11岁的王明远还不明白这场运动意味着什么。学校停课了，他只能在家自学...',
      highlights: [
        '1966年文化大革命开始，学校停课',
        '在家自学，阅读大量书籍',
        '1975年恢复高考前最后一批推荐上大学'
      ]
    },
    {
      id: 3,
      title: '第三章：大学时光',
      period: '1975-1979',
      summary: '进入山东大学中文系，开启了人生新篇章。',
      content: '1975年9月，20岁的王明远怀着激动的心情走进了山东大学的校门。那时的山大还在洪家楼校区，古朴的校园让他流连忘返...',
      highlights: [
        '1975年9月进入山东大学中文系',
        '宿舍4人，来自不同省份',
        '最喜欢古代文学课程',
        '1979年毕业，分配至济南一中任教'
      ]
    },
    {
      id: 4,
      title: '第四章：教师生涯',
      period: '1979-1995',
      summary: '在济南一中任教16年，桃李满天下。',
      content: '1979年夏天，24岁的王明远成为济南一中的一名语文教师。在那个教师地位不高的年代，他选择坚守讲台...',
      highlights: [
        '1979年成为济南一中语文教师',
        '1985年获得市级优秀教师称号',
        '培养了多名考上清华北大的学生'
      ]
    },
    {
      id: 5,
      title: '第五章：家庭生活',
      period: '1982-至今',
      summary: '与爱人张丽华相识相爱，组建幸福家庭。',
      content: '1982年的春天，在一次教育系统联谊会上，王明远遇见了张丽华。她是济南市实验小学的数学教师，温柔善良...',
      highlights: [
        '1982年认识妻子张丽华',
        '1984年结婚',
        '1986年儿子出生',
        '1990年搬进单位分配的楼房'
      ]
    }
  ],
  timeline: [
    { year: '1955', event: '出生', description: '3月15日出生于山东济南' },
    { year: '1966', event: '文革开始', description: '学校停课，在家自学' },
    { year: '1975', event: '进入大学', description: '9月进入山东大学中文系' },
    { year: '1979', event: '毕业工作', description: '分配到济南一中任教' },
    { year: '1982', event: '遇见爱人', description: '认识张丽华' },
    { year: '1984', event: '结婚', description: '与张丽华举行婚礼' },
    { year: '1986', event: '儿子出生', description: '喜得贵子' },
    { year: '1995', event: '退休', description: '从教16年后退休' }
  ],
  photos: [
    { id: 1, caption: '1975年大学入学照片', year: '1975' },
    { id: 2, caption: '1984年婚礼照片', year: '1984' },
    { id: 3, caption: '1990年全家福', year: '1990' },
    { id: 4, caption: '2005年同学聚会', year: '2005' }
  ],
  stats: {
    totalWords: 12580,
    totalChapters: 5,
    totalPhotos: 12,
    interviewSessions: 8,
    lastUpdated: '2026-02-11'
  }
}

export default function EbookPage() {
  const params = useParams()
  const projectId = params.id as string
  const [activeChapter, setActiveChapter] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'epub' | 'pdf') => {
    setIsExporting(true)
    // TODO: 调用 API 生成电子书
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert(`${format.toUpperCase()} 格式电子书生成成功！（模拟）`)
    setIsExporting(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 返回按钮 */}
        <Link 
          href={`/projects/${projectId}`} 
          className="text-stone-600 hover:text-stone-800 mb-6 inline-block"
        >
          ← 返回项目
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">传记预览</h1>
          <p className="text-stone-600 mt-2">
            查看 AI 整理的传记内容，支持导出为电子书格式
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-stone-600" />
              <p className="text-2xl font-bold text-stone-800">{mockBiography.stats.totalWords.toLocaleString()}</p>
              <p className="text-xs text-stone-500">总字数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-stone-600" />
              <p className="text-2xl font-bold text-stone-800">{mockBiography.stats.totalChapters}</p>
              <p className="text-xs text-stone-500">章节数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-2 text-stone-600" />
              <p className="text-2xl font-bold text-stone-800">{mockBiography.stats.totalPhotos}</p>
              <p className="text-xs text-stone-500">配图数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-stone-600" />
              <p className="text-2xl font-bold text-stone-800">{mockBiography.stats.interviewSessions}</p>
              <p className="text-xs text-stone-500">访谈轮次</p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区 */}
        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chapters">章节内容</TabsTrigger>
            <TabsTrigger value="timeline">人生时间线</TabsTrigger>
            <TabsTrigger value="photos">照片集</TabsTrigger>
          </TabsList>

          {/* 章节内容 */}
          <TabsContent value="chapters" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {/* 章节导航 */}
              <Card className="md:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">目录</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {mockBiography.chapters.map((chapter, index) => (
                      <button
                        key={chapter.id}
                        onClick={() => setActiveChapter(index)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          activeChapter === index
                            ? 'bg-stone-100 text-stone-900 font-medium border-l-4 border-stone-800'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <div className="truncate">{chapter.title}</div>
                        <div className="text-xs text-stone-400 mt-1">{chapter.period}</div>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* 章节内容 */}
              <div className="md:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {mockBiography.chapters[activeChapter].title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {mockBiography.chapters[activeChapter].period}
                        </CardDescription>
                      </div>
                      <span className="text-sm text-stone-400">
                        {activeChapter + 1} / {mockBiography.chapters.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 章节摘要 */}
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <p className="text-stone-600 italic">
                        {mockBiography.chapters[activeChapter].summary}
                      </p>
                    </div>

                    {/* 章节正文 */}
                    <div className="prose prose-stone max-w-none">
                      <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                        {mockBiography.chapters[activeChapter].content}
                      </p>
                    </div>

                    {/* 本章亮点 */}
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-stone-800 mb-3">本章亮点</h4>
                      <ul className="space-y-2">
                        {mockBiography.chapters[activeChapter].highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                            <span className="text-stone-400">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 章节导航按钮 */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                        disabled={activeChapter === 0}
                      >
                        ← 上一章
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveChapter(Math.min(mockBiography.chapters.length - 1, activeChapter + 1))}
                        disabled={activeChapter === mockBiography.chapters.length - 1}
                      >
                        下一章 →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 时间线 */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>人生时间线</CardTitle>
                <CardDescription>
                  {mockBiography.subject.name} 一生中的重要时刻
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* 时间线轴线 */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-stone-200" />
                  
                  {/* 时间线事件 */}
                  <div className="space-y-8">
                    {mockBiography.timeline.map((item, index) => (
                      <div key={index} className="relative flex gap-6">
                        {/* 时间点 */}
                        <div className="relative z-10 w-16 h-16 rounded-full bg-stone-800 text-white flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold">{item.year}</span>
                        </div>
                        
                        {/* 事件内容 */}
                        <div className="flex-1 pt-2">
                          <h4 className="font-medium text-stone-800">{item.event}</h4>
                          <p className="text-stone-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 照片集 */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle>珍贵照片</CardTitle>
                <CardDescription>
                  记录人生各个阶段的重要瞬间
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockBiography.photos.map((photo) => (
                    <div key={photo.id} className="group">
                      <div className="aspect-square bg-stone-200 rounded-lg flex items-center justify-center mb-2 group-hover:bg-stone-300 transition-colors">
                        <ImageIcon className="w-12 h-12 text-stone-400" />
                      </div>
                      <p className="text-sm font-medium text-stone-800">{photo.caption}</p>
                      <p className="text-xs text-stone-500">{photo.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 导出按钮 */}
        <Card className="mt-8 bg-stone-800 text-white border-none">
          <CardHeader>
            <CardTitle className="text-white">导出电子书</CardTitle>
            <CardDescription className="text-stone-300">
              将传记导出为精美的电子书格式，永久保存
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="bg-white text-stone-800 hover:bg-stone-100"
                onClick={() => handleExport('epub')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? '生成中...' : '导出 EPUB'}
              </Button>
              <Button
                variant="outline"
                className="bg-white text-stone-800 hover:bg-stone-100"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? '生成中...' : '导出 PDF'}
              </Button>
            </div>
            <p className="text-sm text-stone-400 mt-4">
              EPUB 适合在 iPad、手机等阅读器上阅读，PDF 适合打印成实体书
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
