-- Supabase 数据库 Schema
-- 时光手记 TimeJournal

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 传记项目表 ====================
CREATE TABLE biography_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  
  -- 传主基本信息
  subject_name VARCHAR(100) NOT NULL,
  subject_birth_date DATE,
  subject_birth_place VARCHAR(200),
  subject_gender VARCHAR(10) CHECK (subject_gender IN ('male', 'female', 'other')),
  
  -- 项目设置
  project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('self', 'family')),
  project_goal TEXT,
  
  -- 状态
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'interviewing', 'reviewing', 'completed')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_biography_projects_user_id ON biography_projects(user_id);
CREATE INDEX idx_biography_projects_status ON biography_projects(status);

-- ==================== 上传资料表 ====================
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'audio', 'document', 'text')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  
  -- AI 解析结果
  ocr_text TEXT,
  extracted_metadata JSONB,
  ai_analysis JSONB,
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uploads_project_id ON uploads(project_id);
CREATE INDEX idx_uploads_file_type ON uploads(file_type);

-- ==================== 访谈会话表 ====================
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  session_number INTEGER NOT NULL,
  chapter VARCHAR(50),
  mode VARCHAR(10) DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
  
  -- 会话状态
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- 摘要
  summary TEXT,
  key_findings JSONB,
  next_questions JSONB
);

CREATE INDEX idx_interview_sessions_project_id ON interview_sessions(project_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);

-- ==================== 消息记录表 ====================
CREATE TABLE interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  
  -- 语音特有
  audio_url TEXT,
  audio_duration INTEGER,
  
  -- 引用
  referenced_uploads UUID[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interview_messages_session_id ON interview_messages(session_id);

-- ==================== AI 记忆库 ====================
CREATE TABLE ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  memory_type VARCHAR(30) NOT NULL CHECK (memory_type IN ('fact', 'timeline_event', 'person', 'story_candidate', 'pending_question')),
  content TEXT NOT NULL,
  
  -- 结构化数据
  metadata JSONB,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  
  -- 来源追踪
  source_type VARCHAR(20) CHECK (source_type IN ('upload', 'interview', 'inference')),
  source_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_memory_project_id ON ai_memory(project_id);
CREATE INDEX idx_ai_memory_memory_type ON ai_memory(memory_type);
CREATE INDEX idx_ai_memory_source_id ON ai_memory(source_id);

-- ==================== 电子书表 ====================
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  version INTEGER DEFAULT 1,
  title VARCHAR(255),
  content JSONB,
  
  -- 文件
  epub_url TEXT,
  pdf_url TEXT,
  
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ebooks_project_id ON ebooks(project_id);

-- ==================== 存储桶 ====================
-- 在 Supabase Dashboard 中手动创建 storage bucket:
-- Bucket name: uploads
-- Public: true (用于存储用户上传的照片等)

-- ==================== Row Level Security (RLS) ====================
-- 启用 RLS
ALTER TABLE biography_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- 创建策略 (简化版，允许所有操作 - 生产环境应更严格)
CREATE POLICY "Allow all" ON biography_projects FOR ALL USING (true);
CREATE POLICY "Allow all" ON uploads FOR ALL USING (true);
CREATE POLICY "Allow all" ON interview_sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON interview_messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON ai_memory FOR ALL USING (true);
CREATE POLICY "Allow all" ON ebooks FOR ALL USING (true);

-- ==================== 更新触发器 ====================
-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_biography_projects_updated_at 
  BEFORE UPDATE ON biography_projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_memory_updated_at 
  BEFORE UPDATE ON ai_memory 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();