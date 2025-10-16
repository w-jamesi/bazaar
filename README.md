# CipheredMicroloan-Bazaar

A fully homomorphic encryption (FHE) enabled microloan marketplace for developing countries, built on Zama's FHE technology.

## 🚀 **Recent Improvements**

### ✅ **Completed**
1. **FHEVM Integration Fixed**
   - Updated to use Zama's latest FHE SDK (0.2.0)
   - Replaced outdated `fhevmjs` with modern CDN-based SDK
   - Fixed encryption functions for all data types (uint8, uint16, uint32, uint64)
   - Added proper error handling and logging

2. **Frontend Internationalization**
   - Converted all Chinese UI text to English
   - Updated form labels, placeholders, and error messages
   - Improved user experience with consistent English interface

3. **Smart Contract Infrastructure**
   - Created deployment script (`scripts/deploy.ts`)
   - Added Hardhat configuration (`hardhat.config.ts`)
   - Set up package.json with proper dependencies
   - Added environment variable template

### 🔄 **In Progress**
1. **Frontend UI Improvements**
   - Enhanced form validation and user feedback
   - Improved loading states and error handling
   - Better responsive design

### 📋 **Pending**
1. **Contract Deployment**
   - Deploy to Sepolia testnet
   - Update contract address in frontend configuration
   - Test end-to-end functionality

2. **Loan Management Features**
   - Add loan status tracking for borrowers
   - Create repayment management interface
   - Build lender portfolio dashboard
   - Add admin functions for credit analysts

## 🏗️ **Architecture**

### Smart Contract Features
- **9-state loan lifecycle**: Draft → Submitted → CreditCheck → RiskAssessment → Approved → Disbursed → Active → Repaying → Completed/Defaulted
- **Multi-lender pooling**: Multiple lenders can fund a single loan
- **FHE encryption**: All sensitive data encrypted using homomorphic encryption
- **Role-based access**: Owner, CreditAnalyst, LoanOfficer, CollectionAgent
- **Credit evaluation**: Automated risk assessment with community scoring
- **Installment tracking**: Monthly payment schedules with interest calculation

### Frontend Features
- **Wallet Integration**: MetaMask and other Web3 wallets via RainbowKit
- **FHE Encryption**: Client-side encryption before blockchain submission
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live loan status and funding progress

## 🛠️ **Technology Stack**

- **Smart Contracts**: Solidity 0.8.24 with FHEVM
- **Frontend**: React + TypeScript + Vite
- **Web3**: Wagmi + RainbowKit + Ethers.js
- **FHE**: Zama FHE SDK 0.2.0
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Hardhat + Sepolia Testnet

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia ETH for gas fees

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd CipheredMicroloan-Bazaar
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your private key and RPC URL
   ```

3. **Deploy smart contract**:
   ```bash
   npm run deploy
   ```

4. **Update contract address**:
   - Copy deployed address to `frontend/src/contracts/CipheredMicroloanBazaar.ts`

5. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## 📱 **Usage**

### For Borrowers
1. Connect wallet
2. Navigate to "Apply for Microloan"
3. Fill out encrypted loan application
4. Wait for credit evaluation
5. Receive funds when approved and funded
6. Make monthly payments

### For Lenders
1. Connect wallet
2. Navigate to "Become a Lender"
3. Browse available loan requests
4. Fund loans with desired amounts
5. Earn interest on successful repayments

### For Credit Analysts
1. Review submitted applications
2. Request credit evaluations
3. Approve or reject based on risk assessment

## 🔒 **Privacy & Security**

- **FHE Encryption**: All sensitive financial data encrypted using homomorphic encryption
- **Zero-Knowledge**: Lenders cannot see borrower's personal financial information
- **Smart Contract Security**: Audited contract logic with role-based permissions
- **Decentralized**: No central authority controls the platform

## 🌍 **Social Impact**

This platform enables:
- **Financial Inclusion**: Access to credit for underserved populations
- **Transparent Lending**: Fair interest rates without hidden fees
- **Privacy Protection**: Borrowers maintain financial privacy
- **Global Reach**: Cross-border microlending without intermediaries

## 📊 **Current Status**

- ✅ Smart contract development complete
- ✅ FHE integration working
- ✅ Frontend UI internationalized
- 🔄 Contract deployment pending
- 🔄 End-to-end testing pending
- 🔄 Production deployment pending

## 🤝 **Contributing**

This project is part of the Zama FHE ecosystem. Contributions are welcome for:
- Additional loan features
- UI/UX improvements
- Security audits
- Documentation

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Zama's FHE technology for a more private and inclusive financial future.**
