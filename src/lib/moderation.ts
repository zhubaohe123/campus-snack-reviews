// 内容审核服务
// 初期使用规则引擎 + 文本分析，后续可接入云厂商 AI 审核 API

// ========== 敏感词库（分严重等级） ==========
const SENSITIVE_WORDS_STRICT = [
  // 辱骂歧视 - 高权重
  '傻逼', '操你', '去死', '废物', '白痴',
  // 色情 - 高权重
  '约炮', '一夜情', '上门服务',
]

const SENSITIVE_WORDS_MODERATE = [
  // 明确广告引流 - 中权重
  '加微信', '加vx', '加V', '免费领', '点击链接',
  '返现', '佣金', '招商', '加盟',
]

const SENSITIVE_WORDS_LOOSE = [
  // 可能在正常语境出现 - 低权重，需结合上下文
  '扫码', '优惠券', '下单', '代理', '垃圾',
]

// ========== 审核结果类型 ==========
export interface ModerationResult {
  approved: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  score: number // 0-100，越高越危险
  flags: string[]
  reason?: string
}

// ========== 敏感词检测（分级评分） ==========
function checkSensitiveWords(text: string): { found: boolean; words: string[]; score: number } {
  const lower = text.toLowerCase()
  const found: string[] = []
  let score = 0

  for (const w of SENSITIVE_WORDS_STRICT) {
    if (lower.includes(w.toLowerCase())) { found.push(w); score += 50 }
  }
  for (const w of SENSITIVE_WORDS_MODERATE) {
    if (lower.includes(w.toLowerCase())) { found.push(w); score += 30 }
  }
  for (const w of SENSITIVE_WORDS_LOOSE) {
    if (lower.includes(w.toLowerCase())) { found.push(w); score += 10 }
  }

  return { found: found.length > 0, words: found, score }
}

// ========== 内容质量检测 ==========
function checkContentQuality(text: string): { score: number; flags: string[] } {
  const flags: string[] = []
  let score = 0

  // 纯表情/无意义字符
  const emojiOnly = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+$/u
  if (emojiOnly.test(text.replace(/\s/g, ''))) {
    flags.push('纯表情内容')
    score += 40
  }

  // 重复字符
  const repeatMatch = text.match(/(.)\1{5,}/g)
  if (repeatMatch) {
    flags.push('大量重复字符')
    score += 30
  }

  // 纯数字
  if (/^\d+$/.test(text.replace(/\s/g, ''))) {
    flags.push('纯数字内容')
    score += 35
  }

  // 过短（虽然API已校验20字，但再保险）
  if (text.length < 10) {
    flags.push('内容过短')
    score += 25
  }

  // 无中文（可能是乱码）
  const chineseCount = (text.match(/[一-龥]/g) || []).length
  if (chineseCount < text.length * 0.2 && text.length > 10) {
    flags.push('缺少中文内容')
    score += 20
  }

  return { score, flags }
}

// ========== 相似度检测（trigram 方式，更适合中文） ==========
function getTrigrams(text: string): Set<string> {
  const trigrams = new Set<string>()
  for (let i = 0; i <= text.length - 3; i++) {
    trigrams.add(text.slice(i, i + 3))
  }
  // 也加入 bigram 提高短文本敏感度
  for (let i = 0; i <= text.length - 2; i++) {
    trigrams.add(text.slice(i, i + 2))
  }
  return trigrams
}

function calcSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a.length < 4 || b.length < 4) return 0
  const triA = getTrigrams(a)
  const triB = getTrigrams(b)
  const intersection = new Set([...triA].filter((x) => triB.has(x)))
  const union = new Set([...triA, ...triB])
  return intersection.size / union.size
}

export async function checkDuplicateContent(
  content: string,
  recentContents: string[]
): Promise<{ isDuplicate: boolean; maxSimilarity: number; similarTo?: string }> {
  let maxSimilarity = 0
  let similarTo = ''

  for (const recent of recentContents) {
    const sim = calcSimilarity(content, recent)
    if (sim > maxSimilarity) {
      maxSimilarity = sim
      similarTo = recent
    }
  }

  return {
    isDuplicate: maxSimilarity > 0.8,
    maxSimilarity: Math.round(maxSimilarity * 100) / 100,
    similarTo: maxSimilarity > 0.8 ? similarTo.slice(0, 50) + '...' : undefined,
  }
}

