# AI协同开发规范 - 海外文物知识服务系统

> 本文档为AI助手提供开发约束和规范，确保代码风格一致性和项目质量。

---

## 1. UI风格约束

### 1.1 设计参考

- **主参考**：大英博物馆官网（https://www.britishmuseum.org/）
- **风格定位**：博物馆级、学术感、优雅、专业
- **色彩方案**：
  - 主色：深灰/黑色（`#1a1a1a`, `#2d2d2d`）
  - 辅助色：米白/象牙白（`#f5f5f0`, `#fafaf8`）
  - 强调色：金色/古铜色（`#c9a961`, `#b8860b`）
  - 文字：深灰 `#333333`
  - 边框：浅灰 `#e5e5e5`

### 1.2 布局原则

- **留白充足**：padding/margin不低于16px
- **卡片阴影**：轻微投影 `shadow-md`，hover时加深
- **圆角统一**：使用Tailwind的 `rounded-lg` (8px)
- **字体层级**：
  - 标题：text-2xl / text-3xl, font-bold
  - 副标题：text-xl, font-semibold
  - 正文：text-base, font-normal
  - 辅助文字：text-sm, text-gray-500

### 1.3 组件样式要求

```tsx
// ✅ 正确示例：使用shadcn/ui组件 + Tailwind类名
<Card className="shadow-md hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-xl font-semibold text-gray-800">
      {artifact.name}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-600">{artifact.description}</p>
  </CardContent>
</Card>

// ❌ 错误示例：内联样式、硬编码颜色
<div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{artifact.name}</h3>
</div>
```

---

## 2. 组件开发规范

### 2.1 函数式组件

所有组件必须使用**函数式组件 + Hooks**：

```tsx
// ✅ 正确
interface ArtifactCardProps {
  artifact: Artifact;
  onSelect?: (id: string) => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onSelect }) => {
  return (
    <Card onClick={() => onSelect?.(artifact.id)}>
      {/* ... */}
    </Card>
  );
};

// ❌ 错误：禁止class组件
class ArtifactCard extends React.Component {
  // ...
}
```

### 2.2 Props类型定义

- 必须定义明确的Props接口
- 使用可选操作符`?`标记非必需属性
- 提供默认值时使用默认参数

```tsx
// ✅ 正确
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  variant = 'primary', 
  onClick 
}) => { /* ... */ };
```

### 2.3 组件拆分原则

- 单一职责：每个组件只做一件事
- 可复用性：提取通用逻辑到自定义Hooks
- 合理粒度：避免过度拆分（<50行可考虑合并）

### 2.4 命名规范

- **组件文件**：PascalCase（如 `ArtifactCard.tsx`）
- **组件名称**：PascalCase，语义化命名
- **Props接口**：组件名 + Props（如 `ArtifactCardProps`）
- **事件处理**：handle + 动作（如 `handleClick`, `handleSubmit`）

---

## 3. TypeScript规范

### 3.1 类型定义

- **优先使用interface**（除非需要联合类型、元组等）
- **导出类型**：公共类型必须export
- **避免any**：绝对禁止使用`any`，使用`unknown`或具体类型

```typescript
// ✅ 正确：使用interface
interface Artifact {
  id: string;
  name: string;
  era: string;
}

// ✅ 联合类型使用type
type ViewMode = 'card' | 'list';
type SortOption = 'name' | 'era' | 'region';

// ❌ 错误：禁止any
const data: any = fetchData();
```

### 3.2 泛型使用

合理使用泛型提升代码复用性：

```typescript
// ✅ API响应封装
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  size: number;
}
```

### 3.3 类型断言

- 优先使用**类型守卫**而非断言
- 必须断言时使用`as`语法

```typescript
// ✅ 类型守卫
const isArtifact = (item: unknown): item is Artifact => {
  return typeof item === 'object' && item !== null && 'id' in item;
};

// ⚠️ 必要时使用as
const element = document.getElementById('canvas') as HTMLCanvasElement;
```

### 3.4 枚举 vs 字面量类型

- 优先使用**字面量联合类型**（更轻量）
- 仅在需要反向映射时使用enum

```typescript
// ✅ 推荐：字面量类型
type FilterCategory = 'era' | 'region' | 'material';

// ❌ 不推荐：enum（除非必要）
enum FilterCategory {
  Era = 'era',
  Region = 'region',
  Material = 'material'
}
```

---

## 4. 页面布局规范

### 4.1 页面结构模板

