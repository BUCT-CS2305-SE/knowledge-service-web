# 海外文物知识服务系统（数据浏览模块）- 技术设计文档

## 1. 项目目标

开发一个类似"大英博物馆"风格的文物浏览Web系统，专注于**数据浏览模块**的核心功能实现。

### 核心功能

- **文物列表浏览**：支持分页、排序的文物数据展示
- **视图切换**：卡片视图 / 列表视图无缝切换
- **多维筛选**：按年代、地区、材质、类别等多维度筛选文物
- **文物详情页**：展示文物详细信息、高清图片、历史背景等
- **相关推荐**：基于文物属性的相关推荐算法
- **文物对比功能**：选择多个文物进行属性对比

### 开发阶段

- **阶段一**：前端独立开发，使用Mock数据
- **阶段二**：与知识图谱系统后端接口对接

---

## 2. 技术选型

| 类别 | 技术 | 版本要求 |
|------|------|----------|
| 框架 | React | ^18.x |
| 语言 | TypeScript | ^5.x |
| 构建工具 | Vite | ^5.x |
| 样式方案 | TailwindCSS | ^3.x |
| UI组件库 | shadcn/ui | latest |
| 路由 | React Router | ^6.x |
| 状态管理 | Zustand | ^4.x |
| HTTP客户端 | Axios | ^1.x |

### 选型理由

- **React + TypeScript**：类型安全，生态成熟，适合课程项目
- **Vite**：快速开发体验，HMR性能优秀
- **TailwindCSS + shadcn/ui**：原子化CSS + 高质量组件，快速构建现代化UI
- **Zustand**：轻量级状态管理，API简洁，适合中小型项目
- **Axios**：拦截器、请求取消等功能完善，便于后期对接真实API

---

## 3. 项目结构

```
src/
├── api/                    # API层（后期对接）
│   ├── axios.ts           # Axios实例配置
│   ├── artifacts.ts       # 文物相关API
│   └── types.ts           # API响应类型定义
├── components/            # 通用组件
│   ├── ui/               # shadcn/ui基础组件
│   ├── ArtifactCard.tsx  # 文物卡片组件
│   ├── ArtifactList.tsx  # 文物列表项组件
│   ├── FilterPanel.tsx   # 筛选面板
│   ├── ViewToggle.tsx    # 视图切换按钮
│   ├── Pagination.tsx    # 分页器
│   └── CompareTable.tsx  # 对比表格
├── hooks/                 # 自定义Hooks
│   ├── useArtifacts.ts   # 文物数据Hook
│   ├── useFilter.ts      # 筛选逻辑Hook
│   └── useCompare.ts     # 对比功能Hook
├── mock/                  # Mock数据和模拟API
│   ├── data/             # 静态Mock数据
│   │   ├── artifacts.ts  # 文物数据集
│   │   ├── categories.ts # 分类数据
│   │   └── regions.ts    # 地区数据
│   └── handlers.ts       # Mock API处理函数
├── pages/                 # 页面组件
│   ├── BrowsePage.tsx    # 浏览页（列表+筛选）
│   ├── DetailPage.tsx    # 详情页
│   └── ComparePage.tsx   # 对比页
├── store/                # Zustand状态管理
│   ├── artifactStore.ts  # 文物状态
│   ├── filterStore.ts    # 筛选状态
│   └── compareStore.ts   # 对比状态
├── types/                # TypeScript类型定义
│   ├── artifact.ts       # 文物类型
│   ├── filter.ts         # 筛选类型
│   └── common.ts         # 通用类型
├── utils/                # 工具函数
│   ├── formatters.ts     # 格式化工具
│   └── validators.ts     # 验证工具
├── App.tsx               # 应用入口
├── main.tsx              # 渲染入口
└── router.tsx            # 路由配置
```

---

## 4. 页面结构

### 4.1 浏览页 (BrowsePage)

```
┌─────────────────────────────────────────────────────┐
│  Header（Logo + 导航栏）                              │
├──────────┬──────────────────────────────────────────┤
│          │  搜索框 + 视图切换（卡片/列表）             │
│  筛选面板  ├──────────────────────────────────────────┤
│          │                                          │
│  - 年代   │  文物列表区域                             │
│  - 地区   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  - 材质   │  │Card │ │Card │ │Card │ │Card │      │
│  - 类别   │  └─────┘ └─────┘ └─────┘ └─────┘      │
│  - ...   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│          │  │Card │ │Card │ │Card │ │Card │      │
│          │  └─────┘ └─────┘ └─────┘ └─────┘      │
│          │                                          │
│          │  分页器                                    │
└──────────┴──────────────────────────────────────────┘
```

**路由**: `/browse` 或 `/`

**核心交互**:
- 左侧筛选面板实时过滤
- 支持多条件组合筛选
- 卡片/列表视图切换
- 点击卡片进入详情页
- 可选择文物加入对比

