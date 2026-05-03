import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone, password, nickname, school, email } = await req.json()

    // 参数校验
    if (!phone || !password || !nickname) {
      return NextResponse.json(
        { error: '手机号、密码、昵称为必填项' },
        { status: 400 }
      )
    }

    if (!/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    // 检查手机号是否已注册
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: '该手机号已注册' }, { status: 409 })
    }

    // 创建用户
    const passwordHash = await hashPassword(password)
    const authStatus = email && email.endsWith('.edu.cn') ? 'email' : 'none'

    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        nickname,
        school: school || '',
        email: email || '',
        authStatus,
      },
    })

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
        school: user.school,
        level: user.level,
        authStatus: user.authStatus,
      },
      token,
    })

    // 设置 cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    })

    return response
  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
