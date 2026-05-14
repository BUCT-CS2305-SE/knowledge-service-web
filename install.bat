@echo off
chcp 65001 >nul
echo ========================================
echo   海外文物知识服务系统 - 依赖安装
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 正在检查 Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js！
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装: 
node --version

echo.
echo [2/3] 正在安装项目依赖...
echo 这可能需要几分钟时间，请耐心等待...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ 依赖安装失败！请检查网络连接或尝试使用淘宝镜像：
    echo npm config set registry https://registry.npmmirror.com
    echo 然后重新运行此脚本
    pause
    exit /b 1
)

echo.
echo [3/3] 验证安装结果...
if exist "node_modules" (
    echo ✅ 依赖安装成功！
) else (
    echo ⚠️ 警告：未检测到 node_modules 目录
)

echo.
echo ========================================
echo   安装完成！现在可以启动项目了
echo ========================================
echo.
echo 启动方式：
echo   方式一：双击 run-dev.bat
echo   方式二：在终端运行 npm run dev
echo.
echo 访问地址：http://localhost:5173
echo.
pause
