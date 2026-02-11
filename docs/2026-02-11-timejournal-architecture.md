# 时光手记技术架构文档

**版本**: v0.1  
**日期**: 2026-02-11  
**状态**: 技术验证完成，进入架构设计阶段

---

## 1. 技术选型决策

### 1.1 核心 AI 能力：MiniMax（已验证）

| 能力 | API 端点 | 模型 | 状态 |
|------|----------|------|------|
| 文字对话 | `/text/chatcompletion_v2` | `abab6.5s-chat` | ✅ 已验证 |
| 语音合成(TTS) | `/t2a_v2` | `speech-01-turbo` | ✅ 已验证 |
| 语音识别(ASR) | `/asr` | - | 待验证 |
| 图片理解 | `/text/chatcompletion_v2` | 多模态模型 | 待验证 |

**验证结果**:
- API 响应延迟：~1-2 秒（文字对话）
- TTS 返回 base64 编码音频，需前端解码播放
- 支持流式响应（stream: true）

### 1.2 全栈技术栈

| 层级 | 技术选型 | 理由 |
|------|----------|------|
| **前端** | Next.js 15 (App Router) + TypeScript | SSR/SSG 支持、AI SDK 生态好 |
| **UI 组件** | shadcn/ui + Tailwind CSS | 快速搭建、可定制 |
| **后端** | Next.js API Routes + Edge Runtime | 前后端统一、部署简单 |
| **数据库** | PostgreSQL (Supabase) | 关系数据 + JSONB 灵活存储 |
| **向量存储** | Supabase Vector (pgvector) | 语义搜索、记忆检索 |
| **文件存储** | Supabase Storage | 用户上传的照片、文档 |
| **实时通信** | WebSocket (PartyKit/Ably) | 语音通话实时交互 |
| **部署** | Vercel | 与 Next.js 深度集成 |

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户层 (User Layer)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web App    │  │   小程序     │  │   H5 (分享预览)      │  │
│  │  (Next.js)   │  │   (未来)     │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      API 网关层 (API Gateway)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes (Edge Runtime)            │  │
│  │  - 认证中间件 (JWT)                                       │  │
│  │  - 速率限制                                               │  │
│  │  - 路由分发                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   用户服务    │    │    传记项目服务    │    │    AI 访谈服务     │
│  (User Svc)   │    │  (Biography Svc)  │    │   (Interview Svc) │
│               │    │                   │    │                   │
│ - 注册/登录   │    │ - 项目 CRUD       │    │ - 会话管理        │
│ - 用户资料    │    │ - 资料上传        │    │ - MiniMax 调用    │
│ - 认证授权    │    │ - 时间线生成      │    │ - 记忆检索        │
└───────┬───────┘    └─────────┬─────────┘    └─────────┬─────────┘
        │                      │                        │
        └──────────────────────┼────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│                     数据层 (Data Layer)                          │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   PostgreSQL     │  │   Supabase       │  │  MiniMax     │  │
│  │   (主数据库)      │  │   Storage        │  │  API         │  │
│  │                  │  │   (文件存储)      │  │              │  │
│  │ - 用户表          │  │                  │  │ - LLM        │  │
│  │ - 项目表          │  │ - 照片原图       │  │ - TTS        │  │
│  │ - 记忆库          │  │ - 语音文件       │  │ - ASR        │  │
│  │ - 会话记录        │  │ - 电子书导出     │  │ - 图片理解   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据库 Schema 设计

