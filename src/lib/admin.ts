// 管理员权限校验
import { prisma } from './prisma'
import { getCurrentUser } from './auth'

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '请先登录', status: 401, user: null }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, nickname: true },
  })

  if (!dbUser || dbUser.role !== 'admin') {
    return { error: '无管理权限', status: 403, user: null }
  }

  return { error: null, status: 200, user: dbUser }
}
