import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signToken } from '@/lib/auth'
import { checkLoginRateLimit, resetLoginRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码为必填项' },
        { status: 400 }
      )
    }

    // 频率限制
    const rateCheck = checkLoginRateLimit(phone)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `登录尝试过多，请${rateCheck.retryAfter}秒后重试` },
        { status: 429 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: '账号已被禁用' }, { status: 403 })
    }

    // 验证密码
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: '手机号或密码错误' }, { status: 401 })
    }

    // 登录成功，重置频率限制
    resetLoginRateLimit(phone)

    // 生成 token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      level: user.level,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        school: user.school,
        level: user.level,
        authStatus: user.authStatus,
        reviewCount: user.reviewCount,
        likeReceived: user.likeReceived,
      },
      token,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