### 3.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 传记项目表
CREATE TABLE biography_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 基本信息
  subject_name VARCHAR(100) NOT NULL, -- 传主姓名
  subject_birth_date DATE,            -- 出生日期
  subject_birth_place VARCHAR(200),   -- 出生地
  subject_gender VARCHAR(10),         -- 性别
  project_type VARCHAR(20) NOT NULL,  -- 'self' | 'family'
  project_goal TEXT,                  -- 项目目标/寄语
  
  -- 状态
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'interviewing' | 'reviewing' | 'completed'
  progress_percent INT DEFAULT 0,     -- 完成进度
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 上传资料表
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  file_type VARCHAR(20) NOT NULL,     -- 'image' | 'audio' | 'document' | 'text'
  file_url TEXT NOT NULL,             -- Supabase Storage URL
  file_name VARCHAR(255),
  file_size INT,
  
  -- AI 解析结果
  ocr_text TEXT,                      -- OCR 提取的文字
  extracted_metadata JSONB,           -- 提取的元数据（时间、地点、人物等）
  ai_analysis JSONB,                  -- AI 分析结果
  
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- AI 记忆库（核心表）
CREATE TABLE ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  memory_type VARCHAR(30) NOT NULL,   -- 'fact' | 'timeline_event' | 'person' | 'story_candidate' | 'pending_question'
  content TEXT NOT NULL,              -- 记忆内容
  
  -- 结构化数据
  metadata JSONB,                     -- 扩展字段（时间、地点、人物等）
  confidence FLOAT,                   -- 置信度 0-1
  
  -- 来源追踪
  source_type VARCHAR(20),            -- 'upload' | 'interview' | 'inference'
  source_id UUID,                     -- 关联的 upload_id 或 session_id
  
  -- 向量嵌入（用于语义搜索）
  embedding VECTOR(1536),             -- 需要 pgvector 扩展
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 访谈会话表
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  session_number INT NOT NULL,        -- 第几轮访谈
  chapter VARCHAR(50),                -- 当前章节主题
  mode VARCHAR(10) DEFAULT 'text',    -- 'text' | 'voice'
  
  -- 会话状态
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'paused' | 'completed'
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  
  -- 摘要
  summary TEXT,                       -- 本轮访谈总结
  key_findings JSONB,                 -- 关键发现
  next_questions JSONB                -- 待追问问题
);

-- 消息记录表
CREATE TABLE interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL,          -- 'system' | 'user' | 'assistant'
  content TEXT NOT NULL,              -- 消息内容
  
  -- 语音特有
  audio_url TEXT,                     -- 语音文件 URL
  audio_duration INT,                 -- 时长（秒）
  
  -- 引用
  referenced_uploads UUID[],          -- 引用的上传资料
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 电子书表
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES biography_projects(id) ON DELETE CASCADE,
  
  version INT DEFAULT 1,              -- 版本号
  title VARCHAR(255),
  content JSONB,                      -- 章节内容结构
  
  -- 文件
  epub_url TEXT,
  pdf_url TEXT,
  
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published'
  generated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 索引设计

```sql
-- 加速查询
CREATE INDEX idx_memory_project ON ai_memory(project_id);
CREATE INDEX idx_memory_type ON ai_memory(memory_type);
CREATE INDEX idx_uploads_project ON uploads(project_id);
CREATE INDEX idx_sessions_project ON interview_sessions(project_id);
CREATE INDEX idx_messages_session ON interview_messages(session_id);

-- 向量相似度搜索（pgvector）
CREATE INDEX idx_memory_embedding ON ai_memory USING ivfflat (embedding vector_cosine_ops);
```

---

## 4. 核心模块设计

### 4.1 AI 访谈引擎 (Interview Engine)

```typescript
// 核心流程
class InterviewEngine {
  // 1. 预研阶段 - 分析上传资料
  async analyzeUploads(projectId: string): Promise<AnalysisResult> {
    const uploads = await getUploads(projectId);
    
    // 并行处理所有资料
    const results = await Promise.all(
      uploads.map(async (upload) => {
        if (upload.file_type === 'image') {
          // OCR + 视觉理解
          return await this.analyzeImage(upload);
        }
        // ... 其他类型
      })
    );
    
    // 生成时间线 + 待确认清单
    return this.generateTimeline(results);
  }
  
  // 2. 生成访谈策略
  async generateInterviewStrategy(projectId: string): Promise<Strategy> {
    const memory = await getProjectMemory(projectId);
    
    // 识别空白点和亮点
    const gaps = this.identifyGaps(memory);
    const highlights = this.identifyHighlights(memory);
    
    return {
      chapters: ['童年', '求学', '工作', '家庭', '晚年'],
      currentChapter: '童年',
      targetQuestions: this.generateQuestions(gaps, highlights),
      focusAreas: highlights.slice(0, 3) // 优先深挖的故事
    };
  }
  
  // 3. 实时对话
  async chat(sessionId: string, userMessage: string, mode: 'text' | 'voice') {
    const context = await this.buildContext(sessionId);
    
    const response = await minimax.chat({
      model: 'abab6.5s-chat',
      messages: [
        { role: 'system', content: this.buildSystemPrompt(context) },
        ...context.history,
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      stream: true
    });
    
    // 实时提取事实存入记忆
    await this.extractAndStoreFacts(sessionId, userMessage, response);
    
    if (mode === 'voice') {
      // TTS 转换
      const audio = await minimax.tts({
        text: response,
        voice_id: 'male-qn-qingse' // 温暖男声
      });
      return { text: response, audio };
    }
    
    return { text: response };
  }
}
```

