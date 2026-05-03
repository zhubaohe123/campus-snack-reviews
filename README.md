# 校园小吃点评

纯粹客观、零商业化干扰的大学生校园美食评价平台。

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 创建数据库并同步表结构
npm run db:push

# 填充种子数据（10家商户、6个用户、6条评价）
npm run db:seed
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看页面。

### 演示账号

| 手机号 | 密码 | 昵称 | 等级 |
|--------|------|------|------|
| 13800000001 | 123456 | 吃货小王 | Lv3 美食家 |
| 13800000002 | 123456 | 每天都要喝奶茶 | Lv4 品鉴官 |
| 13800000003 | 123456 | 面食爱好者 | Lv2 食客 |

### 其他命令

```bash
# 查看数据库内容（可视化工具）
npm run db:studio

# 重置数据库并重新填充
npm run db:reset

# 构建生产版本
npm run build
npm start
```

## 页面结构

| 路径 | 页面 | 功能 |
|------|------|------|
| `/` | 首页 | 热门推荐、精华评价、搜索入口 |
| `/merchants` | 商户列表 | 分类筛选、排序、搜索 |
| `/merchants/[id]` | 商户详情 | 评分雷达图、评价列表、菜品推荐 |
| `/review/new` | 写评价 | 五维度打分、内容输入 |
| `/profile` | 用户中心 | 个人资料、等级、收藏、我的评价 |
| `/auth/login` | 登录 | 手机号+密码登录 |
| `/auth/register` | 注册 | 三步注册（手机→学校→昵称） |
| `/about` | 关于我们 | 评分说明、权重计算公式、反作弊机制 |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/merchants` | 商户列表（支持筛选排序） |
| GET | `/api/merchants/:id` | 商户详情 |
| GET | `/api/reviews` | 评价列表 |
| POST | `/api/reviews` | 创建评价 |
| POST | `/api/reviews/:id/like` | 点赞/取消 |
| POST | `/api/reviews/:id/reply` | 回复评价 |
| GET | `/api/user/profile` | 获取用户信息 |
| PUT | `/api/user/profile` | 更新用户信息 |
| GET | `/api/favorites` | 收藏列表 |
| POST | `/api/favorites` | 添加/取消收藏 |

## 技术栈

- **前端：** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端：** Next.js API Routes
- **数据库：** SQLite + Prisma ORM
- **认证：** JWT（httpOnly cookie）
- **密码：** bcryptjs 哈希加密

## 核心特性

- 五维度评分系统（口味35% + 卫生20% + 服务15% + 性价比20% + 分量10%）
- 用户成长等级（新芽→食客→美食家→品鉴官→校园美食达人）
- 评分权重透明公开
- 商户雷达图可视化
- 评价频率限制（同商户7天内不可重复评价）
- 移动端优先响应式设计

## 后续开发计划

- [x] SQLite 数据库（Prisma ORM）
- [x] 用户认证系统（JWT + 密码登录）
- [ ] 图片上传（OSS / MinIO）
- [ ] 全文搜索（Meilisearch）
- [ ] 反作弊风控系统（设备指纹、AI审核）
- [ ] 管理后台
