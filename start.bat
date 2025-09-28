@echo off
echo 正在启动海报制作工具...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 启动开发服务器
echo 正在启动开发服务器...
echo 浏览器将自动打开 http://localhost:3001
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause