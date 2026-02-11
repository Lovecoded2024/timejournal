'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, FileText, Mic } from 'lucide-react'

export interface FileWithPreview {
  id: string
  file: File
  name: string
  size: number
  type: 'image' | 'audio' | 'document' | 'text'
  preview?: string
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysisResult?: any
  error?: string
}

interface UploadDropzoneProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  existingFiles?: FileWithPreview[]
}

export function UploadDropzone({ onFilesSelected, existingFiles = [] }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const getFileType = (file: File): 'image' | 'audio' | 'document' | 'text' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type === 'text/plain') return 'text'
    return 'document'
  }

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  const processFiles = async (files: FileList | null) => {
    if (!files) return

    const newFiles: FileWithPreview[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const preview = await createFilePreview(file)
      
      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        type: getFileType(file),
        preview,
        status: 'pending',
        progress: 0
      })
    }

    onFilesSelected([...existingFiles, ...newFiles])
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [existingFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = '' // 重置 input
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragging ? 'border-stone-800 bg-stone-50' : 'border-stone-300 hover:border-stone-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="py-12 text-center">
        <input
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto mb-4 text-stone-400" />
          <p className="text-lg font-medium text-stone-700 mb-2">
            点击或拖拽文件到此处上传
          </p>
          <p className="text-sm text-stone-500">
            支持图片、音频、PDF、Word 文档、文本文件
          </p>
          <p className="text-xs text-stone-400 mt-2">
            每个文件最大 50MB
          </p>
        </label>
      </CardContent>
    </Card>
  )
}

interface FileListProps {
  files: FileWithPreview[]
  onRemove: (id: string) => void
  onAnalyze?: (id: string) => void
}

export function FileList({ files, onRemove, onAnalyze }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />
      case 'audio': return <Mic className="w-5 h-5" />
      case 'text': return <FileText className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      pending: { text: '待上传', class: 'bg-stone-100 text-stone-600' },
      uploading: { text: '上传中', class: 'bg-blue-100 text-blue-600' },
      analyzing: { text: 'AI分析中', class: 'bg-yellow-100 text-yellow-600' },
      completed: { text: '已完成', class: 'bg-green-100 text-green-600' },
      error: { text: '失败', class: 'bg-red-100 text-red-600' }
    }
    const badge = badges[status] || badges.pending
    return <span className={`px-2 py-1 rounded-full text-xs ${badge.class}`}>{badge.text}</span>
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-3 mt-6">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* 预览或图标 */}
              <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{file.name}</p>
                <p className="text-sm text-stone-500">{formatFileSize(file.size)}</p>
                
                {/* 进度条 */}
                {file.status === 'uploading' || file.status === 'analyzing' ? (
                  <div className="mt-2">
                    <div className="w-full bg-stone-200 rounded-full h-1.5">
                      <div
                        className="bg-stone-800 h-1.5 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {/* AI 分析结果预览 */}
                {file.analysisResult && (
                  <div className="mt-2 text-sm text-stone-600 bg-stone-50 p-2 rounded">
                    <p className="font-medium text-xs text-stone-500 mb-1">AI 分析结果：</p>
                    <p className="line-clamp-2">{file.analysisResult.description || file.analysisResult.text || JSON.stringify(file.analysisResult)}</p>
                  </div>
                )}

                {file.error && (
                  <p className="mt-1 text-sm text-red-500">{file.error}</p>
                )}
              </div>

              {/* 状态和操作 */}
              <div className="flex items-center gap-2">
                {getStatusBadge(file.status)}
                
                {file.status === 'pending' && onAnalyze && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAnalyze(file.id)}
                  >
                    分析
                  </Button>
                )}
                
                <button
                  onClick={() => onRemove(file.id)}
                  className="p-1 hover:bg-stone-100 rounded"
                >
                  <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