### 4.2 详情页 (DetailPage)

```
┌─────────────────────────────────────────────────────┐
│  Header                                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┬─────────────────────────────────┐  │
│  │              │  文物名称                          │  │
│  │   主图展示    │  基本信息（年代、地区、材质...）      │  │
│  │   （可放大）  │  详细描述                          │  │
│  │              │  历史背景                          │  │
│  │              │                                  │  │
│  │  缩略图切换   │  [加入对比] [返回列表]              │  │
│  └──────────────┴─────────────────────────────────┘  │
│                                                      │
│  相关推荐区域                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │Rec  │ │Rec  │ │Rec  │ │Rec  │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
└─────────────────────────────────────────────────────┘
```

**路由**: `/artifact/:id`

**核心功能**:
- 大图展示（支持缩放）
- 多图切换（如有）
- 完整信息展示
- 相关文物推荐
- 一键加入对比

### 4.3 对比页 (ComparePage)

```
┌─────────────────────────────────────────────────────┐
│  Header                                              │
├─────────────────────────────────────────────────────┤
│  已选文物（可移除）：[A] [B] [C]                      │
├─────────────────────────────────────────────────────┐
│  属性        │  文物A      │  文物B      │  文物C      │
├─────────────┼────────────┼────────────┼────────────┤
│  名称        │  xxx       │  yyy       │  zzz       │
│  年代        │  公元前xx年 │  xx世纪    │  xx年      │
│  地区        │  埃及      │  希腊      │  中国      │
│  材质        │  石材      │  青铜      │  瓷器      │
│  尺寸        │  xx cm     │  xx cm     │  xx cm     │
│  ...        │  ...       │  ...       │  ...       │
└─────────────────────────────────────────────────────┘
```

**路由**: `/compare`

**核心功能**:
- 选择2-4个文物进行对比
- 表格形式展示关键属性差异
- 高亮不同属性值
- 支持移除/替换对比项

---

## 5. 数据流设计

### 5.1 整体架构

```
用户操作 → UI组件 → Hooks → Store → API/Mock → 数据更新 → UI重渲染
```

### 5.2 Zustand Store设计

#### artifactStore（文物状态）

```typescript
interface ArtifactStore {
  artifacts: Artifact[];           // 当前显示的文物列表
  currentArtifact: Artifact | null; // 当前查看的详情
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchArtifacts: (params: FilterParams) => Promise<void>;
  fetchArtifactById: (id: string) => Promise<void>;
  getRecommendations: (id: string) => Promise<Artifact[]>;
}
```

#### filterStore（筛选状态）

```typescript
interface FilterStore {
  filters: FilterState;            // 当前筛选条件
  viewMode: 'card' | 'list';      // 视图模式
  sortBy: SortOption;              // 排序方式
  currentPage: number;             // 当前页码
  
  // Actions
  setFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'card' | 'list') => void;
  setSortBy: (option: SortOption) => void;
  setCurrentPage: (page: number) => void;
}
```

#### compareStore（对比状态）

```typescript
interface CompareStore {
  selectedArtifacts: Artifact[];   // 已选择的对比文物
  
  // Actions
  addToCompare: (artifact: Artifact) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  canAddMore: () => boolean;       // 是否还能添加（上限4个）
}
```

### 5.3 数据流向示例

**浏览页筛选流程**:

```
1. 用户点击"古埃及"分类
2. FilterPanel触发 filterStore.setFilter('region', 'Egypt')
3. useFilter hook监听filter变化
4. 自动调用 artifactStore.fetchArtifacts(filters)
5. 从Mock API获取过滤后的数据
6. 更新artifactStore.artifacts
7. ArtifactList/ArtifactCard重新渲染
```

---

## 6. Mock数据策略

### 6.1 数据量规划

| 数据类型 | 数量 | 说明 |
|----------|------|------|
| 文物主数据 | 50-80条 | 覆盖不同年代、地区、材质 |
| 分类数据 | 8-12条 | 如雕塑、陶器、绘画等 |
| 地区数据 | 10-15条 | 古埃及、古希腊、中国等 |
| 材质数据 | 8-10条 | 石材、青铜、瓷器等 |

### 6.2 文物数据结构

```typescript
interface Artifact {
  id: string;                     // 唯一标识
  name: string;                   // 文物名称
  nameEn?: string;                // 英文名称
  era: string;                    // 年代（如"公元前2560年"）
  region: string;                 // 地区/文明
  category: string;               // 类别
  material: string;               // 材质
  dimensions: {                   // 尺寸
    height: number;               // 高度(cm)
    width: number;                // 宽度(cm)
    depth?: number;               // 深度(cm)
  };
  description: string;            // 描述
  history: string;                // 历史背景
  images: string[];               // 图片URL数组
  museum?: string;                // 收藏博物馆
  location?: string;              // 现藏位置
  tags: string[];                 // 标签（用于推荐）
}
```