// ========== AI 生成内容检测（简单启发式） ==========
function checkAIGenerated(text: string): { likely: boolean; score: number } {
  let score = 0

  // AI 生成内容的典型特征
  // 1. 过于工整的句式
  const sentences = text.split(/[。！？.!?]/).filter(Boolean)
  if (sentences.length >= 3) {
    const lengths = sentences.map((s) => s.length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / lengths.length
    // 方差过小说明句式过于工整
    if (variance < 5 && avg > 10) {
      score += 20
    }
  }

  // 2. 常见 AI 套话
  const aiPhrases = ['总的来说', '综上所述', '值得注意的是', '不得不说', '作为一个', '首先.*其次.*最后']
  for (const phrase of aiPhrases) {
    if (new RegExp(phrase).test(text)) {
      score += 10
    }
  }

  // 3. 过于书面化的用词密度
  const formalWords = ['确实', '推荐', '值得', '性价比', '体验', '总体']
  const formalCount = formalWords.filter((w) => text.includes(w)).length
  if (formalCount >= 4) {
    score += 15
  }

  return { likely: score >= 30, score }
}

// ========== 刷分行为检测 ==========
export interface BehaviorCheck {
  suspicious: boolean
  flags: string[]
  score: number
}

export function checkBehaviorPatterns(params: {
  userId: string
  recentReviewCount: number // 最近1小时评价数
  recentMerchantIds: string[] // 最近评价的商户ID
  accountAgeDays: number
  reviewCount: number
}): BehaviorCheck {
  const flags: string[] = []
  let score = 0

  // 短时间内密集评价
  if (params.recentReviewCount >= 3) {
    flags.push(`1小时内发布${params.recentReviewCount}条评价`)
    score += 30
  }

  // 集中给同一商户评价
  const merchantSet = new Set(params.recentMerchantIds)
  if (merchantSet.size < params.recentMerchantIds.length * 0.5 && params.recentMerchantIds.length >= 3) {
    flags.push('集中评价少量商户')
    score += 25
  }

  // 新账号高产
  if (params.accountAgeDays < 1 && params.reviewCount >= 3) {
    flags.push('新账号高频评价')
    score += 35
  }

  if (params.accountAgeDays < 7 && params.reviewCount >= 10) {
    flags.push('新账号大量评价')
    score += 20
  }

  return { suspicious: score >= 30, flags, score }
}

// ========== 综合审核入口 ==========
export async function moderateReview(params: {
  content: string
  userId: string
  merchantId: string
  recentContents: string[]
  recentReviewCount: number
  recentMerchantIds: string[]
  accountAgeDays: number
  reviewCount: number
}): Promise<ModerationResult> {
  const flags: string[] = []
  let totalScore = 0

  // 1. 敏感词检测
  const sensitive = checkSensitiveWords(params.content)
  if (sensitive.found) {
    flags.push(`敏感词: ${sensitive.words.join(', ')}`)
    totalScore += sensitive.score
  }

  // 2. 内容质量
  const quality = checkContentQuality(params.content)
  flags.push(...quality.flags)
  totalScore += quality.score

  // 3. 相似度检测
  const dup = await checkDuplicateContent(params.content, params.recentContents)
  if (dup.isDuplicate) {
    flags.push(`与已有评价相似度过高 (${dup.maxSimilarity})`)
    totalScore += 40
  }

  // 4. AI 生成检测
  const aiCheck = checkAIGenerated(params.content)
  if (aiCheck.likely) {
    flags.push('疑似AI生成内容')
    totalScore += 15
  }

  // 5. 行为模式
  const behavior = checkBehaviorPatterns({
    userId: params.userId,
    recentReviewCount: params.recentReviewCount,
    recentMerchantIds: params.recentMerchantIds,
    accountAgeDays: params.accountAgeDays,
    reviewCount: params.reviewCount,
  })
  flags.push(...behavior.flags)
  totalScore += behavior.score

  // 确定风险等级
  totalScore = Math.min(100, totalScore)
  let riskLevel: ModerationResult['riskLevel'] = 'low'
  let approved = true

  if (totalScore >= 80) {
    riskLevel = 'critical'
    approved = false
  } else if (totalScore >= 60) {
    riskLevel = 'high'
    approved = false
  } else if (totalScore >= 40) {
    riskLevel = 'medium'
    // 中风险：自动通过但标记待审
    approved = true
  }

  return {
    approved,
    riskLevel,
    score: totalScore,
    flags,
    reason: flags.length > 0 ? flags.join('; ') : undefined,
  }
}
