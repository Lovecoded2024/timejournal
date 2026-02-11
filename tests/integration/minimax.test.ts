import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

describe('MiniMax API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Chat API', () => {
    it('should send chat request successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '这是一个测试回复',
          },
        }],
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { chatWithMiniMax } = await import('@/lib/minimax')
      
      const response = await chatWithMiniMax({
        messages: [
          { role: 'user', content: '你好' },
        ],
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/text/chatcompletion_v2'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(response.choices[0].message.content).toBe('这是一个测试回复')
    })

    it('should handle API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any)

      const { chatWithMiniMax } = await import('@/lib/minimax')
      
      await expect(
        chatWithMiniMax({ messages: [{ role: 'user', content: 'test' }] })
      ).rejects.toThrow('MiniMax API error: 500')
    })

    it('should include system prompt when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: '回复' } }],
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { chatWithMiniMax } = await import('@/lib/minimax')
      
      await chatWithMiniMax({
        messages: [
          { role: 'system', content: '你是一个助手' },
          { role: 'user', content: '你好' },
        ],
      })

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const requestInit = callArgs[1] as RequestInit
      const body = JSON.parse(requestInit.body as string)
      
      expect(body.messages).toHaveLength(2)
      expect(body.messages[0].role).toBe('system')
    })
  })

  describe('Image Analysis API', () => {
    it('should analyze image successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '图片中有三个人站在房子前...',
          },
        }],
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { analyzeImage } = await import('@/lib/minimax')
      
      const result = await analyzeImage('base64encodedimage')

      expect(result.description).toBe('图片中有三个人站在房子前...')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should include custom prompt when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: '分析结果' } }],
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { analyzeImage } = await import('@/lib/minimax')
      
      await analyzeImage('base64', '自定义提示词')

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const requestInit = callArgs[1] as RequestInit
      const body = JSON.parse(requestInit.body as string)
      
      expect(body.messages[0].content[0].text).toBe('自定义提示词')
    })
  })

  describe('TTS API', () => {
    it('should convert text to speech', async () => {
      const mockResponse = {
        data: {
          audio: '68656c6c6f', // hex encoded "hello"
        },
        extra_info: {
          audio_length: 1000,
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { textToSpeech } = await import('@/lib/minimax')
      
      const result = await textToSpeech('你好')

      expect(result.audioBase64).toContain('data:audio/mp3')
      expect(result.duration).toBe(1000)
    })

    it('should throw error when audio data is missing', async () => {
      const mockResponse = {
        data: {},
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const { textToSpeech } = await import('@/lib/minimax')
      
      await expect(textToSpeech('test')).rejects.toThrow('missing audio data')
    })
  })

  describe('Biography System Prompt', () => {
    it('should generate correct system prompt', async () => {
      const { getBiographySystemPrompt } = await import('@/lib/minimax')
      
      const prompt = getBiographySystemPrompt({
        subjectName: '张老先生',
        currentChapter: '大学时光',
        knownFacts: ['1975年入学', '中文系'],
      })

      expect(prompt).toContain('张老先生')
      expect(prompt).toContain('大学时光')
      expect(prompt).toContain('1975年入学')
      expect(prompt).toContain('采访者')
    })

    it('should work with minimal context', async () => {
      const { getBiographySystemPrompt } = await import('@/lib/minimax')
      
      const prompt = getBiographySystemPrompt({})

      expect(prompt).toContain('传记采访者')
      expect(prompt).toContain('温和亲切')
    })
  })
})
