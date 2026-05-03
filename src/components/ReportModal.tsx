'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ReportModalProps {
  reviewId: string
  onClose: () => void
}

const reportReasons = [
  { value: '虚假评价', label: '虚假评价', desc: '内容不真实，疑似编造' },
  { value: '广告内容', label: '广告内容', desc: '包含商业推广或引流' },
  { value: '恶意差评', label: '恶意差评', desc: '无事实依据的恶意攻击' },
  { value: '抄袭', label: '抄袭', desc: '复制他人评价内容' },
  { value: '其他', label: '其他', desc: '其他违规行为' },
]

export function ReportModal({ reviewId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async () => {
    if (!reason) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason, description }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        alert(data.error || '举报失败')
      }
    } catch {
      alert('举报失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  const content = submitted ? (
    <div className="card p-6 w-80 text-center" onClick={(e) => e.stopPropagation()}>
      <span className="text-4xl">✅</span>
      <h3 className="font-semibold mt-3">举报已提交</h3>
      <p className="text-sm text-gray-500 mt-1">我们会在24小时内处理，感谢你的反馈</p>
      <button onClick={onClose} className="btn-primary mt-4 w-full">确定</button>
    </div>
  ) : (
    <div className="card p-5 w-80" onClick={(e) => e.stopPropagation()}>
      <h3 className="font-semibold mb-3">举报评价</h3>

      <div className="space-y-2 mb-4">
        {reportReasons.map((r) => (
          <label
            key={r.value}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
              reason === r.value
                ? 'bg-primary-50 border border-primary-200'
                : 'bg-gray-50 border border-transparent hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={r.value}
              checked={reason === r.value}
              onChange={() => setReason(r.value)}
              className="accent-primary-500"
            />
            <div>
              <p className="text-sm font-medium">{r.label}</p>
              <p className="text-xs text-gray-500">{r.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="补充说明（可选）"
        className="input text-sm min-h-[60px] resize-none mb-4"
        maxLength={200}
      />

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">取消</button>
        <button
          onClick={handleSubmit}
          disabled={!reason || submitting}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交举报'}
        </button>
      </div>
    </div>
  )

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {content}
    </div>,
    document.body
  )
}
