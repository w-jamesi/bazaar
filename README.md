# Bazaar

**Privacy-Preserving Decentralized Microloan Platform Built on Zama's Fully Homomorphic Encryption (FHE)**

Bazaar is a decentralized lending protocol that leverages Fully Homomorphic Encryption to enable private credit assessment and loan processing. Unlike traditional DeFi lending platforms where financial data is publicly visible on-chain, Bazaar ensures that sensitive borrower information—credit scores, income levels, and payment history—remains encrypted throughout the entire loan lifecycle while still enabling automated risk evaluation and loan decisions.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bazaar--fhe.vercel.app-blue)](https://bazaar-fhe.vercel.app)
[![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-yellow)](https://sepolia.etherscan.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://docs.soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-00d4aa)](https://docs.zama.ai/fhevm)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [The Problem We Solve](#the-problem-we-solve)
- [Technical Architecture](#technical-architecture)
- [Smart Contract Design](#smart-contract-design)
- [FHE Implementation Details](#fhe-implementation-details)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Contract Deployment](#contract-deployment)
- [Frontend Integration](#frontend-integration)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

Bazaar implements a complete microloan marketplace where:

1. **Borrowers** submit loan applications with encrypted financial data (credit score, monthly revenue, payment history)
2. **The smart contract** performs credit evaluation entirely on encrypted data using FHE operations
3. **Lenders** can fund loans based on encrypted risk assessments without seeing raw borrower data
4. **Repayments** are tracked with encrypted amounts, maintaining privacy throughout the loan lifecycle

All sensitive computations—risk scoring, loan amount approval, interest rate calculation—happen on encrypted ciphertexts, ensuring that neither the blockchain validators, other users, nor even the contract owner can access plaintext financial information.

## The Problem We Solve

### Traditional DeFi Lending Limitations

| Problem | Traditional Approach | Bazaar's Solution |
|---------|---------------------|-------------------|
| **Privacy Exposure** | All loan amounts and addresses visible on-chain | Encrypted loan data using FHE |
| **Credit Assessment** | Over-collateralization or centralized oracles | On-chain encrypted credit scoring |
| **Data Exploitation** | Financial behavior trackable and exploitable | Zero-knowledge financial profiles |
| **Regulatory Risk** | Public financial data creates compliance issues | Privacy-preserving by design |

### Why FHE for Microloans?

Microloans serve underbanked populations who are particularly vulnerable to:
- **Identity theft** from exposed financial data
- **Discrimination** based on visible transaction patterns
- **Predatory targeting** using on-chain financial analysis

FHE enables the computational benefits of smart contracts while preserving the privacy guarantees that vulnerable borrowers require.

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript │ Wagmi + RainbowKit │ Zama Relayer SDK v0.3.0      │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Loan Form    │  │ Wallet       │  │ FHE Client   │  │ TX Toast     │    │
│  │ Component    │  │ Connection   │  │ Encryption   │  │ Notifications│    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │
│         │                 │                 │                               │
│         └─────────────────┼─────────────────┘                               │
│                           ▼                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           ENCRYPTION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   User Input ──► FHE.encrypt() ──► Ciphertext + Proof ──► Smart Contract   │
│                                                                              │
│   Encrypted Types: euint8, euint16, euint32, euint64                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           BLOCKCHAIN LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              CipheredMicroloanBazaar.sol (Sepolia)                  │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │ Loan        │  │ Credit      │  │ Repayment   │                │   │
│   │   │ Application │  │ Evaluation  │  │ Tracking    │                │   │
│   │   │ (Encrypted) │  │ (FHE Ops)   │  │ (Encrypted) │                │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                │   │
│   │                                                                      │   │
│   │   FHE Operations: add, sub, mul, div, gt, lt, select                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Contract: 0x7BCA26b53C58c912a5bd57314F8a17a22900C0a5                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Smart Contract Design

### Loan Lifecycle State Machine

The contract implements a 10-state loan lifecycle ensuring proper workflow enforcement:

```
┌─────────┐    submit    ┌───────────┐   evaluate   ┌─────────────┐
│  Draft  │ ──────────►  │ Submitted │ ───────────► │ CreditCheck │
└─────────┘              └───────────┘              └──────┬──────┘
                                                          │
                                                          ▼
┌───────────┐   disburse  ┌──────────┐    approve   ┌─────────────────┐
│ Disbursed │ ◄────────── │ Approved │ ◄─────────── │ RiskAssessment  │
└─────┬─────┘             └──────────┘              └─────────────────┘
      │
      ▼
┌────────┐    repay     ┌──────────┐    complete   ┌───────────┐
│ Active │ ───────────► │ Repaying │ ────────────► │ Completed │
└────┬───┘              └────┬─────┘               └───────────┘
     │                       │
     │      default          │ default
     └───────────────────────┴──────────► ┌───────────┐
                                          │ Defaulted │
                                          └───────────┘
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Owner** | System configuration, role management, emergency controls |
| **Credit Analyst** | Initiate credit evaluations, access encrypted scores |
| **Loan Officer** | Approve/reject loans, set interest rates, disburse funds |
| **Collection Agent** | Handle defaults, manage recovery process |

### Core Data Structures

```solidity
struct LoanApplication {
    uint256 loanId;
    address borrower;
    euint64 requestedAmountCipher;      // Encrypted loan amount
    euint32 requestedTermCipher;        // Encrypted term in days
    euint32 creditScoreCipher;          // Encrypted credit score (300-850)
    euint32 monthlyRevenueCipher;       // Encrypted monthly income
    euint16 paymentHistoryCipher;       // Encrypted successful payments
    euint8 pastDefaultsCipher;          // Encrypted default count
    euint8 communityScoreCipher;        // Encrypted reputation (0-10)
    LoanPurpose purpose;
    LoanStatus status;
    // ... timestamps and metadata
}

struct CreditEvaluation {
    euint32 computedScoreCipher;        // FHE-computed credit score
    euint8 riskTierCipher;              // Encrypted risk classification
    euint64 approvedAmountCipher;       // Encrypted approved amount
    euint16 interestRateCipher;         // Encrypted interest rate (bps)
    bool evaluationComplete;
    bool decryptionRequested;
}
```

## FHE Implementation Details

### Encrypted Operations

Bazaar uses Zama's fhEVM to perform computations on encrypted data:

```solidity
// Credit score computation (simplified)
function _computeCreditScore(uint256 loanId) internal {
    LoanApplication storage app = loans[loanId];

    // All operations performed on ciphertexts
    euint32 baseScore = app.creditScoreCipher;

    // Adjust for payment history (encrypted comparison and arithmetic)
    ebool hasGoodHistory = FHE.gt(app.paymentHistoryCipher, FHE.asEuint16(10));
    euint32 historyBonus = FHE.select(hasGoodHistory, FHE.asEuint32(50), FHE.asEuint32(0));

    // Penalize for past defaults
    euint32 defaultPenalty = FHE.mul(FHE.asEuint32(app.pastDefaultsCipher), FHE.asEuint32(30));

    // Final encrypted score
    euint32 finalScore = FHE.sub(FHE.add(baseScore, historyBonus), defaultPenalty);

    evaluations[loanId].computedScoreCipher = finalScore;
}
```

### Encrypted Type Usage

| Data Field | Encrypted Type | Range | Purpose |
|------------|---------------|-------|---------|
| Loan Amount | `euint64` | 0.1 - 50 ETH | Requested/approved amounts |
| Credit Score | `euint32` | 300 - 850 | Creditworthiness metric |
| Monthly Revenue | `euint32` | Variable | Income verification |
| Loan Term | `euint32` | 30 - 720 days | Repayment period |
| Payment History | `euint16` | 0 - 65535 | Successful payment count |
| Past Defaults | `euint8` | 0 - 255 | Historical default count |
| Community Score | `euint8` | 0 - 10 | Reputation rating |
| Interest Rate | `euint16` | 500 - 5000 bps | Annual interest rate |

### Client-Side Encryption Flow

```typescript
// Frontend encryption using Zama Relayer SDK
const encryptLoanApplication = async (data: LoanData, userAddress: Address) => {
  const instance = await createInstance(SepoliaConfig);

  // Create encrypted input for contract
  const input = instance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);

  // Add each field with appropriate bit width
  input.add64(BigInt(data.requestedAmount));  // euint64
  input.add32(data.requestedTerm);             // euint32
  input.add32(data.creditScore);               // euint32
  input.add32(data.monthlyRevenue);            // euint32
  input.add16(data.paymentHistory);            // euint16
  input.add8(data.pastDefaults);               // euint8
  input.add8(data.communityScore);             // euint8

  const { handles, inputProof } = await input.encrypt();

  return { handles, inputProof };
};
```

## Technology Stack

### Smart Contracts

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Solidity | 0.8.24 |
| FHE Library | @fhevm/solidity | 0.9.1 |
| Development | Hardhat | 2.22.x |
| Testing | Hardhat + Chai | - |

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.3.x |
| Language | TypeScript | 5.8.x |
| Build Tool | Vite | 5.4.x |
| Styling | Tailwind CSS | 3.4.x |
| Components | shadcn/ui | - |
| Web3 | Wagmi + Viem | 2.x |
| Wallet UI | RainbowKit | 2.2.x |
| FHE SDK | Zama Relayer SDK | 0.3.0-5 |

### Infrastructure

| Component | Service |
|-----------|---------|
| Network | Ethereum Sepolia Testnet |
| Deployment | Vercel |
| RPC | Public Sepolia endpoints |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH ([Faucet](https://sepoliafaucet.com))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Bazaar

# Install contract dependencies
yarn install

# Install frontend dependencies
cd frontend && yarn install
```

### Environment Configuration

Create `.env` in the root directory:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0x_your_deployer_private_key
```

### Development

```bash
# Compile contracts
yarn compile

# Run frontend development server
cd frontend && yarn dev
```

## Contract Deployment

### Deploy to Sepolia

```bash
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
npx hardhat run scripts/deploy.ts --network sepolia
```

### Post-Deployment Setup

```bash
# Set up roles (Credit Analyst, Loan Officer, Collection Agent)
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
npx hardhat run scripts/setup-roles.ts --network sepolia
```

### Current Deployment

| Network | Contract Address |
|---------|-----------------|
| Sepolia | `0x7BCA26b53C58c912a5bd57314F8a17a22900C0a5` |

## Frontend Integration

### FHE SDK Integration

The frontend loads Zama's Relayer SDK via CDN and initializes it for client-side encryption:

```html
<!-- index.html -->
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin" />
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp" />
<script src="https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs" defer></script>
```

### Transaction Notifications

All blockchain transactions display real-time status with Etherscan links:

- **Pending**: Shows spinner with transaction hash link
- **Success**: Confirmation with explorer link
- **Failed**: Error message with transaction details
- **Rejected**: User wallet rejection notification

### Key Frontend Files

```
frontend/src/
├── lib/
│   ├── fhe.ts              # FHE encryption utilities
│   └── txToast.tsx         # Transaction notification system
├── hooks/
│   └── useMicroloanContract.ts  # Contract interaction hook
├── components/
│   ├── LoanForm.tsx        # Loan application form
│   └── LoanList.tsx        # Available loans display
└── config/
    └── wagmi.ts            # Wallet configuration (Sepolia only)
```

## Security Considerations

### FHE Security Model

- **Encryption**: All sensitive data encrypted client-side before transmission
- **Computation**: Smart contract operates only on ciphertexts
- **Decryption**: Only authorized parties can request decryption via Gateway

### Smart Contract Security

- **Access Control**: Role-based permissions for sensitive operations
- **State Machine**: Enforced loan lifecycle prevents invalid state transitions
- **Input Validation**: All encrypted inputs validated with proofs

### Known Limitations

1. **Testnet Only**: Current deployment is on Sepolia testnet
2. **Gas Costs**: FHE operations are computationally expensive
3. **Decryption Latency**: Gateway decryption introduces delays

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Bazaar** - Enabling private, accessible microfinance through homomorphic encryption.
