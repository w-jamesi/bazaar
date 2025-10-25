// CipheredMicroloanBazaar Contract Configuration
export const CIPHERED_MICROLOAN_BAZAAR_ADDRESS = {
  // Sepolia Testnet - Deployed contract address
  11155111: '0x2Dcd5C11697674Eaa476BD9B93a746fe63A4E01e',
} as const;

export const CIPHERED_MICROLOAN_BAZAAR_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "creditScore",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "riskTier",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "approvedAmount",
        "type": "uint64"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "interestRate",
        "type": "uint32"
      }
    ],
    "name": "CreditEvaluationCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "requestId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "evaluatedBy",
        "type": "address"
      }
    ],
    "name": "CreditEvaluationRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "amount",
        "type": "uint64"
      }
    ],
    "name": "InterestDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum CipheredMicroloanBazaar.LoanPurpose",
        "name": "purpose",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanApplicationSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanDefaulted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanDisbursed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum CipheredMicroloanBazaar.LoanStatus",
        "name": "oldStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "enum CipheredMicroloanBazaar.LoanStatus",
        "name": "newStatus",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "LoanStatusChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "installmentNumber",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PaymentMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "role",
        "type": "string"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "role",
        "type": "string"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "borrowers",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "euint32",
        "name": "totalLoansCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "activeLoansCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "completedLoansCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "defaultedLoansCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "totalBorrowedCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "totalRepaidCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "outstandingBalanceCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "averageCreditScoreCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "reputationScoreCipher",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "firstLoanAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastLoanAt",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "loanCount",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "collectionAgents",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "creditScore",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "riskTier",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "approvedAmount",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "interestRate",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "approvedTerm",
        "type": "uint32"
      },
      {
        "internalType": "uint64",
        "name": "totalRepayment",
        "type": "uint64"
      }
    ],
    "name": "completeCreditEvaluation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "creditAnalysts",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "disburseLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "distributeInterest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "evaluations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "adjustedCreditScoreCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "riskTierCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "approvedAmountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "interestRateCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "approvedTermCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "totalRepaymentCipher",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "evaluatedAt",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "evaluatedBy",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isComplete",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "decryptedCreditScore",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "decryptedRiskTier",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "decryptedApprovedAmount",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "decryptedInterestRate",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "decryptedApprovedTerm",
        "type": "uint32"
      },
      {
        "internalType": "uint64",
        "name": "decryptedTotalRepayment",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "isDecrypted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint64",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "amountProof",
        "type": "bytes"
      }
    ],
    "name": "fundLoan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      }
    ],
    "name": "getBorrowerProfileInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "firstLoanAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastLoanAt",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "borrowerLoanCount",
        "type": "uint32"
      },
      {
        "internalType": "uint256[]",
        "name": "loanIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "getEvaluationInfo",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "creditScore",
        "type": "uint32"
      },
      {
        "internalType": "uint8",
        "name": "riskTier",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "approvedAmount",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "interestRate",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isDecrypted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      }
    ],
    "name": "getLenderInterest",
    "outputs": [
      {
        "internalType": "uint64",
        "name": "",
        "type": "uint64"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      }
    ],
    "name": "getLenderProfileInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "firstFundedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastFundedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "fundedCount",
        "type": "uint32"
      },
      {
        "internalType": "uint256[]",
        "name": "fundedLoanIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "getLoanInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "enum CipheredMicroloanBazaar.LoanStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "enum CipheredMicroloanBazaar.LoanPurpose",
        "name": "purpose",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "submittedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "approvedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "disbursedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint16",
        "name": "statusChangeCount",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMarketplaceStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalLoans",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "issued",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "completed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "defaulted",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "getPaymentHistory",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getPaymentRecord",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "paidAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isLate",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "daysLate",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "getPoolInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "lenderCount",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "totalPooled",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "totalInterest",
        "type": "uint64"
      },
      {
        "internalType": "bool",
        "name": "isFunded",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isDistributed",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "getScheduleInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "nextPaymentDue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastPaymentAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isComplete",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isDefaulted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantCollectionAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantCreditAnalyst",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantLoanOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "lenders",
    "outputs": [
      {
        "internalType": "address",
        "name": "lender",
        "type": "address"
      },
      {
        "internalType": "euint64",
        "name": "totalFundedCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "totalInterestEarnedCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "currentExposureCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "activeLoanCountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "completedLoanCountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "avgReturnRateCipher",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "firstFundedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastFundedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "fundedCount",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "loanCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "loanOfficers",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "loans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "internalType": "euint64",
        "name": "requestedAmountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "requestedTermCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "creditScoreCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "monthlyRevenueCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint16",
        "name": "paymentHistoryCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "pastDefaultsCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint8",
        "name": "communityScoreCipher",
        "type": "bytes32"
      },
      {
        "internalType": "enum CipheredMicroloanBazaar.LoanPurpose",
        "name": "purpose",
        "type": "uint8"
      },
      {
        "internalType": "enum CipheredMicroloanBazaar.LoanStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "submittedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "approvedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "disbursedAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastStatusChangeAt",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "statusChangeCount",
        "type": "uint16"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "externalEuint64",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "amountProof",
        "type": "bytes"
      }
    ],
    "name": "makePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "markAsDefaulted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "paymentHistory",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "euint64",
        "name": "amountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "installmentNumberCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "principalPaidCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "interestPaidCipher",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "paidAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isLate",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "daysLate",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "policy",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "minCreditScore",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "maxInterestRate",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "minInterestRate",
        "type": "uint32"
      },
      {
        "internalType": "uint64",
        "name": "maxLoanAmount",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "minLoanAmount",
        "type": "uint64"
      },
      {
        "internalType": "uint32",
        "name": "maxLoanTerm",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "minLoanTerm",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "defaultGracePeriod",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "latePaymentThreshold",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "platformFeeBps",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "requestCreditEvaluation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeCollectionAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeCreditAnalyst",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeLoanOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "schedules",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "internalType": "euint32",
        "name": "installmentCountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "installmentAmountCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "totalPaidCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "installmentsPaidCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "missedPaymentsCipher",
        "type": "bytes32"
      },
      {
        "internalType": "euint64",
        "name": "remainingBalanceCipher",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "nextPaymentDue",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastPaymentAt",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "installmentCountDecrypted",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "installmentsPaidDecrypted",
        "type": "uint32"
      },
      {
        "internalType": "bool",
        "name": "isComplete",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isDefaulted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint64",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "amountProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedTerm",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "termProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedCredit",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "creditProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedRevenue",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "revenueProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint16",
        "name": "encryptedHistory",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "historyProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint8",
        "name": "encryptedDefaults",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "defaultsProof",
        "type": "bytes"
      },
      {
        "internalType": "externalEuint8",
        "name": "encryptedCommunity",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "communityProof",
        "type": "bytes"
      },
      {
        "internalType": "enum CipheredMicroloanBazaar.LoanPurpose",
        "name": "purpose",
        "type": "uint8"
      }
    ],
    "name": "submitLoanApplication",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalActiveBalanceCipher",
    "outputs": [
      {
        "internalType": "euint64",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalInterestCollectedCipher",
    "outputs": [
      {
        "internalType": "euint128",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLoansCompleted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLoansDefaulted",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLoansIssued",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVolumeProcessedCipher",
    "outputs": [
      {
        "internalType": "euint128",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint32",
            "name": "minCreditScore",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "maxInterestRate",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minInterestRate",
            "type": "uint32"
          },
          {
            "internalType": "uint64",
            "name": "maxLoanAmount",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "minLoanAmount",
            "type": "uint64"
          },
          {
            "internalType": "uint32",
            "name": "maxLoanTerm",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "minLoanTerm",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "defaultGracePeriod",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "latePaymentThreshold",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "platformFeeBps",
            "type": "uint32"
          }
        ],
        "internalType": "struct CipheredMicroloanBazaar.MarketplacePolicy",
        "name": "newPolicy",
        "type": "tuple"
      }
    ],
    "name": "updatePolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
