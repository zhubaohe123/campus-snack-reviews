import { prisma } from '@/lib/prisma'

// 重新计算商户综合评分
export async function recalcMerchantRating(merchantId: string) {
  const reviews = await prisma.review.findMany({
    where: { merchantId, status: 'approved' },
  })

  if (reviews.length === 0) {
    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        rating: 0,
        ratingTaste: 0,
        ratingHygiene: 0,
        ratingService: 0,
        ratingValue: 0,
        ratingPortion: 0,
        reviewCount: 0,
      },
    })
    return
  }

  const avg = (field: string) => {
    const sum = reviews.reduce((acc, r) => acc + (r as any)[field], 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      rating: avg('overallRating'),
      ratingTaste: avg('ratingTaste'),
      ratingHygiene: avg('ratingHygiene'),
      ratingService: avg('ratingService'),
      ratingValue: avg('ratingValue'),
      ratingPortion: avg('ratingPortion'),
      reviewCount: reviews.length,
    },
  })
}