### 6.3 Mock API设计

```typescript
// mock/handlers.ts

export const mockApi = {
  // 获取文物列表（支持筛选、分页、排序）
  getArtifacts: async (params: FilterParams): Promise<PaginatedResponse<Artifact>> => {},
  
  // 获取单个文物详情
  getArtifactById: async (id: string): Promise<Artifact> => {},
  
  // 获取相关推荐
  getRecommendations: async (id: string, limit?: number): Promise<Artifact[]> => {},
  
  // 获取筛选项（分类、地区、材质等）
  getFilterOptions: async (): Promise<FilterOptions> => {},
  
  // 搜索文物
  searchArtifacts: async (query: string): Promise<Artifact[]> => {}
};
```

### 6.4 Mock数据生成原则

- **真实性**：使用真实存在的著名文物（如罗塞塔石碑、图坦卡蒙面具等）
- **多样性**：覆盖不同文明、时期、材质
- **完整性**：每条数据字段完整，便于测试各种UI场景
- **图片资源**：使用公共领域图片或placeholder服务（如placehold.co）
- **关联性**：设置合理的tags字段用于测试推荐算法

---

## 7. 后期接口对接方案

### 7.1 对接策略

采用**Adapter模式**，将API调用抽象为统一接口：

```typescript
// api/artifacts.ts

const isDev = import.meta.env.DEV;

const apiClient = isDev ? mockApi : realApi;

export const artifactApi = {
  getList: (params) => apiClient.getArtifacts(params),
  getById: (id) => apiClient.getArtifactById(id),
  getRecommendations: (id, limit?) => apiClient.getRecommendations(id, limit)
};
```

### 7.2 Axios配置

```typescript
// api/axios.ts

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 后期添加token等认证信息
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 7.3 对接步骤

1. **环境变量配置**
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_USE_MOCK=false
   ```

2. **创建真实API适配器**
   ```typescript
   // api/realApi.ts
   import axiosInstance from './axios';
   
   export const realApi = {
     getArtifacts: (params) => axiosInstance.get('/artifacts', { params }),
     getArtifactById: (id) => axiosInstance.get(`/artifacts/${id}`),
     // ...
   };
   ```

3. **类型对齐**：确保后端响应结构与TypeScript类型定义一致

4. **错误处理**：添加统一的错误提示机制

5. **Loading状态**：优化加载体验（骨架屏等）

6. **缓存策略**：考虑对不常变的数据进行本地缓存

### 7.4 接口规范预定义

```typescript
// 后端需实现的接口

GET /api/artifacts?region=Era&category=Sculpture&page=1&size=20&sort=name
Response: {
  data: Artifact[],
  total: number,
  page: number,
  size: number
}

GET /api/artifacts/:id
Response: Artifact

GET /api/artifacts/:id/recommendations?limit=6
Response: Artifact[]

GET /api/filters/options
Response: {
  regions: Option[],
  categories: Option[],
  materials: Option[],
  eras: Option[]
}

GET /api/artifacts/search?q=keyword
Response: Artifact[]
```

---

## 8. 开发优先级建议

### P0 - 核心功能（必须完成）

1. ✅ 项目初始化（Vite + React + TS + Tailwind）
2. ✅ 基础UI组件集成（shadcn/ui）
3. ✅ Mock数据准备（至少30条文物数据）
4. ✅ 浏览页面（列表展示 + 分页）
5. ✅ 详情页面（信息展示）

### P1 - 重要功能（应该完成）

6. 🔄 筛选系统（多维筛选面板）
7. 🔄 视图切换（卡片/列表）
8. 🔄 排序功能
9. 🔄 相关推荐逻辑

### P2 - 增强功能（锦上添花）

10. ⬜ 文物对比功能
11. ⬜ 搜索功能
12. ⬜ 图片懒加载
13. ⬜ 骨架屏Loading
14. ⬜ 响应式布局优化

---

## 9. 关键技术点

### 9.1 性能优化

- **虚拟滚动**：列表数据量大时使用react-virtualized
- **图片优化**：WebP格式 + 懒加载 + 缩略图
- **代码分割**：React.lazy() + Suspense
- **Memoization**：React.memo + useMemo + useCallback

### 9.2 SEO考虑（可选）

- 使用React Helmet管理meta标签
- 服务端渲染（SSR）或静态生成（SSG）如果需要SEO

### 9.3 可访问性（a11y）

- 语义化HTML标签
- ARIA标签完善
- 键盘导航支持
- 色彩对比度符合WCAG标准

---

## 10. 参考资料

- [TailwindCSS官方文档](https://tailwindcss.com/docs)
- [shadcn/ui组件库](https://ui.shadcn.com/)
- [Zustand文档](https://zustand-demo.pmnd.rs/)
- [React Router v6文档](https://reactrouter.com/)
- [大英博物馆官网](https://www.britishmuseum.org/)（UI参考）
