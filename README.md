# 🍜 校园小吃点评平台

> 纯粹客观、零商业化的大学生校园美食评价平台

一个基于 **Next.js 14 + Prisma + SQLite + Tailwind CSS** 构建的全栈校园美食点评应用，旨在为大学生提供真实、可信的校园周边美食参考。

---

## 📸 项目截图

> 访问 http://localhost:3000 查看完整效果

---

## ✨ 核心功能

### 用户系统
- **手机注册/登录**：支持手机号 + 密码注册与登录，JWT 鉴权（httpOnly Cookie）
- **用户等级体系**：新手芽 → 食客 → 美食家 → 品鉴官 → 校园美食达人（基于点评数量和获赞数成长）
- **个人中心**：编辑资料、查看我的点评、管理收藏夹

### 商户管理
- **多类别覆盖**：食堂、小吃街、周边餐馆、外卖、甜品店、夜市等 6 大分类
- **商户详情页**：基本信息、评分雷达图、热门菜品推荐、评价列表
- **商户列表页**：分类筛选、排序（评分/价格/好评数）、关键词搜索
- **收藏功能**：一键收藏/取消收藏商户

### 点评系统
- **五维度评分**：口味（35%）、卫生（20%）、服务（15%）、性价比（30%）、份量（10%）
- **评分权重透明**：所有评分权重计算公式公开透明
- **内容丰富度系数**：根据点评字数和图片数计算，影响最终加权得分
- **互动功能**：点赞评价、回复评价
- **重复点评限制**：同一用户 7 天内不可对同一商户重复点评
- **举报机制**：支持举报虚假评价、广告内容、恶意差评、抄袭等

### 管理后台
- **数据统计**：总用户数、商户数、评价数、待审核数
- **评价审核**：支持通过/拒绝/隐藏评价，审核记录留痕
- **举报管理**：查看和处理用户举报

### 反作弊风控
- **设备指纹采集**：记录评价设备信息
- **风险评分系统**：每条评价自动计算 0-100 风险分
- **风险等级标记**：低 / 中 / 高 / 严重，辅助审核决策
- **异常行为检测**：识别短时间大量评价、重复内容等可疑行为

---

## 🏗️ 技术架构

`
┌─────────────────────────────────────────┐
│              前端（Next.js 14）          │
│  React 18 + TypeScript + Tailwind CSS   │
│  App Router · 服务端渲染 · 响应式设计    │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│         API Routes（后端逻辑）           │
│  用户认证 · 商户查询 · 评价管理         │
│  收藏/点赞 · 举报 · 管理后台            │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│            Prisma ORM                    │
│  Schema 定义 · 类型安全查询 · 数据迁移   │
└───────────────────┬─────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│          SQLite 数据库                   │
│  轻量零配置 · 适合开发和小规模部署       │
└─────────────────────────────────────────┘
`

### 数据模型

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| User | 用户 | phone, nickname, level, role, reviewCount |
| Merchant | 商户 | name, category, rating, 五维评分, popularDishes |
| Review | 评价 | 五维评分, content, overallRating, riskScore, status |
| Reply | 回复 | content, isMerchant |
| Like | 点赞 | userId + reviewId 唯一约束 |
| Favorite | 收藏 | userId + merchantId 唯一约束, groupName |
| Report | 举报 | reason, description, status |

---

## 🚀 快速启动

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. 安装依赖

`ash
npm install
`

### 2. 配置环境变量

复制或创建 .env 文件：

`env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
`

### 3. 初始化数据库

`ash
# 生成 Prisma Client
npm run db:generate

# 创建数据库并同步表结构
npm run db:push

# 填充种子数据（10 家商户、3 个用户、若干条评价）
npm run db:seed
`

### 4. 启动开发服务器

`ash
npm run dev
`

访问 http://localhost:3000 查看效果。

### 演示账号

| 手机号 | 密码 | 昵称 | 等级 |
|--------|------|------|------|
| 13800000001 | 123456 | 吃货小王 | Lv3 美食家 |
| 13800000002 | 123456 | 每天都要喝奶茶 | Lv4 品鉴官 |
| 13800000003 | 123456 | 面食爱好者 | Lv2 食客 |

### 其他常用命令

`ash
# 查看数据库内容（Prisma Studio 可视化工具）
npm run db:studio

# 重置数据库并重新填充种子数据
npm run db:reset

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 代码检查
npm run lint
`

---

## 📁 项目结构

