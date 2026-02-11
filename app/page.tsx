import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserMenu } from "@/components/auth/UserMenu"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      {/* 导航栏 */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-stone-800">
          时光手记
        </Link>
        <UserMenu />
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-stone-800 mb-6">
          时光手记
        </h1>
        <p className="text-xl text-stone-600 mb-4">
          用 AI 记录人生故事，为所爱之人留下永恒回忆
        </p>
        <p className="text-stone-500 max-w-2xl mx-auto mb-10">
          上传照片、文字和语音，AI 将与你深度对话，挖掘那些被时间掩埋的珍贵记忆，
          最终生成一本精美的个人传记电子书。
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/projects/new">
            <Button size="lg" className="bg-stone-800 hover:bg-stone-700">
              开始创作
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="lg" variant="outline">
              查看项目
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-stone-800 mb-12">
          核心功能
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📸 多模态理解</CardTitle>
              <CardDescription>
                AI 自动分析照片、手写笔记、语音备忘录，提取时间线和关键信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-600">
                支持图片 OCR、语音转文字，智能识别照片中的人物和场景
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎙️ 深度访谈</CardTitle>
              <CardDescription>
                文字或语音对话，像老朋友一样聊人生
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-600">
                AI 根据已有资料智能提问，逐步挖掘故事细节和情感
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📖 精美成书</CardTitle>
              <CardDescription>
                自动生成排版精美的电子书
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-600">
                支持 EPUB、PDF 格式，可导出打印成实体书
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-stone-800 mb-12">
          三步完成传记
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">上传资料</h3>
            <p className="text-stone-600">照片、日记、信件、语音...任何承载记忆的载体</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">深度对话</h3>
            <p className="text-stone-600">与 AI 进行多轮访谈，逐步完善人生故事</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">生成传记</h3>
            <p className="text-stone-600">AI 整理成书，精美排版，永久保存</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-stone-800 text-white border-none">
          <CardHeader>
            <CardTitle className="text-2xl text-white">开始记录珍贵记忆</CardTitle>
            <CardDescription className="text-stone-300">
              每个人的人生都值得被记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects/new">
              <Button size="lg" className="bg-white text-stone-800 hover:bg-stone-100">
                免费开始创作
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-stone-500">
        <p>© 2026 时光手记 TimeJournal. 用 AI 守护每一份珍贵记忆。</p>
      </footer>
    </main>
  )
}
