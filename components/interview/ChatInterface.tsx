'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, MicOff, User, Bot } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  audioUrl?: string
  isLoading?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
  mode?: 'text' | 'voice'
  onModeChange?: (mode: 'text' | 'voice') => void
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isLoading,
  mode = 'text',
  onModeChange 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    // TODO: 实现语音录制
    setIsRecording(!isRecording)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* 模式切换 */}
      {onModeChange && (
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('text')}
            className={mode === 'text' ? 'bg-stone-800' : ''}
          >
            文字对话
          </Button>
          <Button
            variant={mode === 'voice' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('voice')}
            className={mode === 'voice' ? 'bg-stone-800' : ''}
          >
            语音通话
          </Button>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
        {messages.length === 0 && (
          <div className="text-center text-stone-400 py-12">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>开始对话吧，AI 采访助手已准备好</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* 头像 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-stone-800 text-white' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* 消息内容 */}
            <div className={`max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <Card className={`p-3 ${
                message.role === 'user' 
                  ? 'bg-stone-800 text-white border-stone-800' 
                  : 'bg-white'
              }`}>
                {message.isLoading ? (
                  <div className="flex items-center gap-2 text-stone-400">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-200" />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </Card>
              <span className="text-xs text-stone-400 mt-1 block">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t pt-4">
        {mode === 'text' ? (
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息，按 Enter 发送，Shift+Enter 换行..."
              className="min-h-[44px] max-h-[200px] resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-stone-800 hover:bg-stone-700 px-3"
            >
              <Send size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={toggleRecording}
              className={`rounded-full w-16 h-16 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-stone-800 hover:bg-stone-700'
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
          </div>
        )}
        
        <p className="text-xs text-stone-400 text-center mt-2">
          {mode === 'voice' && (isRecording ? '正在录音... 点击停止' : '点击开始语音对话')}
        </p>
      </div>
    </div>
  )
}