```tsx
// 所有页面遵循此结构
import { PageLayout } from '@/components/layout/PageLayout';

export const BrowsePage: React.FC = () => {
  return (
    <PageLayout title="文物浏览">
      <div className="container mx-auto px-4 py-6">
        {/* 页面内容 */}
      </div>
    </PageLayout>
  );
};
```

### 4.2 响应式断点

使用Tailwind标准断点：

| 断点 | 宽度 | 用途 |
|------|------|------|
| `sm` | ≥640px | 小屏手机横屏 |
| `md` | ≥768px | 平板竖屏 |
| `lg` | ≥1024px | 平板横屏/小笔记本 |
| `xl` | ≥1280px | 桌面显示器 |

### 4.3 网格系统

```tsx
// 卡片网格：响应式布局
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {artifacts.map(artifact => (
    <ArtifactCard key={artifact.id} artifact={artifact} />
  ))}
</div>
```

### 4.4 侧边栏布局

```tsx
// 浏览页：左侧筛选 + 右侧内容
<div className="flex flex-col lg:flex-row gap-6">
  {/* 左侧筛选面板 */}
  <aside className="w-full lg:w-64 flex-shrink-0">
    <FilterPanel />
  </aside>

  {/* 右侧主内容区 */}
  <main className="flex-1 min-w-0">
    <ArtifactList />
  </main>
</div>
```

---

## 5. 文件命名规范

### 5.1 目录结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui基础组件（保持原样）
│   ├── layout/          # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageLayout.tsx
│   └── artifacts/       # 业务组件按功能分组
│       ├── ArtifactCard.tsx
│       ├── ArtifactList.tsx
│       └── ArtifactDetail.tsx
├── hooks/
│   ├── useArtifacts.ts
│   └── useFilter.ts
├── store/
│   ├── artifactStore.ts
│   └── filterStore.ts
└── types/
    └── artifact.ts
```

### 5.2 命名规则

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase.tsx | `ArtifactCard.tsx` |
| Hook文件 | camelCase + use前缀 | `useArtifacts.ts` |
| Store文件 | camelCase + Store后缀 | `artifactStore.ts` |
| 类型文件 | camelCase.ts | `artifact.ts` |
| 工具函数 | camelCase.ts | `formatters.ts` |
| API文件 | camelCase.ts | `artifacts.ts` |
| 常量文件 | UPPER_SNAKE_CASE.ts | `API_CONSTANTS.ts` |

### 5.3 导入顺序

```typescript
// 1. React相关
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. 第三方库
import axios from 'axios';
import { create } from 'zustand';

// 3. 内部组件（相对路径）
import { Card, CardContent } from '@/components/ui/card';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';

// 4. 类型定义
import type { Artifact } from '@/types/artifact';

// 5. 样式文件（如有）
import './BrowsePage.css';
```

---

## 6. Mock数据开发原则

### 6.1 数据位置

所有Mock数据放在 `src/mock/data/` 目录：

```
src/mock/
├── data/
│   ├── artifacts.ts      # 主数据集（50-80条）
│   ├── categories.ts     # 分类数据
│   ├── regions.ts        # 地区数据
│   └── materials.ts      # 材质数据
└── handlers.ts           # Mock API实现
```

### 6.2 数据真实性

- 使用真实存在的著名文物
- 信息准确（年代、地区、材质等）
- 描述详尽（至少50字的中文描述）

**推荐数据源**：
- 大英博物馆藏品
- 卢浮宫藏品
- 故宫博物院藏品
- 维基百科文物条目

### 6.3 Mock API实现

```typescript
// mock/handlers.ts
import { artifacts } from './data/artifacts';

export const mockApi = {
  getArtifacts: async (params: FilterParams): Promise<PaginatedResponse<Artifact>> => {
    // 模拟网络延迟200-500ms
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
    
    let filtered = [...artifacts];
    
    // 应用筛选条件
    if (params.region) {
      filtered = filtered.filter(a => a.region === params.region);
    }
    if (params.category) {
      filtered = filtered.filter(a => a.category === params.category);
    }
    
    // 排序
    if (params.sortBy) {
      filtered.sort((a, b) => a[params.sortBy].localeCompare(b[params.sortBy]));
    }
    
    // 分页
    const start = (params.page - 1) * params.size;
    const paginatedData = filtered.slice(start, start + params.size);
    
    return {
      code: 200,
      data: paginatedData,
      total: filtered.length,
      page: params.page,
      size: params.size
    };
  }
};
```

### 6.4 图片资源

- **优先使用**：维基 Commons 公共领域图片
- **备选方案**：
  - placehold.co（带文本占位图）
  - unsplash（高质量占位图）
  - picsum.photos（随机图片）

```typescript
// 图片URL格式
const artifactImages = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/.../Rosetta_Stone.jpg',
  // 或使用placeholder
  'https://placehold.co/400x300/c9a961/ffffff?text=Ancient+Artifact'
];
```

---

## 7. 状态管理规范（Zustand）

### 7.1 Store结构

```typescript
// store/artifactStore.ts
import { create } from 'zustand';
import type { Artifact } from '@/types/artifact';

