'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { reviewApi } from '@/lib/api'
import { RatingStars } from './RatingStars'
import { ReplySection } from './ReplySection'
import { ShareModal } from './ShareModal'
import { ReportModal } from './ReportModal'
import { formatTime, getLevelColor, getPlaceholderColor } from '@/lib/utils'

interface ReviewCardProps {
  review: any
  showMerchant?: boolean
}

export function ReviewCard({ review, showMerchant = false }: ReviewCardProps) {
  const { user } = useAuth()

  // 兼容嵌套和扁平结构
  const userId = review.userId || review.user?.id || ''
  const userName = review.userName || review.user?.nickname || '匿名用户'
  const userLevel = review.userLevel || review.user?.level || 1
  const isVerified = review.isVerified || review.user?.authStatus === 'verified'
  const merchantName = review.merchantName || review.merchant?.name || ''
  const replies = review.replies || []

  const avatarColor = getPlaceholderColor(userId)

  // 交互状态
  const [likes, setLikes] = useState(review.likes || 0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const handleLike = async () => {
    if (!user) {
      alert('请先登录')
      return
    }
    if (likeLoading) return
    setLikeLoading(true)

    // 乐观更新
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikes((prev: number) => wasLiked ? prev - 1 : prev + 1)

    try {
      const result = await reviewApi.like(review.id)
      setLiked(result.liked)
      setLikes(result.likes)
    } catch {
      // 回滚
      setLiked(wasLiked)
      setLikes((prev: number) => wasLiked ? prev + 1 : prev - 1)
    } finally {
      setLikeLoading(false)
    }
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/merchants/${review.merchantId || review.merchant?.id}`
    : ''

  return (
    <div className="card p-4">
      {/* 用户信息 */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm`}
        >
          {userName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{userName}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getLevelColor(
                userLevel
              )}`}
            >
              Lv{userLevel}
            </span>
            {isVerified && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                已认证
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTime(review.createdAt)}
          </p>
        </div>
        {review.isFeatured && (
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
            精华
          </span>
        )}
      </div>

      {/* 商户名 */}
      {showMerchant && merchantName && (
        <p className="text-xs text-primary-600 mt-2 font-medium">
          评价了 {merchantName}
        </p>
      )}

      {/* 评分 */}
      <div className="mt-3">
        <RatingStars rating={review.overallRating || 0} size="sm" />
      </div>

      {/* 评价内容 */}
      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
        {review.content}
      </p>

      {/* 互动栏 */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs transition-colors ${
            liked
              ? 'text-primary-500 font-medium'
              : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <span>{liked ? '👍' : '👍'}</span>
          <span>觉得有用 ({likes})</span>
        </button>

        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500 transition-colors"
        >
          <span>📤</span>
          <span>分享</span>
        </button>

        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors ml-auto"
        >
          举报
        </button>
      </div>

      {/* 回复区域 */}
      <ReplySection
        reviewId={review.id}
        replies={replies}
      />

      {/* 分享弹窗 */}
      {showShare && (
        <ShareModal
          title={`${userName}评价了${merchantName || '一家店'}`}
          description={review.content?.slice(0, 60) + '...'}
          url={shareUrl}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* 举报弹窗 */}
      {showReport && (
        <ReportModal
          reviewId={review.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
