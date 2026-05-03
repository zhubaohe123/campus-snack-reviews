interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

export function RatingStars({
  rating,
  size = 'md',
  showNumber = true,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-base gap-1',
    lg: 'text-xl gap-1.5',
  }

  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {/* 满星 */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="text-amber-400">
          ★
        </span>
      ))}
      {/* 半星 */}
      {hasHalf && <span className="text-amber-400">☆</span>}
      {/* 空星 */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      {/* 数字 */}
      {showNumber && (
        <span
          className={`ml-1 font-semibold text-gray-700 ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
          }`}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