`
校园小吃点评/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   └── seed.ts                # 种子数据脚本
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 全局布局（导航栏 + Footer）
│   │   ├── page.tsx           # 首页（热门推荐 + 精华评价 + 搜索）
│   │   ├── about/page.tsx     # 关于我们（评分说明 + 权重公式）
│   │   ├── admin/page.tsx     # 管理后台（统计 + 审核 + 举报）
│   │   ├── auth/
│   │   │   ├── login/page.tsx     # 登录页
│   │   │   └── register/page.tsx  # 注册页（手机 → 学校 → 昵称）
│   │   ├── merchants/
│   │   │   ├── page.tsx       # 商户列表（筛选 + 排序 + 搜索）
│   │   │   └── [id]/page.tsx  # 商户详情（雷达图 + 评价列表）
│   │   ├── profile/page.tsx   # 个人中心
│   │   └── review/new/page.tsx # 写评价（五维度打分 + 内容输入）
│   ├── api/
│   │   ├── auth/              # 注册、登录、登出、获取当前用户
│   │   ├── merchants/         # 商户列表、商户详情
│   │   ├── reviews/           # 评价 CRUD、点赞、回复
│   │   ├── favorites/         # 收藏管理
│   │   ├── reports/           # 举报提交
│   │   ├── user/profile/      # 用户信息读取与更新
│   │   └── admin/             # 后台统计、评价审核、举报处理
│   ├── components/            # 可复用 UI 组件
│   │   ├── AuthWrapper.tsx    # 认证状态包装组件
│   │   ├── CategoryFilter.tsx # 分类筛选器
│   │   ├── MerchantCard.tsx   # 商户卡片
│   │   ├── Navbar.tsx         # 顶部导航栏
│   │   ├── RadarChart.tsx     # 五维评分雷达图
│   │   ├── RatingStars.tsx    # 星级评分组件
│   │   ├── ReplySection.tsx   # 回复区域
│   │   ├── ReportModal.tsx    # 举报弹窗
│   │   ├── ReviewCard.tsx     # 评价卡片
│   │   ├── SearchBar.tsx      # 搜索栏
│   │   └── ShareModal.tsx     # 分享弹窗
│   └── lib/
│       └── prisma.ts          # Prisma Client 单例
├── .env                       # 环境变量
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
`

---

## 🔌 API 接口一览

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/me | 获取当前登录用户信息 |

### 商户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/merchants | 商户列表（支持分类筛选、排序、搜索） |
| GET | /api/merchants/:id | 商户详情 |

### 评价

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/reviews | 评价列表 |
| POST | /api/reviews | 创建评价 |
| GET | /api/reviews/:id | 评价详情 |
| POST | /api/reviews/:id/like | 点赞 / 取消点赞 |
| POST | /api/reviews/:id/reply | 回复评价 |

### 收藏 & 举报

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/favorites | 收藏列表 |
| POST | /api/favorites | 添加 / 取消收藏 |
| POST | /api/reports | 提交举报 |

### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/profile | 获取用户资料 |
| PUT | /api/user/profile | 更新用户资料 |

### 管理后台

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/stats | 平台统计数据 |
| GET | /api/admin/reviews | 待审核评价列表 |
| POST | /api/admin/reviews | 审核评价（通过/拒绝/隐藏） |
| GET | /api/admin/reports | 举报列表 |

---

## 🎯 评分计算公式

`
overallRating = (口味 × 0.35) + (卫生 × 0.20) + (服务 × 0.15) + (性价比 × 0.30) + (份量 × 0.10)
`

| 维度 | 权重 | 说明 |
|------|------|------|
| 口味 | 35% | 食物味道的核心指标 |
| 卫生 | 20% | 餐厅环境与食品安全 |
| 服务 | 15% | 服务态度和响应速度 |
| 性价比 | 30% | 价格与品质的匹配程度 |
| 份量 | 10% | 食物分量是否充足 |

---

## 👤 用户等级体系

| 等级 | 名称 | 所需条件 |
|------|------|----------|
| Lv1 | 新手芽 | 新注册用户默认等级 |
| Lv2 | 食客 | 发布 ≥ 5 条评价 |
| Lv3 | 美食家 | 发布 ≥ 15 条评价且获赞 ≥ 20 |
| Lv4 | 品鉴官 | 发布 ≥ 30 条评价且获赞 ≥ 50 |
| Lv5 | 校园美食达人 | 发布 ≥ 50 条评价且获赞 ≥ 100 |

---

## 🛡️ 反作弊机制

- **设备指纹**：每条评价记录设备哈希，识别多账号刷评
- **风险评分**：自动计算 0-100 分，综合考虑评价频率、内容相似度、账号行为
- **频率限制**：同一用户 7 天内不可对同一商户重复点评
- **举报体系**：支持虚假评价、广告内容、恶意差评、抄袭等举报类型
- **人工审核**：所有新评价默认待审核，管理员可一键通过/拒绝/隐藏

---

## 🔧 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js（App Router） | 14.2.5 |
| UI 框架 | React | 18.3.x |
| 类型系统 | TypeScript | 5.5.x |
| 样式方案 | Tailwind CSS | 3.4.x |
| 后端接口 | Next.js API Routes | - |
| 数据库 | SQLite | - |
| ORM | Prisma | 5.15.x |
| 认证 | JWT（httpOnly Cookie） | - |
| 密码加密 | bcryptjs | - |
| 包管理器 | npm | - |

---

## 📋 后续开发计划

- [x] SQLite 数据库（Prisma ORM）
- [x] 用户认证系统（JWT + 密码登录）
- [x] 五维度评分体系
- [x] 管理后台（审核 + 举报）
- [ ] 图片上传（OSS / MinIO）
- [ ] 全文搜索（Meilisearch）
- [ ] 反作弊风控增强（设备指纹 + AI 审核）
- [ ] 移动端 PWA 支持
- [ ] 数据导出与统计报表

---

## 📄 开源协议

本项目仅供学习交流使用。
