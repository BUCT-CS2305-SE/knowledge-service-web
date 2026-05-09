# 🏛️ 海外文物知识服务系统（数据浏览模块）

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**一个类似大英博物馆风格的文物浏览Web系统 · 软件工程课程项目**

</div>

---

## ✨ 项目简介

本项目是一个面向海外文物的**知识服务系统**的数据浏览模块，采用现代化的前端技术栈构建，提供博物馆级的用户体验。

### 核心特性

- 🎨 **博物馆级 UI 设计** - 深色导航 + 米白主色调 + 金色强调
- 🔍 **多维数据筛选** - 支持地区、类型、材质、年代、博物馆组合筛选
- 📊 **智能排序与对比** - 多维度排序 + 2-3件文物属性对比表格
- 🧠 **知识图谱三元组展示** - 结构化呈现文物关系
- 🤖 **AI 智能推荐算法** - 基于多维度加权的相似文物推荐
- 📱 **完全响应式布局** - 适配手机、平板、桌面全尺寸
- ⚡ **Vite 极速开发体验** - HMR 热更新，秒级启动
- 🛡️ **TypeScript 严格类型** - 零 `any`，完整类型定义

---

## 📸 功能预览

| 首页 | 浏览页（卡片视图） | 详情页 |
|:--:|:--:|:--:|
| ![首页](docs/screenshots/home.png) | ![浏览页](docs/screenshots/browse.png) | ![详情页](docs/screenshots/detail.png) |

| 列表视图 | 对比功能 | 筛选面板 |
|:--:|:--:|:--:|
| ![列表视图](docs/screenshots/list-view.png) | ![对比](docs/screenshots/compare.png) | ![筛选](docs/screenshots/filter.png) |

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.x
- **npm** >= 8.x (或 pnpm / yarn)

### 安装与运行