interface ArtifactStore {
  // State
  artifacts: Artifact[];
  currentArtifact: Artifact | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchArtifacts: (params: FilterParams) => Promise<void>;
  fetchArtifactById: (id: string) => Promise<void>;
  setCurrentArtifact: (artifact: Artifact | null) => void;
  clearError: () => void;
}

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
  // 初始状态
  artifacts: [],
  currentArtifact: null,
  loading: false,
  error: null,

  // Actions实现
  fetchArtifacts: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await mockApi.getArtifacts(params);
      set({ artifacts: response.data, loading: false });
    } catch (error) {
      set({ error: '获取数据失败', loading: false });
    }
  },
  
  // ...其他actions
}));
```

### 7.2 Store使用

```tsx
// ✅ 在组件中使用
import { useArtifactStore } from '@/store/artifactStore';

const BrowsePage: React.FC = () => {
  const { artifacts, loading, fetchArtifacts } = useArtifactStore();
  
  useEffect(() => {
    fetchArtifacts({ page: 1, size: 12 });
  }, []);
  
  if (loading) return <LoadingSkeleton />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {artifacts.map(artifact => (
        <ArtifactCard key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
};
```

### 7.3 避免过度使用

- **不要把所有状态都放全局Store**
- 组件内部状态用`useState`
- 仅跨组件共享的状态才用Zustand

---

## 8. 路由配置规范

### 8.1 路由定义

```typescript
// router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { BrowsePage } from '@/pages/BrowsePage';
import { DetailPage } from '@/pages/DetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { PageLayout } from '@/components/layout/PageLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      {
        index: true,
        element: <BrowsePage />,
      },
      {
        path: '/artifact/:id',
        element: <DetailPage />,
      },
      {
        path: '/compare',
        element: <ComparePage />,
      },
    ],
  },
]);
```

### 8.2 参数获取

```tsx
// ✅ 使用useParams hook
import { useParams } from 'react-router-dom';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    if (id) {
      fetchArtifactById(id);
    }
  }, [id]);
};
```

---

## 9. 禁止事项（重要！）

### 9.1 🚫 绝对禁止

- ❌ **禁止引入额外UI库**：只允许使用shadcn/ui及其依赖
  - 不准安装：Ant Design、Material UI、Element Plus等
  - 不准安装：Bootstrap、Semantic UI等CSS框架
  - 如需其他组件，自己基于shadcn/ui封装

- ❌ **禁止使用CSS-in-JS**：styled-components、emotion等
  - 只使用TailwindCSS类名
  - 特殊情况可用`.css`文件（需审批）

- ❌ **禁止使用any类型**：TypeScript严格模式

- ❌ **禁止内联样式对象**：`style={{ color: 'red' }}`
  - 例外：动态计算值（如动态宽度、颜色）

### 9.2 ⚠️ 不推荐

- ⚠️ 不建议使用Redux/MobX（已选型Zustand）
- ⚠️ 不建议使用jQuery或其他DOM操作库
- ⚠️ 不建议在组件中直接调用alert/confirm（使用shadcn/ui Dialog）
- ⚠️ 不建议硬编码数字/字符串（提取为常量）

### 9.3 ✅ 允许的第三方库

| 类别 | 库名 | 用途 |
|------|------|------|
| 图标 | lucide-react | 图标库（shadcn/ui默认） |
| 表单 | react-hook-form | 表单验证 |
| 日期 | date-fns | 日期处理 |
| 动画 | framer-motion | 微交互动画（谨慎使用） |
| 虚拟滚动 | @tanstack/react-virtual | 长列表优化 |

> 安装新依赖前需确认是否真的必要！

---

## 10. AI生成代码规范

### 10.1 代码生成要求

当AI生成代码时，必须满足：

1. **✅ 完整的类型定义**：所有变量、函数、Props必须有类型
2. **✅ 符合本规范**：遵循上述所有规则
3. **✅ 注释关键逻辑**：复杂算法/业务逻辑添加注释
4. **✅ 错误处理**：async函数必须有try-catch
5. **✅ 边界检查**：数组访问前检查长度，对象访问前检查存在性

### 10.2 代码审查清单

生成代码后自查：

- [ ] 是否使用了被禁止的库？
- [ ] TypeScript类型是否完整？（无any）
- [ ] 是否使用了Tailwind类名而非内联样式？
- [ ] 组件是否为函数式组件？
- [ ] 文件命名是否符合规范？
- [ ] 是否有适当的错误处理？
- [ ] 是否导出了必要的类型？

### 10.3 示例对比

#### ❌ 不符合规范的AI输出

```tsx
function App() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/artifacts')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return (
    <div style={{ padding: 20 }}>
      {data.map((item: any) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
```

**问题**：
- 使用了`any`类型
- 使用了内联样式
- 缺少错误处理
- 缺少Loading状态
- 变量命名不规范（desc → description）

#### ✅ 符合规范的AI输出

```tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Artifact } from '@/types/artifact';
import { mockApi } from '@/mock/handlers';

interface ArtifactListProps {
  filters?: FilterParams;
}

export const ArtifactList: React.FC<ArtifactListProps> = ({ filters }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArtifacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await mockApi.getArtifacts(filters || { page: 1, size: 12 });
        setArtifacts(response.data);
      } catch (err) {
        setError('加载文物数据失败，请重试');
        console.error('Failed to load artifacts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArtifacts();
  }, [filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artifacts.map(artifact => (
        <Card key={artifact.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
              {artifact.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">
              {artifact.description}
            </p>
            <div className="mt-3 flex gap-2 text-xs text-gray-500">
              <span>{artifact.era}</span>
              <span>•</span>
              <span>{artifact.region}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

**优点**：
- ✅ 完整TypeScript类型
- ✅ 使用shadcn/ui组件 + Tailwind
- ✅ Loading骨架屏状态
- ✅ Error错误处理
- ✅ 响应式网格布局
- ✅ 语义化命名
- ✅ 适当注释

---

## 11. Git提交规范

### 11.1 Commit Message格式

```
<type>(<scope>): <subject>

<body>
```

### 11.2 Type列表

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| style | 样式调整（不影响功能） |
| refactor | 重构（不是新功能也不是修复） |
| docs | 文档更新 |
| chore | 构建/工具变动 |
| test | 测试相关 |

### 11.3 示例

```
feat(artifact): add artifact card component with hover effect

- Implement ArtifactCard component using shadcn/ui Card
- Add image lazy loading and placeholder
- Support click to navigate to detail page

Closes #12
```

---

## 12. 开发环境配置

### 12.1 VS Code推荐插件

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint

### 12.2 编辑器配置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 13. 常见问题FAQ

### Q1: 可以使用CSS Module吗？

**A**: 不推荐。本项目使用TailwindCSS，特殊样式需求应通过`.css`文件并确保不会与全局冲突。

### Q2: Mock数据不够怎么办？

**A**: 优先从维基百科、博物馆官网获取真实文物信息扩充。保证每条数据的字段完整性。

### Q3: 需要安装新的npm包？

**A**: 先确认是否真的必要。检查shadcn/ui是否已有类似功能。必要时在团队讨论后决定。

### Q4: 组件太大如何拆分？

**A**: 超过150行的组件考虑拆分。提取子组件或自定义Hook来降低复杂度。

### Q5: 如何处理图片资源？

**A**: 当前阶段全部使用外部URL。后期可考虑下载到`public/images/`目录并使用本地路径。

---

## 14. 快速参考卡片

### 项目技术栈速查

```
React 18 + TypeScript 5 + Vite 5
TailwindCSS 3 + shadcn/ui
React Router 6 + Zustand 4 + Axios 1
```

### 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 构建
npm run build
```

### 关键目录

```
src/components/ui/    → shadcn/ui组件
src/mock/             → Mock数据和API
src/store/            → Zustand状态管理
src/types/            → TS类型定义
src/pages/            → 页面组件
docs/                 → 项目文档
```

---

**文档版本**: v1.0
**最后更新**: 2026-05-09
**适用范围**: 海外文物知识服务系统 - 数据浏览模块
