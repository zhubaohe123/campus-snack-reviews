// 简单的内存频率限制器
// 生产环境应使用 Redis

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 15 * 60 * 1000 // 15分钟
const MAX_ATTEMPTS = 5

export function checkLoginRateLimit(phone: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = loginAttempts.get(phone)

  if (!record || now > record.resetAt) {
    loginAttempts.set(phone, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}

export function resetLoginRateLimit(phone: string) {
  loginAttempts.delete(phone)
}
