# 🚀 CipheredMicroloan-Bazaar 部署指南

## 📋 **部署前准备**

### 1. **环境要求**
- Node.js 18+
- Git
- MetaMask 钱包
- Sepolia ETH (用于 gas 费用)
- GitHub 账户
- Vercel 账户 (可选)

### 2. **获取必要的密钥**
- **私钥**: 用于部署合约的以太坊私钥
- **GitHub PAT**: 用于 GitHub API 访问
- **Vercel Token**: 用于前端部署 (可选)
- **WalletConnect Project ID**: 用于钱包连接 (可选)

## 🔧 **本地部署步骤**

### 步骤 1: 环境配置

1. **复制环境变量模板**:
   ```bash
   cp env.template .env
   cp frontend/env.local.template frontend/.env.local
   ```

2. **编辑 `.env` 文件**:
   ```bash
   # 添加你的私钥和 RPC URL
   SEPOLIA_RPC_URL=https://sepolia.drpc.org
   PRIVATE_KEY=0x你的私钥
   GITHUB_PAT=你的GitHub_PAT
   VERCEL_TOKEN=你的Vercel_Token
   ```

3. **编辑 `frontend/.env.local` 文件**:
   ```bash
   # 合约地址将在部署后自动更新
   VITE_CIPHERED_MICROLOAN_BAZAAR_ADDRESS=0x0000000000000000000000000000000000000000
   VITE_CHAIN_ID=11155111
   VITE_NETWORK_NAME=sepolia
   VITE_WALLETCONNECT_PROJECT_ID=你的WalletConnect_Project_ID
   ```

### 步骤 2: 安装依赖

```bash
# 安装所有依赖
npm run setup

# 或者分别安装
npm install
cd frontend && npm install
```

### 步骤 3: 编译合约

```bash
npm run compile
```

### 步骤 4: 部署合约

```bash
# 部署合约并自动更新前端配置
npm run deploy:update
```

这个命令会：
- 部署合约到 Sepolia 测试网
- 自动更新前端合约地址
- 创建前端环境文件
- 保存部署信息到 `deployment-info.json`

### 步骤 5: 启动前端

```bash
# 启动开发服务器
npm run dev

# 或者
npm run frontend:dev
```

访问 `http://localhost:5173` 查看应用。

## 🌐 **GitHub 部署**

### 步骤 1: 创建 GitHub 仓库

```bash
# 使用脚本自动创建仓库
npm run setup:github
```

或者手动创建：
1. 在 GitHub 上创建新仓库
2. 添加远程源：
   ```bash
   git remote add origin https://github.com/0rangel-woodrown/CipheredMicroloan-Bazaar.git
   ```

### 步骤 2: 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

- `SEPOLIA_RPC_URL`: `https://sepolia.drpc.org`
- `PRIVATE_KEY`: 你的部署私钥
- `ETHERSCAN_API_KEY`: Etherscan API 密钥 (可选)
- `WALLETCONNECT_PROJECT_ID`: WalletConnect 项目 ID
- `VERCEL_TOKEN`: Vercel 部署令牌
- `VERCEL_ORG_ID`: Vercel 组织 ID
- `VERCEL_PROJECT_ID`: Vercel 项目 ID

### 步骤 3: 推送代码

```bash
git add .
git commit -m "Initial commit: CipheredMicroloan-Bazaar"
git push -u origin main
```

GitHub Actions 将自动：
- 运行测试
- 部署合约
- 部署前端到 Vercel

## ☁️ **Vercel 部署**

### 方法 1: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署前端
npm run deploy:vercel
```

### 方法 2: 使用 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入 GitHub 仓库
4. 配置构建设置：
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install && cd frontend && npm install`

### 方法 3: 环境变量配置

在 Vercel 项目设置中添加环境变量：

- `VITE_CIPHERED_MICROLOAN_BAZAAR_ADDRESS`: 部署的合约地址
- `VITE_CHAIN_ID`: `11155111`
- `VITE_NETWORK_NAME`: `sepolia`
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect 项目 ID

## 🧪 **测试部署**

### 1. **合约测试**

```bash
# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage
```

### 2. **前端测试**

1. 连接 MetaMask 钱包到 Sepolia 测试网
2. 确保钱包有足够的 Sepolia ETH
3. 测试以下功能：
   - 钱包连接
   - 贷款申请
   - 资金投入
   - 还款功能

### 3. **功能验证清单**

- [ ] 合约成功部署
- [ ] 前端可以连接钱包
- [ ] 可以提交贷款申请
- [ ] 可以投入资金
- [ ] 可以查看贷款状态
- [ ] 可以处理还款
- [ ] FHE 加密功能正常

## 🔍 **故障排除**

### 常见问题

1. **合约部署失败**
   - 检查私钥是否正确
   - 确保有足够的 Sepolia ETH
   - 检查 RPC URL 是否可用

2. **前端连接失败**
   - 检查合约地址是否正确
   - 确保 MetaMask 连接到 Sepolia 网络
   - 检查 WalletConnect 配置

3. **FHE 初始化失败**
   - 检查网络连接
   - 确保使用最新的 FHE SDK
   - 检查浏览器控制台错误

### 调试命令

```bash
# 查看部署信息
cat deployment-info.json

# 检查合约状态
npx hardhat console --network sepolia

# 查看前端构建日志
cd frontend && npm run build
```

## 📊 **部署后监控**

### 1. **合约监控**
- 使用 Etherscan 监控合约交易
- 设置事件监听器
- 监控 gas 使用情况

### 2. **前端监控**
- 使用 Vercel Analytics
- 监控用户交互
- 检查错误日志

### 3. **性能优化**
- 优化合约 gas 消耗
- 前端代码分割
- 缓存策略优化

## 🎯 **生产环境部署**

### 1. **主网部署**
- 将网络配置改为 Ethereum 主网
- 使用真实的 ETH 进行部署
- 更新前端配置

### 2. **安全审计**
- 进行智能合约安全审计
- 前端安全扫描
- 渗透测试

### 3. **监控和告警**
- 设置监控系统
- 配置告警规则
- 建立应急响应流程

## 📞 **支持**

如果遇到问题，请：
1. 检查本文档的故障排除部分
2. 查看 GitHub Issues
3. 联系开发团队

---

**祝部署顺利！🚀**
