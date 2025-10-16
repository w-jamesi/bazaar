# CipheredMicroloan-Bazaar Frontend

基于 Zama FHE 技术的隐私保护小额贷款平台前端应用。

## 特性

- ✅ **完全同态加密 (FHE)**: 所有敏感数据 (贷款金额、信用评分、收入等) 都使用 FHE 加密
- ✅ **多角色系统**: 支持借款人、出借人、信用分析师、贷款官员等角色
- ✅ **智能合约集成**: 与 CipheredMicroloanBazaar 合约完全集成
- ✅ **现代 UI**: 使用 React + TypeScript + Tailwind CSS + shadcn/ui
- ✅ **Web3 钱包**: RainbowKit 支持多种钱包连接
- ✅ **实时数据**: Wagmi hooks 实现链上数据实时同步

## 技术栈

- **框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui
- **Web3**:
  - `wagmi` - React hooks for Ethereum
  - `@rainbow-me/rainbowkit` - 钱包连接 UI
  - `ethers` - 以太坊库
  - `fhevmjs` - Zama FHE 加密库
- **状态管理**: React Query (@tanstack/react-query)
- **路由**: React Router DOM

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. 更新合约地址

在 `src/contracts/CipheredMicroloanBazaar.ts` 中更新部署的合约地址:

```typescript
export const CIPHERED_MICROLOAN_BAZAAR_ADDRESS = {
  8009: '0xYourContractAddress', // Zama FHE Sepolia
} as const;
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 5. 构建生产版本

```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── ui/             # shadcn/ui 基础组件
│   │   ├── Header.tsx      # 导航栏
│   │   ├── LoanForm.tsx    # 借款申请表单
│   │   └── LoanList.tsx    # 贷款列表
│   ├── contracts/          # 智能合约配置
│   │   └── CipheredMicroloanBazaar.ts
│   ├── hooks/              # 自定义 React Hooks
│   │   └── useMicroloanContract.ts
│   ├── lib/                # 工具库
│   │   ├── fhevm.ts       # FHE 加密工具
│   │   └── utils.ts       # 通用工具
│   ├── pages/              # 页面组件
│   │   ├── Index.tsx      # 首页
│   │   ├── Borrow.tsx     # 借款页面
│   │   ├── Lend.tsx       # 出借页面
│   │   └── NotFound.tsx   # 404 页面
│   ├── config/             # 配置文件
│   │   └── wagmi.ts       # Wagmi/RainbowKit 配置
│   ├── App.tsx             # 根组件
│   └── main.tsx            # 入口文件
├── public/                 # 静态资源
├── INTEGRATION_GUIDE.md    # 集成指南
└── package.json
```

## 核心功能

### 借款流程

1. 用户连接 Web3 钱包
2. 填写贷款申请表单 (所有敏感信息自动加密)
3. 提交到智能合约
4. 等待信用评估
5. 审批通过后等待出借人资金
6. 贷款发放
7. 按期还款

### 出借流程

1. 连接钱包
2. 浏览已批准的贷款申请
3. 查看风险等级、利率、信用评分等信息
4. 选择贷款并投入资金
5. 等待贷款完成
6. 获得本金和利息回报

### FHE 加密

所有敏感数据在发送到链上前都会使用 Zama 的 FHE 技术加密:

- 贷款金额
- 信用评分
- 月收入
- 历史还款记录
- 违约次数
- 社区评分

加密后的数据可以在链上进行计算,但不会泄露原始值。

## 智能合约函数

### 借款人

- `submitLoanApplication()` - 提交贷款申请
- `makePayment()` - 还款
- `getBorrowerProfile()` - 查看个人资料

### 出借人

- `fundLoan()` - 为贷款提供资金
- `getLenderProfile()` - 查看出借记录
- `distributeInterest()` - 提取利息

### 管理员

- `requestCreditEvaluation()` - 信用评估 (信用分析师)
- `disburseLoan()` - 发放贷款 (贷款官员)
- `markAsDefaulted()` - 标记违约 (催收代理)

## 支持的网络

- **Zama FHE Sepolia Testnet**
  - Chain ID: 8009
  - RPC: https://devnet.zama.ai
  - Explorer: https://main.explorer.zama.ai

## 开发指南

### 添加新组件

使用 shadcn/ui CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

### 与合约交互

使用 `useMicroloanContract` hook:

```typescript
import { useMicroloanContract } from '@/hooks/useMicroloanContract';

const MyComponent = () => {
  const {
    submitLoanApplication,
    getLoanInfo,
    isLoading,
    isInitialized
  } = useMicroloanContract();

  // 使用这些函数...
};
```

### 加密数据

```typescript
import { encryptUint64 } from '@/lib/fhevm';

const encrypted = await encryptUint64(
  fhevmInstance,
  1000, // value
  contractAddress,
  userAddress
);
```

## 测试

```bash
# 运行 linter
npm run lint

# 构建测试
npm run build

# 预览生产构建
npm run preview
```

## 部署

### Vercel (推荐)

```bash
vercel --prod
```

### 其他平台

构建后上传 `dist/` 目录。

## 常见问题

### Q: FHEVM 初始化失败?

A: 确保:
- 连接到正确的网络 (Zama FHE Sepolia)
- 合约已正确部署
- 钱包有足够的 gas

### Q: 交易失败?

A: 检查:
- 用户角色权限
- 贷款状态是否符合操作要求
- Gas 是否足够

### Q: 加密错误?

A: 确认:
- fhevmjs 版本正确
- 合约地址正确
- 用户地址正确

## 贡献

欢迎提交 Issue 和 Pull Request!

## 许可证

MIT

## 相关链接

- [智能合约代码](../contracts)
- [Zama fhEVM 文档](https://docs.zama.ai/fhevm)
- [集成指南](./INTEGRATION_GUIDE.md)
