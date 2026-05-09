@echo off
chcp 65001 >nul
echo ========================================
echo   海外文物知识服务系统 - 开发服务器
echo ========================================
echo.

cd /d "%~dp0"

echo 正在启动开发服务器...
echo.
echo 项目地址：http://localhost:5173
echo 按 Ctrl+C 停止服务器
echo.
echo ----------------------------------------
echo.

call npm run dev
