'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ShareModalProps {
  title: string
  description: string
  url: string
  onClose: () => void
}

export function ShareModal({ title, description, url, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 锁定背景滚动
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareItems = [
    { name: '复制链接', icon: '🔗', action: handleCopy },
    { name: '微信', icon: '💬', action: () => { handleCopy(); alert('链接已复制，请在微信中粘贴分享') } },
    { name: '微博', icon: '📢', action: () => window.open(`https://service.weibo.com/share/share.php?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank') },
    { name: 'QQ', icon: '🐧', action: () => window.open(`https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}&url=${encodeURIComponent(url)}`, '_blank') },
  ]

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div className="card p-5 w-72" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-center mb-4">分享到</h3>

        <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-3 mb-4">
          <p className="text-sm font-medium text-gray-800 line-clamp-2">{title}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{description}</p>
          <p className="text-[10px] text-primary-500 mt-1">校园小吃点评</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {shareItems.map((item) => (
            <button
              key={item.name}
              onClick={item.action}
              className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] text-gray-600">
                {item.name === '复制链接' && copied ? '已复制!' : item.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>,
    document.body
  )
}
