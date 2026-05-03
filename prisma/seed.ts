import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充种子数据...')

  // 清空旧数据
  await prisma.report.deleteMany()
  await prisma.like.deleteMany()
  await prisma.reply.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.review.deleteMany()
  await prisma.merchant.deleteMany()
  await prisma.user.deleteMany()

  // ========== 创建用户 ==========
  const passwordHash = await bcrypt.hash('123456', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        phone: '13800000001',
        nickname: '吃货小王',
        passwordHash,
        school: '北京大学',
        email: 'xiaowang@pku.edu.cn',
        level: 3,
        role: 'admin',
        authStatus: 'verified',
        preferences: JSON.stringify(['辣', '面食', '奶茶']),
        reviewCount: 23,
        likeReceived: 45,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800000002',
        nickname: '每天都要喝奶茶',
        passwordHash,
        school: '北京大学',
        email: 'naicha@pku.edu.cn',
        level: 4,
        authStatus: 'verified',
        preferences: JSON.stringify(['奶茶', '甜品']),
        reviewCount: 52,
        likeReceived: 98,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800000003',
        nickname: '面食爱好者',
        passwordHash,
        school: '北京大学',
        email: 'mianshi@pku.edu.cn',
        level: 2,
        authStatus: 'verified',
        preferences: JSON.stringify(['面食', '辣']),
        reviewCount: 8,
        likeReceived: 15,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800000004',
        nickname: '省钱达人',
        passwordHash,
        school: '北京大学',
        email: 'shengqian@pku.edu.cn',
        level: 3,
        authStatus: 'verified',
        preferences: JSON.stringify(['性价比']),
        reviewCount: 30,
        likeReceived: 60,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800000005',
        nickname: '不能吃辣',
        passwordHash,
        school: '北京大学',
        email: 'bula@pku.edu.cn',
        level: 1,
        authStatus: 'email',
        preferences: JSON.stringify(['不辣', '清淡']),
        reviewCount: 2,
        likeReceived: 3,
      },
    }),
    prisma.user.create({
      data: {
        phone: '13800000006',
        nickname: '夜猫子',
        passwordHash,
        school: '北京大学',
        email: 'yemaozi@pku.edu.cn',
        level: 4,
        authStatus: 'verified',
        preferences: JSON.stringify(['烧烤', '夜宵']),
        reviewCount: 65,
        likeReceived: 120,
      },
    }),
  ])

  console.log(`✅ 创建了 ${users.length} 个用户`)

  // ========== 创建商户 ==========
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        name: '学一食堂·麻辣香锅',
        category: '食堂',
        subCategory: '麻辣香锅',
        address: '校内学一食堂二楼C区',
        avgPrice: 18,
        rating: 4.5,
        ratingTaste: 4.6,
        ratingHygiene: 4.3,
        ratingService: 4.2,
        ratingValue: 4.8,
        ratingPortion: 4.5,
        reviewCount: 128,
        openHours: '10:30-13:30, 16:30-19:30',
        tags: JSON.stringify(['分量大', '出餐快', '性价比高']),
        popularDishes: JSON.stringify([
          { name: '麻辣香锅（大份）', price: 22, mentions: 89 },
          { name: '麻辣香锅（小份）', price: 15, mentions: 56 },
          { name: '酸辣粉', price: 10, mentions: 34 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '老张家烤冷面',
        category: '小吃街',
        subCategory: '小吃',
        address: '北门小吃街第3家',
        avgPrice: 8,
        rating: 4.7,
        ratingTaste: 4.8,
        ratingHygiene: 4.0,
        ratingService: 4.5,
        ratingValue: 4.9,
        ratingPortion: 4.6,
        reviewCount: 256,
        openHours: '16:00-23:00',
        tags: JSON.stringify(['排队王', '必吃', '夜宵首选']),
        popularDishes: JSON.stringify([
          { name: '招牌烤冷面', price: 8, mentions: 200 },
          { name: '芝士烤冷面', price: 12, mentions: 88 },
          { name: '火鸡面烤冷面', price: 10, mentions: 65 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '一点点奶茶',
        category: '饮品甜品',
        subCategory: '奶茶',
        address: '东门商业街A102',
        avgPrice: 15,
        rating: 4.3,
        ratingTaste: 4.4,
        ratingHygiene: 4.5,
        ratingService: 4.0,
        ratingValue: 4.1,
        ratingPortion: 4.3,
        reviewCount: 189,
        openHours: '09:00-22:00',
        tags: JSON.stringify(['品种多', '可加料', '下午茶']),
        popularDishes: JSON.stringify([
          { name: '波霸奶茶', price: 13, mentions: 120 },
          { name: '四季春茶', price: 10, mentions: 78 },
          { name: '冰淇淋红茶', price: 16, mentions: 55 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '黄焖鸡米饭',
        category: '周边餐馆',
        subCategory: '中式快餐',
        address: '西门外50米',
        avgPrice: 16,
        rating: 4.1,
        ratingTaste: 4.2,
        ratingHygiene: 3.8,
        ratingService: 3.9,
        ratingValue: 4.5,
        ratingPortion: 4.3,
        reviewCount: 95,
        openHours: '10:00-21:00',
        tags: JSON.stringify(['经典', '下饭', '实惠']),
        popularDishes: JSON.stringify([
          { name: '黄焖鸡米饭', price: 16, mentions: 80 },
          { name: '黄焖排骨米饭', price: 20, mentions: 45 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '重庆小面馆',
        category: '周边餐馆',
        subCategory: '面食',
        address: '南门小吃街拐角',
        avgPrice: 14,
        rating: 4.6,
        ratingTaste: 4.8,
        ratingHygiene: 4.2,
        ratingService: 4.3,
        ratingValue: 4.7,
        ratingPortion: 4.5,
        reviewCount: 167,
        openHours: '07:00-21:00',
        tags: JSON.stringify(['正宗', '辣', '早餐好选择']),
        popularDishes: JSON.stringify([
          { name: '重庆小面', price: 12, mentions: 130 },
          { name: '豌杂面', price: 14, mentions: 90 },
          { name: '酸辣粉', price: 10, mentions: 70 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '学二食堂·铁板饭',
        category: '食堂',
        subCategory: '铁板饭',
        address: '校内学二食堂一楼',
        avgPrice: 15,
        rating: 4.2,
        ratingTaste: 4.3,
        ratingHygiene: 4.4,
        ratingService: 3.8,
        ratingValue: 4.5,
        ratingPortion: 4.0,
        reviewCount: 76,
        openHours: '11:00-13:00, 17:00-19:00',
        tags: JSON.stringify(['滋滋响', '现做', '排队']),
        popularDishes: JSON.stringify([
          { name: '黑椒牛排铁板饭', price: 18, mentions: 50 },
          { name: '铁板炒饭', price: 12, mentions: 40 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '赵记烧烤',
        category: '夜市',
        subCategory: '烧烤',
        address: '北门夜市摊位B区',
        avgPrice: 25,
        rating: 4.4,
        ratingTaste: 4.6,
        ratingHygiene: 3.9,
        ratingService: 4.2,
        ratingValue: 4.3,
        ratingPortion: 4.5,
        reviewCount: 143,
        openHours: '18:00-02:00',
        tags: JSON.stringify(['夜宵', '烤串', '聚会']),
        popularDishes: JSON.stringify([
          { name: '羊肉串（10串）', price: 20, mentions: 110 },
          { name: '烤鸡翅', price: 6, mentions: 80 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '蜜雪冰城',
        category: '饮品甜品',
        subCategory: '冰淇淋/饮品',
        address: '北门小吃街入口',
        avgPrice: 6,
        rating: 4.0,
        ratingTaste: 4.0,
        ratingHygiene: 4.2,
        ratingService: 3.8,
        ratingValue: 4.8,
        ratingPortion: 3.9,
        reviewCount: 210,
        openHours: '09:30-22:30',
        tags: JSON.stringify(['便宜', '冰淇淋', '夏天必备']),
        popularDishes: JSON.stringify([
          { name: '柠檬水', price: 4, mentions: 180 },
          { name: '摩天脆脆冰淇淋', price: 3, mentions: 150 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '沙县小吃',
        category: '周边餐馆',
        subCategory: '中式快餐',
        address: '西门外100米',
        avgPrice: 12,
        rating: 3.9,
        ratingTaste: 3.8,
        ratingHygiene: 4.0,
        ratingService: 3.9,
        ratingValue: 4.3,
        ratingPortion: 3.8,
        reviewCount: 62,
        openHours: '06:30-22:00',
        tags: JSON.stringify(['早餐', '实惠', '经典']),
        popularDishes: JSON.stringify([
          { name: '蒸饺', price: 8, mentions: 45 },
          { name: '拌面', price: 7, mentions: 40 },
        ]),
      },
    }),
    prisma.merchant.create({
      data: {
        name: '学三食堂·清真窗口',
        category: '食堂',
        subCategory: '清真',
        address: '校内学三食堂二楼',
        avgPrice: 14,
        rating: 4.3,
        ratingTaste: 4.4,
        ratingHygiene: 4.5,
        ratingService: 4.1,
        ratingValue: 4.4,
        ratingPortion: 4.2,
        reviewCount: 54,
        openHours: '11:00-13:30, 17:00-19:30',
        tags: JSON.stringify(['清真', '大盘鸡', '拉面']),
        popularDishes: JSON.stringify([
          { name: '大盘鸡', price: 25, mentions: 35 },
          { name: '牛肉拉面', price: 12, mentions: 30 },
        ]),
      },
    }),
  ])

  console.log(`✅ 创建了 ${merchants.length} 家商户`)

  // ========== 创建评价 ==========
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        merchantId: merchants[0].id,
        ratingTaste: 5,
        ratingHygiene: 4,
        ratingService: 4,
        ratingValue: 5,
        ratingPortion: 5,
        overallRating: 4.7,
        content:
          '学一楼的麻辣香锅真的是性价比之王！大份才22块钱，肉和菜的量都很足。推荐加宽粉和午餐肉，吸满了汤汁特别入味。唯一的小缺点是中午排队太长了，建议11点前去。阿姨手速很快，基本5分钟就能出餐。',
        likes: 23,
        richness: 1.2,
        status: 'approved',
        isFeatured: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        merchantId: merchants[1].id,
        ratingTaste: 5,
        ratingHygiene: 4,
        ratingService: 5,
        ratingValue: 5,
        ratingPortion: 5,
        overallRating: 4.8,
        content:
          '北门烤冷面之神！老板做了十几年了，手艺没得说。酱料是秘制的，酸甜辣度刚刚好。芝士款拉丝效果绝了，拍照发朋友圈必点。建议避开晚高峰，不然要排20分钟以上。冬天来一份热乎乎的烤冷面，幸福感拉满。',
        likes: 45,
        richness: 1.1,
        status: 'approved',
        isFeatured: true,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        merchantId: merchants[4].id,
        ratingTaste: 5,
        ratingHygiene: 4,
        ratingService: 4,
        ratingValue: 5,
        ratingPortion: 5,
        overallRating: 4.7,
        content:
          '作为一个重庆人，这家小面算是比较正宗的了。面条劲道，红油香而不腻。豌杂面里的豌豆炖得很烂，杂酱也很香。不能吃辣的同学建议点微辣，因为他们的微辣已经相当于外面的中辣了。价格也很良心，学生党友好。',
        likes: 18,
        richness: 1.1,
        status: 'approved',
        isFeatured: false,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[3].id,
        merchantId: merchants[7].id,
        ratingTaste: 4,
        ratingHygiene: 4,
        ratingService: 4,
        ratingValue: 5,
        ratingPortion: 4,
        overallRating: 4.2,
        content:
          '4块钱的柠檬水，这个价格谁不爱？夏天一天一杯不是梦。冰淇淋也很划算，3块钱的甜筒比肯德基的还大。唯一需要注意的是高峰期要等比较久，建议错峰去。甜蜜蜜的歌已经刻进DNA了。',
        likes: 32,
        richness: 1.0,
        status: 'approved',
        isFeatured: false,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[4].id,
        merchantId: merchants[5].id,
        ratingTaste: 4,
        ratingHygiene: 5,
        ratingService: 3,
        ratingValue: 5,
        ratingPortion: 4,
        overallRating: 4.2,
        content:
          '黑椒牛排铁板饭推荐！端上来滋滋响特别有食欲。牛排虽然不是真牛排但是味道不错，黑椒汁很浓郁。饭量正常，男生可能需要加饭。排队时间看运气，有时候10分钟有时候半小时。',
        likes: 8,
        richness: 1.0,
        status: 'approved',
        isFeatured: false,
      },
    }),
    prisma.review.create({
      data: {
        userId: users[5].id,
        merchantId: merchants[6].id,
        ratingTaste: 5,
        ratingHygiene: 4,
        ratingService: 4,
        ratingValue: 4,
        ratingPortion: 5,
        overallRating: 4.5,
        content:
          '期末复习到深夜的最佳伴侣！赵记烧烤开到凌晨2点，羊肉串烤得外焦里嫩，撒上孜然辣椒面绝了。烤茄子蒜香味十足，配上一瓶冰啤简直是人间美味。建议4人以上一起去，可以多点几个品种。人均25左右，聚餐性价比很高。',
        likes: 27,
        richness: 1.1,
        status: 'approved',
        isFeatured: true,
      },
    }),
  ])

  console.log(`✅ 创建了 ${reviews.length} 条评价`)

  // ========== 创建回复 ==========
  await Promise.all([
    prisma.reply.create({
      data: {
        userId: users[2].id,
        reviewId: reviews[0].id,
        content: '确实！加一份方便面也超好吃',
      },
    }),
    prisma.reply.create({
      data: {
        userId: users[4].id,
        reviewId: reviews[2].id,
        content: '微辣都把我辣到了哈哈，但是真的好吃',
      },
    }),
    prisma.reply.create({
      data: {
        userId: users[0].id,
        reviewId: reviews[2].id,
        content: '同重庆人认证！确实正宗',
      },
    }),
    prisma.reply.create({
      data: {
        userId: users[1].id,
        reviewId: reviews[5].id,
        content: '考完试必须去搓一顿！',
      },
    }),
  ])

  console.log('✅ 创建了回复数据')

  // ========== 创建点赞 ==========
  await Promise.all([
    prisma.like.create({ data: { userId: users[1].id, reviewId: reviews[0].id } }),
    prisma.like.create({ data: { userId: users[2].id, reviewId: reviews[0].id } }),
    prisma.like.create({ data: { userId: users[3].id, reviewId: reviews[0].id } }),
    prisma.like.create({ data: { userId: users[0].id, reviewId: reviews[1].id } }),
    prisma.like.create({ data: { userId: users[2].id, reviewId: reviews[1].id } }),
    prisma.like.create({ data: { userId: users[0].id, reviewId: reviews[5].id } }),
  ])

  console.log('✅ 创建了点赞数据')

  // ========== 创建收藏 ==========
  await Promise.all([
    prisma.favorite.create({
      data: { userId: users[0].id, merchantId: merchants[1].id, groupName: '下次必吃' },
    }),
    prisma.favorite.create({
      data: { userId: users[0].id, merchantId: merchants[4].id, groupName: '下次必吃' },
    }),
    prisma.favorite.create({
      data: { userId: users[0].id, merchantId: merchants[6].id, groupName: '聚餐推荐' },
    }),
  ])

  console.log('✅ 创建了收藏数据')
  console.log('🎉 种子数据填充完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