### 4.2 记忆管理系统

```typescript
// 记忆管理
class MemoryManager {
  // 存储新记忆
  async storeMemory(projectId: string, memory: MemoryInput) {
    // 生成向量嵌入
    const embedding = await createEmbedding(memory.content);
    
    await db.insert('ai_memory', {
      project_id: projectId,
      memory_type: memory.type,
      content: memory.content,
      metadata: memory.metadata,
      confidence: memory.confidence,
      embedding
    });
  }
  
  // 检索相关记忆（语义搜索）
  async retrieveRelevantMemory(
    projectId: string, 
    query: string, 
    limit: number = 5
  ): Promise<Memory[]> {
    const queryEmbedding = await createEmbedding(query);
    
    return await db.query(`
      SELECT *, 1 - (embedding <=> $1) as similarity
      FROM ai_memory
      WHERE project_id = $2
      ORDER BY embedding <=> $1
      LIMIT $3
    `, [queryEmbedding, projectId, limit]);
  }
  
  // 恢复会话上下文
  async buildSessionContext(sessionId: string): Promise<Context> {
    const session = await getSession(sessionId);
    const projectId = session.project_id;
    
    return {
      // 最近对话历史（最后 10 条）
      recentHistory: await getRecentMessages(sessionId, 10),
      
      // 相关记忆（基于当前主题）
      relevantMemory: await this.retrieveRelevantMemory(
        projectId, 
        session.chapter
      ),
      
      // 待追问清单
      pendingQuestions: await getPendingQuestions(projectId),
      
      // 已确认的关键事实
      keyFacts: await getKeyFacts(projectId)
    };
  }
}
```

### 4.3 实时语音通话 (WebSocket)

```typescript
// WebSocket 处理语音流
class VoiceInterviewHandler {
  async handleConnection(ws: WebSocket, sessionId: string) {
    const session = await getSession(sessionId);
    
    ws.on('message', async (data) => {
      if (data.type === 'audio') {
        // 1. ASR 语音识别
        const userText = await minimax.asr({
          audio: data.audio
        });
        
        // 2. AI 生成回复
        const { text, audio } = await interviewEngine.chat(
          sessionId, 
          userText, 
          'voice'
        );
        
        // 3. 发送语音回复
        ws.send({
          type: 'audio',
          audio: audio,        // base64
          text: text           // 同步显示文字
        });
      }
    });
  }
}
```

---

## 5. API 接口设计

### 5.1 核心端点

```typescript
// === 项目 ===
POST   /api/projects                    // 创建传记项目
GET    /api/projects/:id                // 获取项目详情
PUT    /api/projects/:id                // 更新项目信息

// === 资料上传 ===
POST   /api/projects/:id/uploads        // 上传资料（照片/音频/文档）
GET    /api/projects/:id/uploads        // 获取项目所有上传
POST   /api/projects/:id/analyze        // 触发 AI 分析所有资料

// === 访谈会话 ===
POST   /api/projects/:id/sessions       // 创建新访谈会话
GET    /api/sessions/:id                // 获取会话详情
POST   /api/sessions/:id/chat           // 发送消息（文字）
WS     /api/sessions/:id/voice          // WebSocket 语音通话
POST   /api/sessions/:id/pause          // 暂停会话（保存状态）
POST   /api/sessions/:id/resume         // 恢复会话

// === 记忆查询 ===
GET    /api/projects/:id/memory         // 获取项目记忆库
GET    /api/projects/:id/timeline       // 获取时间线草稿
GET    /api/projects/:id/pending        // 获取待确认清单

// === 电子书 ===
POST   /api/projects/:id/ebooks         // 生成电子书
GET    /api/ebooks/:id                  // 获取电子书
PUT    /api/ebooks/:id                  // 更新电子书内容
POST   /api/ebooks/:id/export           // 导出 EPUB/PDF
```