```bash
# 克隆仓库
git clone <your-repo-url>
cd overseas-artifacts-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

> 💡 **Windows 用户推荐**: 双击项目根目录的 `start.bat` 一键启动脚本

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (HMR) |
| `npm run build` | 生产环境构建 |
| `npm run preview` | 预览生产构建结果 |
| `npm run typecheck` | TypeScript 类型检查 |

---

## 📂 项目结构

```
src/
├── components/
│   ├── ui/                    # shadcn/ui 基础组件库
│   │   ├── button.tsx        # Button 组件
│   │   ├── card.tsx          # Card 系列组件
│   │   ├── badge.tsx         # Badge 标签
│   │   ├── input.tsx         # Input 输入框
│   │   ├── skeleton.tsx      # Skeleton 骨架屏
│   │   ├── empty-state.tsx   # 空状态组件 ⭐新增
│   │   ├── error-state.tsx   # 错误状态组件 ⭐新增
│   │   └── loading-skeleton.tsx # 加载骨架屏组件 ⭐新增
│   │
│   ├── layout/               # 布局组件
│   │   ├── Header.tsx        # 响应式导航栏
│   │   ├── Footer.tsx        # 页脚
│   │   └── PageLayout.tsx    # 页面容器
│   │
│   └── artifacts/            # 业务组件
│       ├── ArtifactCard.tsx  # 文物卡片（双模式）
│       ├── ArtifactListItem.tsx # 列表项组件
│       ├── FilterPanel.tsx   # 多维筛选面板
│       └── SortControl.tsx   # 排序控制组件
│
├── pages/                    # 页面组件
│   ├── HomePage.tsx          # 首页（Hero + 特色 + 精选）
│   ├── BrowsePage.tsx        # 浏览页（筛选 + 排序 + 视图切换）
│   ├── DetailPage.tsx        # 详情页（图片 + 三元组 + 推荐）
│   └── ComparePage.tsx       # 对比页（表格对比）
│
├── services/                 # API 服务层 ⭐新增
│   └── artifactService.ts    # 统一接口抽象
│
├── store/                    # Zustand 状态管理
│   └── artifactStore.ts      # 全局状态 Store
│
├── mock/                     # Mock 数据层
│   ├── data/
│   │   ├── artifacts.ts      # 12条真实文物数据（不规则化）⭐增强
│   │   ├── categories.ts     # 12个分类
│   │   ├── regions.ts        # 12个地区/文明
│   │   ├── materials.ts     # 14种材质
│   │   └── museums.ts       # 10个博物馆
│   └── handlers.ts           # Mock API 处理器
│
├── types/                    # TypeScript 类型定义
│   ├── artifact.ts           # 核心业务类型
│   └── filter.ts             # 筛选相关类型
│
├── lib/                      # 工具函数
│   └── utils.ts              # cn() 类名合并工具
│
├── App.tsx                   # 应用入口（RouterProvider）
├── main.tsx                  # 渲染入口
├── router.tsx                # 路由配置
└── index.css                 # TailwindCSS 全局样式
```

---

## 🎯 功能模块详解

### 1️⃣ 文物浏览系统 (`/browse`)

#### 多维筛选
支持 **5 个维度** 的组合筛选：
- ✅ 地区/文明（古埃及、古希腊、中国古代等）
- ✅ 文物类型（雕塑、绘画、陶器、青铜器等）
- ✅ 材质（石材、黄金、青铜、陶瓷等）
- ✅ 年代（古代、中世纪、文艺复兴等）
- ✅ 博物馆（大英博物馆、卢浮宫等）

#### 智能排序
- 名称排序（A-Z / Z-A）
- 年代排序（时间顺序）
- 地区排序（字母序）
- 更新时间排序（模拟入库时间）

#### 视图模式
- **卡片视图**：大图优先，4列网格，适合视觉浏览
- **列表视图**：横向布局，详细信息，适合快速检索
- 无缝切换，保持筛选状态

---

### 2️⃣ 文物详情页 (`/artifact/:id`)

#### 高清图库
- 正方形主图展示区（1:1 比例）
- 点击放大至全屏模态框（Lightbox 效果）
- 缩略图画廊支持多图切换
- 图片计数指示器

#### 知识图谱三元组
```
[罗塞塔石碑] --属于--> [古埃及]
[罗塞塔石碑] --类型为--> [石碑铭文]
[罗塞塔石碑] --材质是--> [花岗闪长岩]
[罗塞塔石碑] --收藏于--> [大英博物馆]
...
```
- 彩色编码：蓝色(主语) → 金色(谓语) → 绿元(宾语)
- 动画渐入效果
- 关系总数统计

#### 快捷操作
- 加入对比按钮（全局状态联动）
- 收藏/分享按钮（UI 占位）

---

### 3️⃣ Related Artifacts 智能推荐

基于 **加权评分算法** 的相似文物推荐：

| 匹配维度 | 权重 | 说明 |
|----------|------|------|
| 同地区/文明 | 3.0 | 最高权重 |
| 同朝代/年代 | 2.5 | 年代前缀匹配 |
| 同类别/类型 | 2.5 | 提升权重 |
| 同材质 | 2.0 | 保持不变 |
| 同博物馆 | 1.5 | 新增！同馆藏品关联 |
| 标签匹配 | 1.5/个 | 多标签重叠加分 |

**展示位置**：详情页底部"相关文物推荐"区块  
**推荐数量**：4 件相关度最高的文物

---

### 4️⃣ Compare 对比功能 (`/compare`)

#### 对比项管理
- 支持 **2-3 件文物**同时对比
- 从列表页或详情页快捷添加
- 实时显示已选数量
- 单独移除 / 清空全部

#### 对比表格设计
- 表头带圆形头像缩略图
- **差异值金色高亮**（相同值灰色淡化）
- 详细信息可展开（line-clamp-4）
- 标签云可视化
- 打印友好布局

#### 空状态引导
- 无对比项时的提示界面
- "去选择文物"快捷入口

---

## 🗄️ Mock 数据说明

### 数据规模

| 数据类型 | 数量 | 特点 |
|----------|------|------|
| **文物主数据** | **12 条** | 世界著名真实文物，不规则字段分布 |
| 分类数据 | 12 个 | 覆盖雕塑、绘画、陶器等 |
| 地区数据 | 12 个 | 古埃及、古希腊、中国等文明圈 |
| 材质数据 | 14 种 | 石材、金属、陶瓷等 |
| 博物馆数据 | 10 个 | 世界顶级博物馆 |

### 数据真实性增强 ⭐

为提升**真实博物馆数据感**，Mock 数据进行了以下优化：

✅ **不规则字段缺失**
- 部分文物缺少 `nameEn`（如兵马俑）
- 部分文物缺少 `location`（如断臂维纳斯）
- 部分文物缺少 `depth` 尺寸
- 部分文物缺少 `museum`（如纳尔逊纪念柱位于公共广场）
- 部分文物 `history` 为空字符串（信息不完整）

✅ **多样化描述长度**
- 详细描述：100+ 字（如罗塞塔石碑）
- 中等描述：50-80 字（如蒙娜丽莎）
- 简短描述：<30 字（如纳尔逊纪念柱）

✅ **不同年代格式**
- 精确年份："公元前196年"
- 时间范围："公元前130-100年左右"
- 朝代标注："秦代（约公元前210年）"
- 区间跨度："北魏至元代（公元4-14世纪）"

✅ **不同图片数量**
- 单图文物：大多数
- 多图文物：维纳斯（2张）、大卫像（2张）、自由女神（2张）
- 无公开图片：死海古卷轴（images 为空数组）

✅ **博物馆名称格式多样**
- 中文："大英博物馆"、"卢浮宫博物馆"
- 英文："British Museum"
- 混合："学院美术馆 (Galleria dell'Accademia)"
- 管理机构："美国国家公园管理局 (National Park Service)"

---

## 🔌 API Service 抽象层

### 架构设计

```
页面组件 (Pages)
    ↓ 调用
