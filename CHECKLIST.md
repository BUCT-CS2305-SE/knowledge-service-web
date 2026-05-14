# 🚀 项目启动检查清单

## ✅ 环境准备检查

### Node.js 环境
- [ ] Node.js 版本 >= 16.x （运行 `node --version` 检查）
- [ ] npm 版本 >= 8.x （运行 `npm --version` 检查）

### 依赖安装
- [ ] 已运行 `npm install`
- [ ] `node_modules/` 目录已生成
- [ ] 无安装错误或警告

---

## 📦 项目文件完整性

### 必需的配置文件
- [x] package.json
- [x] tsconfig.json
- [x] vite.config.ts
- [x] tailwind.config.js
- [x] postcss.config.js
- [x] components.json (shadcn/ui 配置)

### 源代码目录结构
```
src/
├── main.tsx ✅
├── App.tsx ✅
├── router.tsx ✅
├── index.css ✅
├── components/ ✅
│   ├── ui/ ✅ (至少包含 button, card, skeleton)
│   ├── layout/ ✅
│   └── artifacts/ ✅
├── pages/ ✅
│   ├── HomePage.tsx ✅
│   ├── BrowsePage.tsx ✅
│   ├── DetailPage.tsx ✅
│   └── ComparePage.tsx ✅
├── store/ ✅
│   └── artifactStore.ts ✅
├── services/ ✅
│   └── artifactService.ts ✅
├── mock/ ✅
│   ├── data/ ✅
│   │   ├── artifacts.ts ✅
│   │   ├── categories.ts ✅
│   │   ├── regions.ts ✅
│   │   ├── materials.ts ✅
│   │   └── museums.ts ✅
│   └── handlers.ts ✅
└── types/ ✅
    ├── artifact.ts ✅
    └── filter.ts ✅
```

### 文档文件
- [ ] README.md
- [ ] AGENTS.md
- [ ] docs/tech-design.md
- [ ] .env.example

---

## 🎯 启动测试

### 开发服务器启动
```bash
npm run dev
```

预期输出：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h to show help
```

### 浏览器访问测试
- [ ] 访问 http://localhost:5173 显示首页
- [ ] 导航栏正常显示
- [ ] 点击"文物浏览"进入 /browse 页面
- [ ] 左侧筛选面板可见
- [ ] 卡片/列表视图切换正常
- [ ] 点击任意文物卡片进入详情页
- [ ] 详情页图片可点击放大
- [ ] 详情页底部有相关推荐
- [ ] 可添加文物到对比列表
- [ ] /compare 页面对比表格正常显示

### TypeScript 类型检查
```bash
npm run typecheck
```

预期结果：
- ✅ 无类型错误
- ✅ 无 any 类型警告

### 生产构建测试
```bash
npm run build
```

预期结果：
- ✅ 构建成功无错误
- ✅ 生成 dist/ 目录
- ✅ 包含优化后的静态资源

---

## ⚠️ 常见问题排查

### 问题 1：端口被占用
**症状**: `Port 5173 is already in use`
**解决**: 
```bash
# 方案 A：终止占用进程
npx kill-port 5173

# 方案 B：使用其他端口
npm run dev -- --port 3000
```

### 问题 2：依赖安装失败
**症状**: npm install 报错
**解决**:
```bash
# 清除缓存后重试
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题 3：页面白屏
**症状**: 访问 localhost:5173 显示空白页
**排查步骤**:
1. 按 F12 打开开发者工具
2. 查看 Console 标签是否有红色错误
3. 查看 Network 标签是否有请求失败
4. 检查终端是否有编译错误

### 问题 4：样式未生效
**症状**: 页面显示但样式混乱
**解决**:
- 确认 TailwindCSS 已正确安装
- 检查浏览器是否禁用了 CSS
- 强制刷新：Ctrl + Shift + R

---

## 📊 性能基准参考

| 指标 | 预期值 | 说明 |
|------|--------|------|
| 首次加载时间 | < 3s | 本地开发环境 |
| HMR 热更新速度 | < 200ms | 文件保存后 |
| 生产构建大小 | < 500KB (gzip) | dist/ 目录 |
| TypeScript 编译时间 | < 10s | npm run typecheck |
| Lighthouse 性能评分 | > 90 | 生产构建预览 |

---

## ✅ 完成确认

当以上所有检查项都通过时，项目已准备好进行：

- [ ] 本地开发演示
- [ ] Git 提交并推送到远程仓库
- [ ] 部署到 Vercel / Netlify 等平台
- [ ] 团队成员 Code Review
- [ ] 课程答辩展示

---

**最后更新**: 2026-05-09  
**适用版本**: v2.0.0-engineering-final
