'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { reviewApi } from '@/lib/api'
import { formatTime } from '@/lib/utils'

interface Reply {
  id: string
  userId: string
  content: string
  isMerchant: boolean
  createdAt: string
  user?: { id: string; nickname: string; level?: number }
  userName?: string
}

interface ReplySectionProps {
  reviewId: string
  replies: Reply[]
  onReplyAdded?: (reply: Reply) => void
}

export function ReplySection({ reviewId, replies, onReplyAdded }: ReplySectionProps) {
  const { user } = useAuth()
  const [showAll, setShowAll] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies)

  const displayReplies = showAll ? localReplies : localReplies.slice(0, 2)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const newReply = await reviewApi.reply(reviewId, content.trim())
      setLocalReplies((prev) => [...prev, newReply])
      setContent('')
      setShowForm(false)
      setShowAll(true)
      onReplyAdded?.(newReply)
    } catch (error: any) {
      alert(error.message || '回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (localReplies.length === 0 && !showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
      >
        💬 写回复
      </button>
    )
  }

  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-3">
      {/* 回复列表 */}
      {localReplies.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-2">
            {localReplies.length}条回复
          </p>
          <div className="space-y-2">
            {displayReplies.map((reply) => (
              <div key={reply.id} className="text-xs">
                <span className="font-medium text-gray-700">
                  {reply.user?.nickname || reply.userName || '匿名'}
                </span>
                {reply.isMerchant && (
                  <span className="ml-1 text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded">
                    商家
                  </span>
                )}
                <span className="text-gray-600 ml-1">{reply.content}</span>
                <span className="text-gray-400 ml-2 text-[10px]">
                  {formatTime(reply.createdAt)}
                </span>
              </div>
            ))}
          </div>
          {localReplies.length > 2 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-primary-500 mt-2 hover:underline"
            >
              查看全部{localReplies.length}条回复
            </button>
          )}
        </>
      )}

      {/* 回复表单 */}
      {showForm ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={user ? '写回复...' : '请先登录'}
            disabled={!user}
            className="flex-1 text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500/30 disabled:bg-gray-100"
            maxLength={500}
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting || !user}
            className="text-xs px-3 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50 hover:bg-primary-600 transition-colors"
          >
            {submitting ? '...' : '发送'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-xs text-primary-500 mt-2 hover:underline"
        >
          写回复
        </button>
      )}
    </div>
  )
}