Zustand Store (State Management)
    ↓ 调用
ArtifactService (API Service Layer)  ← 新增！
    ↓ 开发环境调用
Mock Handlers (Mock Data Layer)
```

### 服务接口定义

```typescript
// src/services/artifactService.ts
interface IArtifactService {
  getArtifacts(params: FilterParams): Promise<PaginatedResponse<Artifact>>;
  getArtifactById(id: string): Promise<Artifact | null>;
  getRelatedArtifacts(id: string, limit?: number): Promise<Artifact[]>;
  getFilterOptions(): Promise<FilterOptions>;
}
```

### 后期对接方案

当需要连接真实后端时：

1. **修改 `artifactService.ts`**：
```typescript
// 将 mockApi 调用替换为 axios 请求
import apiClient from './axios';

async getArtifacts(params) {
  const response = await apiClient.get('/artifacts', { params });
  return response.data;
}
```

2. **配置环境变量**：
```env
# .env.production
VITE_API_BASE_URL=https://api.your-backend.com
VITE_USE_MOCK=false
```

3. **无需修改任何页面代码** ✅

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3.1 | UI 框架（函数式组件 + Hooks）|
| **TypeScript** | 5.5.4 | 类型安全（严格模式，零 any）|
| **Vite** | 5.4.9 | 构建工具（极速 HMR）|
| **TailwindCSS** | 3.4.13 | 原子化 CSS（自定义博物馆主题）|
| **shadcn/ui** | latest | 高质量 UI 组件库 |
| **React Router** | 6.26.2 | 客户端路由（嵌套路由）|
| **Zustand** | 4.5.5 | 轻量级状态管理 |
| **Axios** | 1.7.7 | HTTP 客户端（待对接）|
| **lucide-react** | 0.453.0 | 图标库 |

---

## 📱 响应式断点

| 断点 | 宽度 | 设备类型 | 布局变化 |
|------|------|----------|----------|
| `sm` | ≥640px | 大屏手机横屏 | 卡片网格 → 2 列 |
| `md` | ≥768px | 平板竖屏 | 筛选面板隐藏 |
| `lg` | ≥1024px | 平板横屏/笔记本 | 显示侧边栏筛选 |
| `xl` | ≥1280px | 桌面显示器 | 卡片网格 → 4 列 |

---

## 🎨 UI 设计规范

### 配色方案

```css
/* 主色系 */
--museum-dark: #1a1a1a;      /* 导航栏背景 */
--museum-darker: #2d2d2d;    /* 次级深色 */
--museum-cream: #f5f5f0;     /* 主背景 */
--museum-cream-light: #fafaf8; /* 次级背景 */
--museum-gold: #c9a961;      /* 强调色 */
--museum-gold-dark: #b8860b; /* 强调色深版 */
```

### 设计原则
- ✅ **留白充足**：padding/margin ≥ 16px
- ✅ **圆角统一**：rounded-lg (8px)
- ✅ **阴影层次**：shadow-md (默认) → shadow-lg (hover)
- ✅ **字体层级**：标题 text-2xl~4xl，正文 text-base
- ✅ **动画轻量**：transition-all duration-300

---

## 🧪 开发规范

详见 [AGENTS.md](./AGENTS.md)，核心要点：

- ✅ 函数式组件 + Hooks（禁止 class 组件）
- ✅ TypeScript 严格模式（禁止 any）
- ✅ TailwindCSS 原子类名（禁止内联 style）
- ✅ shadcn/ui 组件库（禁止引入其他 UI 库）
- ✅ PascalCase 命名（组件文件）
- ✅ camelCase 命名（工具函数/Hook/Store）

---

## 📦 Git 提交建议

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

Closes #<issue-id>
```

