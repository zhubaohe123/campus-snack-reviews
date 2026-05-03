'use client'

import { RatingDimensions } from '@/lib/types'
import { ratingDimensions } from '@/lib/mock-data'

interface RadarChartProps {
  ratings: RatingDimensions
  size?: number
}

export function RadarChart({ ratings, size = 200 }: RadarChartProps) {
  const center = size / 2
  const radius = (size / 2) * 0.75
  const values = [
    ratings.taste,
    ratings.hygiene,
    ratings.service,
    ratings.value,
    ratings.portion,
  ]
  const labels = ratingDimensions.map((d) => d.label)

  // 计算五边形的点
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2
    const r = (value / 5) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  // 背景网格线
  const gridLevels = [1, 2, 3, 4, 5]
  const gridPaths = gridLevels.map((level) => {
    const points = Array.from({ length: 5 }, (_, i) => getPoint(i, level))
    return points.map((p) => `${p.x},${p.y}`).join(' ')
  })

  // 数据区域
  const dataPoints = values.map((v, i) => getPoint(i, v))
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  // 标签位置
  const labelPoints = Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const r = radius + 20
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: labels[i],
      value: values[i],
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 背景网格 */}
      {gridPaths.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* 连接线 */}
      {Array.from({ length: 5 }, (_, i) => {
        const p = getPoint(i, 5)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        )
      })}

      {/* 数据区域 */}
      <polygon
        points={dataPath}
        fill="rgba(249, 115, 22, 0.15)"
        stroke="#f97316"
        strokeWidth="2"
      />

      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f97316" />
      ))}

      {/* 标签 */}
      {labelPoints.map((lp, i) => (
        <g key={i}>
          <text
            x={lp.x}
            y={lp.y - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] fill-gray-600 font-medium"
          >
            {lp.label}
          </text>
          <text
            x={lp.x}
            y={lp.y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] fill-primary-500 font-bold"
          >
            {lp.value.toFixed(1)}
          </text>
        </g>
      ))}
    </svg>
  )
}
