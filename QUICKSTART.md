# 🚀 快速启动指南

## 问题说明
页面显示空白是因为 **依赖未安装**（缺少 `node_modules` 目录）。

---

## ✅ 解决方案（三选一）

### 方案一：使用批处理文件（推荐）⭐

我已经在项目根目录创建了两个批处理文件：

1. **双击 `install.bat`** → 安装所有依赖
2. **双击 `run-dev.bat`** → 启动开发服务器

然后访问：**http://localhost:5173**

---

### 方案二：手动命令行操作

#### 步骤 1：打开 CMD（不是 PowerShell）
- 按 `Win + R`，输入 `cmd`，回车打开命令提示符

#### 步骤 2：进入项目目录
```cmd
cd /d d:\1a\软工课设
```

#### 步骤 3：安装依赖
```cmd
npm install
```
> ⏱️ 这需要下载约 150MB 的依赖包，可能需要 3-10 分钟

#### 步骤 4：启动项目
```cmd
npm run dev
```

#### 步骤 5：浏览器访问
```
http://localhost:5173
```

---

### 方案三：VS Code 终端操作

如果你正在 VS Code 中编辑此文件：

1. 打开终端：`Ctrl + ~` （波浪号键）
2. 确保终端类型是 **Command Prompt** 或 **Git Bash**（不要用 PowerShell）
3. 运行：
   ```bash
   npm install
   npm run dev
   ```

---

## 🔧 如果 npm install 失败

### 问题 1：网络错误/超时
**解决方案**：使用淘宝镜像源
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 问题 2：权限不足
**解决方案**：以管理员身份运行 CMD，再执行上述命令

### 问题 3：Node.js 未安装
**检查方法**：
```bash
node --version
npm --version
```
如果提示"不是内部命令"，请先安装 Node.js：
- 下载地址：https://nodejs.org/
- 选择 **LTS 版本**（长期支持版）
- 安装时勾选"添加到 PATH"

---

## 📦 需要安装的依赖清单

| 包名 | 用途 | 大小 |
|------|------|------|
| react, react-dom | React 框架 | ~3MB |
| typescript | 类型系统 | ~50MB |
| vite | 构建工具 | ~20MB |
| tailwindcss | CSS 框架 | ~15MB |
| react-router-dom | 路由管理 | ~2MB |
| zustand | 状态管理 | ~100KB |
| axios | HTTP 客户端 | ~500KB |
| lucide-react | 图标库 | ~2MB |
| class-variance-authority | UI 变体工具 | ~50KB |
| @radix-ui/react-slot | 无障碍组件原语 | ~200KB |
| clsx, tailwind-merge | 类名工具 | ~50KB |

**总计约 150-200MB**

---

## ✅ 安装成功标志

当 `npm install` 完成后，你应该能看到：

```
d:\1a\软工课设\
├── node_modules/          ← 🎉 这个目录出现了！
├── package-lock.json      ← 文件内容更新了
└── ...其他文件
```

然后运行 `npm run dev`，终端会显示：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h to show help
```

此时浏览器访问 `http://localhost:5173` 就能看到完整的博物馆风格界面了！

---

## 🐛 如果还有问题

### 症状 1：白屏但无报错
→ 按 F12 打开开发者工具 → Console 标签 → 截图给我看错误信息

### 症状 2：终端显示红色错误
→ 复制完整错误信息发给我

### 症状 3：端口被占用
```bash
# 杀掉占用端口的进程
npx kill-port 5173
# 或者换一个端口
npm run dev -- --port 3000
```

---

## 📞 需要帮助？

如果以上步骤都无法解决，请提供以下信息：

1. 运行 `node --version` 的输出
2. 运行 `npm --version` 的输出
3. 运行 `npm install` 后的完整报错信息（如有）
4. 浏览器控制台的错误信息（按 F12 查看）

我会立即帮你解决！💪
