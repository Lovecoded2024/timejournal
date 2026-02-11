// 传记项目类型定义

export interface BiographyProject {
  id: string
  userId: string
  
  // 传主基本信息
  subjectName: string
  subjectBirthDate?: string
  subjectBirthPlace?: string
  subjectGender?: 'male' | 'female' | 'other'
  
  // 项目设置
  projectType: 'self' | 'family'
  projectGoal?: string  // 项目目标/寄语
  
  // 状态
  status: 'draft' | 'interviewing' | 'reviewing' | 'completed'
  progressPercent: number
  
  createdAt: string
  updatedAt: string
}

// 创建项目表单数据
export interface CreateProjectFormData {
  subjectName: string
  subjectBirthDate: string
  subjectBirthPlace: string
  subjectGender: 'male' | 'female' | 'other'
  projectType: 'self' | 'family'
  projectGoal: string
  relationship?: string  // 如果是为家人创建，关系是什么
}

// 上传资料类型
export interface Upload {
  id: string
  projectId: string
  fileType: 'image' | 'audio' | 'document' | 'text'
  fileUrl: string
  fileName: string
  fileSize: number
  ocrText?: string
  extractedMetadata?: Record<string, any>
  aiAnalysis?: Record<string, any>
  uploadedAt: string
}

// AI 记忆
export interface AIMemory {
  id: string
  projectId: string
  memoryType: 'fact' | 'timeline_event' | 'person' | 'story_candidate' | 'pending_question'
  content: string
  metadata?: Record<string, any>
  confidence?: number
  sourceType?: 'upload' | 'interview' | 'inference'
  sourceId?: string
  createdAt: string
  updatedAt: string
}

// 访谈会话
export interface InterviewSession {
  id: string
  projectId: string
  sessionNumber: number
  chapter?: string
  mode: 'text' | 'voice'
  status: 'active' | 'paused' | 'completed'
  startedAt: string
  endedAt?: string
  summary?: string
  keyFindings?: any
  nextQuestions?: any
}

// 消息记录
export interface InterviewMessage {
  id: string
  sessionId: string
  role: 'system' | 'user' | 'assistant'
  content: string
  audioUrl?: string
  audioDuration?: number
  referencedUploads?: string[]
  createdAt: string
}

// 电子书
export interface Ebook {
  id: string
  projectId: string
  version: number
  title?: string
  content?: any
  epubUrl?: string
  pdfUrl?: string
  status: 'draft' | 'published'
  generatedAt: string
}

// Supabase 数据库表名映射（用于类型转换）
export interface Database {
  biography_projects: BiographyProject
  uploads: Upload
  ai_memory: AIMemory
  interview_sessions: InterviewSession
  interview_messages: InterviewMessage
  ebooks: Ebook
}