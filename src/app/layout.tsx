import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthWrapper } from '@/components/AuthWrapper'

export const metadata: Metadata = {
  title: '校园小吃点评 - 纯粹真实的大学生美食社区',
  description:
    '由大学生创建、为大学生服务的校园美食点评平台。零商业化干扰，100%真实评价。',
  keywords: '校园美食,大学生点评,食堂评价,小吃推荐',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="pb-20 md:pb-0">
        <AuthWrapper>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-4">{children}</main>
        </AuthWrapper>
      </body>
    </html>
  )
}
