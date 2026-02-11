import { createClient } from '@supabase/supabase-js'
import { BiographyProject, Upload, InterviewSession, AIMemory, InterviewMessage, Ebook } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// 转换 snake_case 到 camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// ==================== 项目操作 ====================

export async function getProjects(): Promise<BiographyProject[]> {
  const { data, error } = await supabase
    .from('biography_projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取项目失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function getProjectById(id: string): Promise<BiographyProject | null> {
  const { data, error } = await supabase
    .from('biography_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('获取项目详情失败:', error)
    throw error
  }

  return toCamelCase(data)
}

export async function createProject(project: Omit<BiographyProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<BiographyProject> {
  const { data, error } = await supabase
    .from('biography_projects')
    .insert([{
      user_id: project.userId,
      subject_name: project.subjectName,
      subject_birth_date: project.subjectBirthDate,
      subject_birth_place: project.subjectBirthPlace,
      subject_gender: project.subjectGender,
      project_type: project.projectType,
      project_goal: project.projectGoal,
      status: project.status,
      progress_percent: project.progressPercent
    }])
    .select()
    .single()

  if (error) {
    console.error('创建项目失败:', error)
    throw error
  }

  return toCamelCase(data)
}

export async function updateProject(id: string, updates: Partial<BiographyProject>): Promise<void> {
  const updateData: any = {}
  if (updates.subjectName !== undefined) updateData.subject_name = updates.subjectName
  if (updates.subjectBirthDate !== undefined) updateData.subject_birth_date = updates.subjectBirthDate
  if (updates.subjectBirthPlace !== undefined) updateData.subject_birth_place = updates.subjectBirthPlace
  if (updates.subjectGender !== undefined) updateData.subject_gender = updates.subjectGender
  if (updates.projectType !== undefined) updateData.project_type = updates.projectType
  if (updates.projectGoal !== undefined) updateData.project_goal = updates.projectGoal
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.progressPercent !== undefined) updateData.progress_percent = updates.progressPercent

  const { error } = await supabase
    .from('biography_projects')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('更新项目失败:', error)
    throw error
  }
}

// ==================== 上传资料操作 ====================

export async function getUploadsByProject(projectId: string): Promise<Upload[]> {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('获取上传资料失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function createUpload(upload: Omit<Upload, 'id' | 'uploadedAt'>): Promise<Upload> {
  const { data, error } = await supabase
    .from('uploads')
    .insert([{
      project_id: upload.projectId,
      file_type: upload.fileType,
      file_url: upload.fileUrl,
      file_name: upload.fileName,
      file_size: upload.fileSize,
      ocr_text: upload.ocrText,
      extracted_metadata: upload.extractedMetadata,
      ai_analysis: upload.aiAnalysis
    }])
    .select()
    .single()

  if (error) {
    console.error('创建上传记录失败:', error)
    throw error
  }

  return toCamelCase(data)
}

export async function updateUploadAnalysis(id: string, analysis: any): Promise<void> {
  const { error } = await supabase
    .from('uploads')
    .update({ ai_analysis: analysis })
    .eq('id', id)

  if (error) {
    console.error('更新分析结果失败:', error)
    throw error
  }
}

// ==================== 文件存储 ====================

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const { error } = await supabase
    .storage
    .from(bucket)
    .upload(path, file)

  if (error) {
    console.error('文件上传失败:', error)
    throw error
  }

  // 获取公开 URL
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

// ==================== 访谈会话操作 ====================

export async function getSessionsByProject(projectId: string): Promise<InterviewSession[]> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('session_number', { ascending: true })

  if (error) {
    console.error('获取访谈会话失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function createSession(session: Omit<InterviewSession, 'id' | 'startedAt'>): Promise<InterviewSession> {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert([{
      project_id: session.projectId,
      session_number: session.sessionNumber,
      chapter: session.chapter,
      mode: session.mode,
      status: session.status
    }])
    .select()
    .single()

  if (error) {
    console.error('创建访谈会话失败:', error)
    throw error
  }

  return toCamelCase(data)
}

export async function updateSession(id: string, updates: Partial<InterviewSession>): Promise<void> {
  const updateData: any = {}
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.summary !== undefined) updateData.summary = updates.summary
  if (updates.keyFindings !== undefined) updateData.key_findings = updates.keyFindings
  if (updates.nextQuestions !== undefined) updateData.next_questions = updates.nextQuestions
  if (updates.endedAt !== undefined) updateData.ended_at = updates.endedAt

  const { error } = await supabase
    .from('interview_sessions')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('更新访谈会话失败:', error)
    throw error
  }
}

// ==================== 消息记录操作 ====================

export async function getMessagesBySession(sessionId: string): Promise<InterviewMessage[]> {
  const { data, error } = await supabase
    .from('interview_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('获取消息失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function createMessage(message: Omit<InterviewMessage, 'id' | 'createdAt'>): Promise<InterviewMessage> {
  const { data, error } = await supabase
    .from('interview_messages')
    .insert([{
      session_id: message.sessionId,
      role: message.role,
      content: message.content,
      audio_url: message.audioUrl,
      audio_duration: message.audioDuration,
      referenced_uploads: message.referencedUploads
    }])
    .select()
    .single()

  if (error) {
    console.error('创建消息失败:', error)
    throw error
  }

  return toCamelCase(data)
}

// ==================== AI 记忆操作 ====================

export async function getMemoriesByProject(projectId: string): Promise<AIMemory[]> {
  const { data, error } = await supabase
    .from('ai_memory')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取 AI 记忆失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function createMemory(memory: Omit<AIMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIMemory> {
  const { data, error } = await supabase
    .from('ai_memory')
    .insert([{
      project_id: memory.projectId,
      memory_type: memory.memoryType,
      content: memory.content,
      metadata: memory.metadata,
      confidence: memory.confidence,
      source_type: memory.sourceType,
      source_id: memory.sourceId
    }])
    .select()
    .single()

  if (error) {
    console.error('创建 AI 记忆失败:', error)
    throw error
  }

  return toCamelCase(data)
}

// ==================== 电子书操作 ====================

export async function getEbooksByProject(projectId: string): Promise<Ebook[]> {
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .eq('project_id', projectId)
    .order('version', { ascending: false })

  if (error) {
    console.error('获取电子书失败:', error)
    throw error
  }

  return toCamelCase(data || [])
}

export async function createEbook(ebook: Omit<Ebook, 'id' | 'generatedAt'>): Promise<Ebook> {
  const { data, error } = await supabase
    .from('ebooks')
    .insert([{
      project_id: ebook.projectId,
      version: ebook.version,
      title: ebook.title,
      content: ebook.content,
      epub_url: ebook.epubUrl,
      pdf_url: ebook.pdfUrl,
      status: ebook.status
    }])
    .select()
    .single()

  if (error) {
    console.error('创建电子书失败:', error)
    throw error
  }

  return toCamelCase(data)
}