'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadDropzone, FileList, FileWithPreview } from '@/components/upload/UploadDropzone'
import { analyzeImage } from '@/lib/minimax'

export default function UploadPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 处理文件选择
  const handleFilesSelected = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles)
  }, [])

  // 移除文件
  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  // 将文件转为 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // 移除 data:image/jpeg;base64, 前缀
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
    })
  }

  // AI 分析单个文件
  const analyzeFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file || file.type !== 'image') {
      alert('目前仅支持图片的 AI 分析')
      return
    }

    // 更新状态为分析中
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'analyzing', progress: 50 } : f
    ))

    try {
      // 转为 base64
      const base64 = await fileToBase64(file.file)
      
      // 调用 MiniMax 分析
      const result = await analyzeImage(base64, 
        '这是一张来自个人传记项目的老照片。请详细描述：\n' +
        '1. 图片中的场景、人物、物品\n' +
        '2. 可能的时间线索（如服装、背景等）\n' +
        '3. 可能的地点线索\n' +
        '4. 建议可以向用户询问的问题'
      )

      // 更新分析结果
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          analysisResult: {
            description: result.description,
            raw: result.raw
          }
        } : f
      ))

    } catch (error) {
      console.error('分析失败:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: 'AI 分析失败，请重试'
        } : f
      ))
    }
  }

  // 批量分析所有图片
  const analyzeAllImages = async () => {
    const pendingImages = files.filter(f => f.type === 'image' && f.status === 'pending')
    
    if (pendingImages.length === 0) {
      alert('没有待分析的图片')
      return
    }

    setIsAnalyzing(true)
    
    for (const file of pendingImages) {
      await analyzeFile(file.id)
    }
    
    setIsAnalyzing(false)
  }

  // 保存所有文件（模拟）
  const handleSaveAll = async () => {
    // TODO: 实际上传到 Supabase Storage，然后保存到数据库
    console.log('保存文件:', files)
    alert(`已保存 ${files.length} 个文件（模拟）`)
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const completedCount = files.filter(f => f.status === 'completed').length

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">上传资料</h1>
          <p className="text-stone-600 mt-2">
            上传照片、文档、语音等资料，AI 将自动分析并提取信息
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-stone-800">{files.length}</p>
              <p className="text-sm text-stone-500">总文件</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              <p className="text-sm text-stone-500">待分析</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-stone-500">已完成</p>
            </CardContent>
          </Card>
        </div>

        {/* 上传区域 */}
        <UploadDropzone 
          onFilesSelected={handleFilesSelected} 
          existingFiles={files}
        />

        {/* 文件列表 */}
        {files.length > 0 && (
          <>
            <div className="flex justify-between items-center mt-8 mb-4">
              <h2 className="text-lg font-semibold text-stone-800">
                已选择的文件 ({files.length})
              </h2>
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={analyzeAllImages}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? '分析中...' : `批量分析 (${pendingCount})`}
                  </Button>
                )}
                <Button
                  className="bg-stone-800 hover:bg-stone-700"
                  onClick={handleSaveAll}
                  disabled={files.length === 0}
                >
                  保存所有文件
                </Button>
              </div>
            </div>

            <FileList 
              files={files} 
              onRemove={handleRemoveFile}
              onAnalyze={analyzeFile}
            />
          </>
        )}

        {/* AI 分析说明 */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 text-lg">💡 AI 能帮你做什么？</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <p>• <strong>图片分析：</strong>识别场景、人物、时间线索，提取文字（OCR）</p>
            <p>• <strong>语音转写：</strong>将口述内容转为文字，方便整理</p>
            <p>• <strong>时间线生成：</strong>自动整理事件的时间顺序</p>
            <p>• <strong>故事挖掘：</strong>识别有价值的故事线索，为访谈做准备</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
