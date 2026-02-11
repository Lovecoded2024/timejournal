// MiniMax AI 服务封装

const MINIMAX_API_KEY = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || ''
const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | any[]
}

interface ChatOptions {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

// 文字对话
export async function chatWithMiniMax(options: ChatOptions) {
  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || 'abab6.5s-chat',
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000
    })
  })

  if (!response.ok) {
    throw new Error(`MiniMax API error: ${response.status}`)
  }

  return response.json()
}

// 图片理解（多模态）
export async function analyzeImage(imageBase64: string, prompt?: string) {
  const defaultPrompt = '详细描述这张图片。如果图片中有文字，请提取出来。如果有 recognizable people 或场景，请描述。这张图片可能来自用户的老照片或人生记录。'
  
  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'abab6.5s-chat',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || defaultPrompt },
            { 
              type: 'image_url', 
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`MiniMax Vision API error: ${response.status}`)
  }

  const result = await response.json()
  return {
    description: result.choices?.[0]?.message?.content || '',
    raw: result
  }
}

// TTS 语音合成
export async function textToSpeech(text: string, voiceId: string = 'male-qn-qingse') {
  const response = await fetch(`${MINIMAX_BASE_URL}/t2a_v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'speech-01-turbo',
      text,
      stream: false,
      voice_setting: {
        voice_id: voiceId,
        speed: 1.0,
        vol: 1.0,
        pitch: 0
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`MiniMax TTS API error: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.data?.audio) {
    // 将 hex 转为 base64 用于播放
    const audioBuffer = Buffer.from(result.data.audio, 'hex')
    const audioBase64 = audioBuffer.toString('base64')
    return {
      audioBase64: `data:audio/mp3;base64,${audioBase64}`,
      duration: result.extra_info?.audio_length,
      raw: result
    }
  }

  throw new Error('TTS response missing audio data')
}

// 传记采访系统提示词
export function getBiographySystemPrompt(context?: {
  subjectName?: string
  currentChapter?: string
  knownFacts?: string[]
}) {
  return `你是一位经验丰富的传记采访者，正在帮助用户记录${context?.subjectName || '传主'}的人生故事。

你的风格：
1. 温和亲切，像老朋友一样聊天
2. 善于从具体细节入手，逐步深入情感和意义
3. 追问时自然流畅，不让用户感到被审问
4. 适时给予肯定和共情

${context?.currentChapter ? `当前访谈主题：${context.currentChapter}` : ''}
${context?.knownFacts?.length ? `已掌握的信息：\n${context.knownFacts.map(f => `- ${f}`).join('\n')}` : ''}

采访技巧：
- 从用户上传的照片或资料切入，询问背后的故事
- 使用漏斗式提问：事实 → 细节 → 情感 → 意义
- 注意时间线的一致性，适时追问和验证
- 标记出值得深入挖掘的"高光故事"`
}