### 5.2 关键请求/响应示例

**创建访谈会话:**
```http
POST /api/projects/123/sessions
{
  "chapter": "大学时光",
  "mode": "voice"
}

Response:
{
  "id": "session_456",
  "chapter": "大学时光",
  "mode": "voice",
  "status": "active",
  "suggested_opening": "我看到你上传了一张毕业照，后面写着1990年..."
}
```

**发送消息:**
```http
POST /api/sessions/456/chat
{
  "message": "那天是我大学毕业，我和室友四个人一起拍的照"
}

Response:
{
  "role": "assistant",
  "content": "真有意思！四个室友现在还联系吗？能跟我多讲讲你们当时的故事吗？",
  "extracted_facts": [
    {"type": "时间", "content": "1990年大学毕业", "confidence": 0.95},
    {"type": "人物", "content": "室友四人", "confidence": 0.9}
  ]
}
```

---

## 6. 项目结构

```
timejournal/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 主布局
│   │   ├── dashboard/            # 项目列表
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # 项目详情
│   │   │   │   ├── upload/       # 资料上传
│   │   │   │   ├── interview/    # 访谈界面
│   │   │   │   └── ebook/        # 电子书预览
│   │   │   └── new/              # 创建项目
│   │   └── layout.tsx
│   ├── api/                      # API 路由
│   │   ├── projects/
│   │   ├── sessions/
│   │   ├── uploads/
│   │   └── ws/                   # WebSocket
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn 组件
│   ├── interview/                # 访谈相关组件
│   │   ├── ChatInterface.tsx
│   │   ├── VoiceCall.tsx
│   │   └── Timeline.tsx
│   └── upload/
│       └── UploadDropzone.tsx
├── lib/
│   ├── db/                       # 数据库操作
│   │   ├── schema.ts
│   │   └── queries.ts
│   ├── ai/                       # AI 相关
│   │   ├── minimax.ts            # MiniMax SDK 封装
│   │   ├── interview.ts          # 访谈引擎
│   │   └── memory.ts             # 记忆管理
│   └── utils/
├── types/
│   └── index.ts
├── docs/
│   └── plans/                    # 设计文档
└── package.json
```

---

## 7. 开发路线图

### Phase 1: MVP（4-6 周）
- [ ] 项目基础 CRUD
- [ ] 资料上传 + 基础展示
- [ ] 文字模式访谈（单轮对话）
- [ ] 简单时间线展示
- [ ] 基础电子书导出（纯文字）

### Phase 2: 核心体验（3-4 周）
- [ ] AI 预研分析（图片 OCR + 理解）
- [ ] 多轮会话 + 记忆持久化
- [ ] 语音模式（TTS + ASR）
- [ ] 智能访谈策略
- [ ] 电子书排版美化

### Phase 3: 优化（2-3 周）
- [ ] 语义记忆搜索
- [ ] 异步访谈体验优化
- [ ] 分享/预览功能
- [ ] 性能优化

---

## 8. 风险与应对

| 风险 | 可能性 | 影响 | 应对 |
|------|--------|------|------|
| MiniMax 图片理解效果不佳 | 中 | 高 | 降级方案：先做 OCR 提取文字，再基于文字访谈 |
| 语音实时通话延迟高 | 中 | 高 | 流式响应 + 预加载，必要时降级为文字 |
| 长文本记忆管理复杂 | 中 | 中 | 定期摘要 + 向量检索，控制上下文长度 |
| 用户隐私顾虑 | 高 | 高 | 明确数据使用政策，提供本地处理选项 |

---

*技术架构由 Friday 与 Alexander 共同制定* 🪐
