#!/bin/bash

# CipheredMicroloan-Bazaar 快速启动脚本
# 用于快速设置和启动项目

set -e

echo "🚀 CipheredMicroloan-Bazaar 快速启动脚本"
echo "=========================================="

# 检查 Node.js 版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查是否存在环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.template .env
    echo "⚠️  请编辑 .env 文件，添加你的私钥和配置"
    echo "   特别是 PRIVATE_KEY 和 SEPOLIA_RPC_URL"
    read -p "按 Enter 继续..."
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 创建前端环境变量文件..."
    cp frontend/env.local.template frontend/.env.local
    echo "✅ 前端环境变量文件已创建"
fi

# 安装依赖
echo "📦 安装依赖..."
npm run setup

# 编译合约
echo "🔨 编译智能合约..."
npm run compile

echo ""
echo "🎉 设置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 编辑 .env 文件，添加你的私钥"
echo "2. 运行 'npm run deploy:update' 部署合约"
echo "3. 运行 'npm run dev' 启动前端"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT_GUIDE.md"
echo ""
