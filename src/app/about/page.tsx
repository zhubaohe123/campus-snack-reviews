import Link from 'next/link'
import { levelConfig, ratingDimensions } from '@/lib/mock-data'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold">关于我们</h1>
        <p className="text-gray-500 mt-2">
          纯粹客观、零商业化干扰的大学生校园美食评价平台
        </p>
      </div>

      {/* 平台承诺 */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-4">🛡️ 我们的承诺</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">✅</span>
            <div>
              <h3 className="font-semibold">100%学生真实评价</h3>
              <p className="text-sm text-gray-600 mt-1">
                所有评价均来自经过学籍认证的在校大学生，我们通过学信网验证、校园邮箱认证、设备指纹追踪等多重机制确保评价的真实性。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">✅</span>
            <div>
              <h3 className="font-semibold">零商家付费干预</h3>
              <p className="text-sm text-gray-600 mt-1">
                商户数据由学生志愿者众包采集，商家无法付费入驻、购买流量或干预评分权重。我们的评分体系完全透明，权重计算规则公开可查。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">✅</span>
            <div>
              <h3 className="font-semibold">评分权重完全透明</h3>
              <p className="text-sm text-gray-600 mt-1">
                本页面详细公开了评分计算的完整逻辑，任何人可以验证和审计。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 评分计算公式 */}
      <section id="rating" className="card p-6">
        <h2 className="text-xl font-bold mb-4">📊 评分计算公式</h2>

        <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
          <p className="text-gray-700">综合评分 = Σ(有效评价评分 × 权重) / Σ(权重)</p>
          <p className="text-gray-500 text-xs mt-2">
            其中每条评价的权重 = 用户等级系数 × 内容丰富度系数 × 时效衰减因子 × 觉得有用加成
          </p>
        </div>

        <h3 className="font-semibold mb-3">五维度评分占比</h3>
        <div className="space-y-2 mb-6">
          {ratingDimensions.map((dim) => (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-base w-6">{dim.icon}</span>
              <span className="text-sm w-16">{dim.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-primary-500 h-3 rounded-full"
                  style={{ width: `${dim.weight * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-12 text-right">
                {(dim.weight * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3">用户等级与权重</h3>
        <div className="space-y-2">
          {levelConfig.map((level) => (
            <div
              key={level.level}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-xl">{level.icon}</span>
              <div className="flex-1">
                <span className="text-sm font-medium">
                  Lv{level.level} {level.name}
                </span>
                <p className="text-xs text-gray-500">{level.requirement}</p>
              </div>
              <span className="text-sm font-bold text-primary-600">
                ×{level.weight}
              </span>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3 mt-6">内容丰富度系数</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: '纯文字（20-50字）', coeff: '×0.8' },
            { label: '纯文字（50字以上）', coeff: '×1.0' },
            { label: '文字 + 1-3张图片', coeff: '×1.1' },
            { label: '文字 + 4张以上图片', coeff: '×1.2' },
            { label: '文字 + 视频', coeff: '×1.3' },
            { label: '文字 + 图片 + 视频', coeff: '×1.4' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-primary-600">
                {item.coeff}
              </span>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3 mt-6">时效衰减因子</h3>
        <div className="space-y-1 text-sm">
          {[
            { period: '0-7天', factor: '×1.0' },
            { period: '7-30天', factor: '×0.9' },
            { period: '30-90天', factor: '×0.7' },
            { period: '90-180天', factor: '×0.5' },
            { period: '180天以上', factor: '×0.3' },
          ].map((item) => (
            <div
              key={item.period}
              className="flex justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-600">{item.period}</span>
              <span className="font-medium">{item.factor}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 反作弊机制 */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-4">🔒 反作弊机制</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>学籍认证：</strong>通过学信网API验证在读学籍，校园邮箱二次验证
          </p>
          <p>
            <strong>设备指纹：</strong>追踪设备特征，同设备注册限制，防止批量刷号
          </p>
          <p>
            <strong>频率限制：</strong>单日评价上限5条，同商户间隔7天，新用户首评等待24小时
          </p>
          <p>
            <strong>AI审查：</strong>自动识别刷分行为、模板化评价、AI生成内容
          </p>
          <p>
            <strong>举报机制：</strong>每条评价可举报，有效举报奖励社区贡献值
          </p>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="card p-6 text-center">
        <h2 className="text-xl font-bold mb-2">联系我们</h2>
        <p className="text-sm text-gray-500">
          有任何问题或建议，欢迎联系我们
        </p>
        <p className="text-sm text-primary-500 mt-2">
          feedback@campus-food-review.com
        </p>
      </section>
    </div>
  )
}
