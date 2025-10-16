# CipheredMicroloan-Bazaar Frontend Integration Guide

## 概述

本指南说明如何将前端与 CipheredMicroloanBazaar 智能合约集成。

## 架构

```
frontend/
├── src/
│   ├── contracts/
│   │   └── CipheredMicroloanBazaar.ts    # 合约 ABI 和地址配置
│   ├── hooks/
│   │   └── useMicroloanContract.ts       # React hooks 用于合约交互
│   ├── lib/
│   │   ├── fhevm.ts                      # FHEVM 加密库
│   │   └── fhe.ts                        # 旧版 FHE 工具 (可删除)
│   ├── components/
│   │   ├── LoanForm.tsx                  # 借款申请表单
│   │   └── LoanList.tsx                  # 贷款列表 (出借人)
│   ├── pages/
│   │   ├── Borrow.tsx                    # 借款页面
│   │   └── Lend.tsx                      # 出借页面
│   └── config/
│       └── wagmi.ts                      # Wagmi/RainbowKit 配置
```

## 部署步骤

### 1. 部署智能合约

首先需要部署 `CipheredMicroloanBazaar` 合约到 Zama FHE Sepolia 测试网:

```bash
# 在项目根目录
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network zamaFheSepolia
```

记录部署的合约地址。

### 2. 更新前端配置

在 `frontend/src/contracts/CipheredMicroloanBazaar.ts` 中更新合约地址:

```typescript
export const CIPHERED_MICROLOAN_BAZAAR_ADDRESS = {
  // Zama FHE Sepolia Testnet
  8009: '0xYourDeployedContractAddress', // 替换为实际部署的地址
  // Sepolia Testnet
  11155111: '0xYourDeployedContractAddress', // 如果也部署到 Sepolia
} as const;
```

### 3. 安装依赖

```bash
cd frontend
npm install
```

主要依赖:
- `fhevmjs`: Zama 的 FHE 加密库
- `ethers`: 以太坊交互
- `wagmi`: React hooks for Ethereum
- `@rainbow-me/rainbowkit`: 钱包连接 UI

### 4. 配置环境变量

创建 `.env` 文件:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 5. 运行开发服务器

```bash
npm run dev
```

## 主要功能

### 借款申请 (Borrow Page)

使用 `useMicroloanContract` hook:

```typescript
const { submitLoanApplication, isLoading, isInitialized } = useMicroloanContract();

// 提交贷款申请
const result = await submitLoanApplication({
  requestedAmount: 5000,
  requestedTerm: 180, // days
  creditScore: 650,
  monthlyRevenue: 3000,
  paymentHistory: 5,
  pastDefaults: 0,
  communityScore: 7,
  purpose: 0, // WorkingCapital
});
```

所有敏感数据 (金额、信用评分等) 都会使用 FHE 加密后发送到链上。

### 出借资金 (Lend Page)

```typescript
const { fundLoan, getLoanInfo, getEvaluationInfo } = useMicroloanContract();

// 查看贷款信息
const loanInfo = await getLoanInfo(loanId);
const evaluation = await getEvaluationInfo(loanId);

// 为贷款提供资金
await fundLoan(loanId, 1000); // 投资 $1000
```

### 还款 (Payment)

```typescript
const { makePayment } = useMicroloanContract();

// 还款
await makePayment(loanId, 500); // 还款 $500
```

## FHE 加密流程

1. **初始化 FHEVM**:
   - 连接钱包时自动初始化
   - 获取合约的公钥
   - 创建 FHE 实例

2. **加密数据**:
   - 使用 `encryptUint64()`, `encryptUint32()` 等函数
   - 生成加密数据和签名证明
   - 发送到智能合约

3. **合约处理**:
   - 合约验证加密证明
   - 在加密状态下执行计算
   - 必要时通过 Gateway 解密特定数据

## 支持的网络

- **Zama FHE Sepolia Testnet** (Chain ID: 8009)
  - RPC: https://devnet.zama.ai
  - Explorer: https://main.explorer.zama.ai

- **Sepolia Testnet** (Chain ID: 11155111) - 可选

## 智能合约功能映射

| 前端功能 | 合约函数 | 描述 |
|---------|---------|------|
| 申请贷款 | `submitLoanApplication()` | 提交加密的贷款申请 |
| 信用评估 | `requestCreditEvaluation()` | 仅限信用分析师 |
| 提供资金 | `fundLoan()` | 出借人为贷款池提供资金 |
| 发放贷款 | `disburseLoan()` | 仅限贷款官员 |
| 还款 | `makePayment()` | 借款人还款 |
| 标记违约 | `markAsDefaulted()` | 仅限催收代理 |
| 分配利息 | `distributeInterest()` | 贷款完成后分配利息 |

## 角色权限

合约定义了 4 种角色:

1. **Owner**: 合约所有者，管理角色
2. **Credit Analyst**: 信用分析师，执行信用评估
3. **Loan Officer**: 贷款官员，发放贷款
4. **Collection Agent**: 催收代理，标记违约

前端应根据用户角色显示相应功能。

## 事件监听

可以监听合约事件来更新 UI:

```typescript
// 监听贷款申请事件
contract.on('LoanApplicationSubmitted', (loanId, borrower, purpose, timestamp) => {
  console.log('New loan application:', loanId);
  // 更新 UI
});

// 监听贷款状态变化
contract.on('LoanStatusChanged', (loanId, oldStatus, newStatus, timestamp) => {
  console.log('Loan status changed:', loanId, newStatus);
  // 更新 UI
});
```

## 测试

### 测试流程

1. **借款人**:
   - 连接钱包
   - 填写贷款申请表单
   - 提交申请 (数据自动加密)
   - 记录贷款 ID

2. **信用分析师** (需要合约 owner 授权):
   - 调用 `requestCreditEvaluation(loanId)`
   - 等待 Gateway 解密结果

3. **出借人**:
   - 浏览已批准的贷款
   - 选择贷款并投资金额
   - 调用 `fundLoan()`

4. **贷款官员** (需要授权):
   - 调用 `disburseLoan()` 发放贷款

5. **借款人还款**:
   - 调用 `makePayment()` 还款

## 故障排除

### FHEVM 初始化失败

- 确保连接到正确的网络 (Zama FHE Sepolia)
- 检查合约地址是否正确部署

### 交易失败

- 检查钱包是否有足够的 ETH (gas 费)
- 确认用户是否有相应的角色权限
- 检查加密数据格式是否正确

### 加密错误

- 确保 `fhevmjs` 库版本正确
- 检查合约地址和用户地址是否正确传递

## 下一步

1. 添加用户仪表板显示贷款历史
2. 实现实时通知系统
3. 添加更详细的风险评估展示
4. 实现还款提醒功能
5. 添加多语言支持

## 参考资料

- [Zama fhEVM 文档](https://docs.zama.ai/fhevm)
- [fhevmjs GitHub](https://github.com/zama-ai/fhevmjs)
- [Wagmi 文档](https://wagmi.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/)