### Type 列表

| Type | 使用场景 |
|------|----------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `style` | 样式调整（不影响逻辑）|
| `refactor` | 重构（非新功能非修复）|
| `docs` | 文档更新 |
| `chore` | 构建/工具变动 |
| `perf` | 性能优化 |

### 示例

```
feat(compare): add artifact comparison table with diff highlighting

- Implement ComparePage with horizontal table layout
- Support 2-3 artifacts comparison
- Add golden highlight for different values
- Add empty state and print functionality

Closes #7
```

---

## 🌐 部署指南

### Vercel 部署（推荐）

1. **导入仓库**
   ```
   访问 https://vercel.com/new
   选择你的 GitHub 仓库
   ```

2. **配置构建设置**
   ```yaml
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **设置环境变量**（可选）
   ```
   VITE_API_BASE_URL=<your-api-url>
   VITE_USE_MOCK=true
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 自动获得 `*.vercel.app` 域名
   - 或绑定自定义域名

### 其他平台

| 平台 | 配置要点 |
|------|----------|
| **Netlify** | Build: `npm run build`, Publish: `dist` |
| **GitHub Pages** | 需配置 `base` 路径，使用 GitHub Actions |
| **Docker** | 基于 `node:18-alpine` 镜像，暴露端口 5173 |

---

## 📝 环境变量

创建 `.env.local` 文件（已加入 .gitignore）：

```env
# API 配置（后期对接后端时使用）
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=true

# 开发配置
VITE_DEV_PORT=5173
```

参考 [.env.example](./.env.example) 文件。

---

## 📊 项目统计

| 维度 | 数据 |
|------|------|
| **总代码行数** | ~4500+ 行 TypeScript/React |
| **组件数量** | 20+ 个独立组件 |
| **Mock 文物数据** | 12 条（真实世界著名文物）|
| **页面路由** | 4 个（首页、浏览、详情、对比）|
| **TypeScript 类型** | 10+ 个 Interface/Type 定义 |
| **支持筛选维度** | 5 个（地区、类型、材质、年代、博物馆）|
| **支持排序方式** | 4 种（名称、年代、地区、时间）|

---

## 🤝 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码审查清单

- [ ] TypeScript 类型检查通过（`npm run typecheck`）
- [ ] 无 ESLint 错误
- [ ] 遵循 AGENTS.md 编码规范
- [ ] 新增组件包含 Props 类型定义
- [ ] Mock 数据字段完整

---

## 📄 许可证

本项目仅供**软件工程课程教学使用**。

MIT License - 详见 [LICENSE](./LICENSE) 文件。

---

## 👥 致谢

### 技术框架
- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 组件库灵感来源

### 设计参考
- [大英博物馆官网](https://www.britishmuseum.org/) - UI 设计风格参考
- [卢浮宫官网](https://www.louvre.fr/) - 展示交互参考

### 数据来源
- Wikimedia Commons - 公共领域文物图片
- 各大博物馆官方网站 - 文物信息资料

---

<div align="center">

**Made with ❤️ for Software Engineering Course**

*如果这个项目对你有帮助，请给一个 ⭐ Star！*

</div>
