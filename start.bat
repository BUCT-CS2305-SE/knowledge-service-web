@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║   🚀 海外文物知识服务系统 - 一键启动脚本        ║
echo ╚══════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 Node.js
echo [1/5] 检查运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js！
    echo 请先安装: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 版本:
node --version
echo ✅ npm 版本:
npm --version
echo.

:: 清理缓存
echo [2/5] 清理 Vite 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" >nul 2>&1
    echo ✅ 缓存已清理
) else (
    echo ℹ️ 无需清理
)
echo.

:: 检查依赖
echo [3/5] 检查项目依赖...
if not exist "node_modules\react" (
    echo ⚠️ 未检测到依赖，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已就绪
)
echo.

:: 启动服务器
echo [4/5] 启动开发服务器...
echo.
echo ┌─────────────────────────────────────┐
echo │  🌐 项目地址：http://localhost:5173 │
│  按 Ctrl + C 停止服务器              │
echo └─────────────────────────────────────┘
echo.
echo [5/5] 正在启动 Vite...
echo.

call npm run dev

pause
