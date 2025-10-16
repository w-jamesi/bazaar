// CipheredMicroloanBazaar Contract Configuration
export const CIPHERED_MICROLOAN_BAZAAR_ADDRESS = {
  // Sepolia Testnet - Will be updated after deployment
  11155111: '0x8E5ed8d77cfCC22c05af221C9b08Ec021aAdbF4d', // Placeholder - needs deployment
} as const;

export const CIPHERED_MICROLOAN_BAZAAR_ABI = [
  // Enums
  {
    "type": "enum",
    "name": "LoanStatus",
    "values": ["Draft", "Submitted", "CreditCheck", "RiskAssessment", "Approved", "Disbursed", "Active", "Repaying", "Completed", "Defaulted"]
  },
  {
    "type": "enum",
    "name": "LoanPurpose",
    "values": ["WorkingCapital", "Inventory", "Equipment", "Expansion", "Emergency"]
  },
  {
    "type": "enum",
    "name": "RiskTier",
    "values": ["Minimal", "Low", "Moderate", "High", "VeryHigh", "Rejected"]
  },

  // Core Functions
  {
    "type": "function",
    "name": "submitLoanApplication",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "encryptedAmount", "type": "bytes32" },
      { "name": "amountProof", "type": "bytes" },
      { "name": "encryptedTerm", "type": "bytes32" },
      { "name": "termProof", "type": "bytes" },
      { "name": "encryptedCredit", "type": "bytes32" },
      { "name": "creditProof", "type": "bytes" },
      { "name": "encryptedRevenue", "type": "bytes32" },
      { "name": "revenueProof", "type": "bytes" },
      { "name": "encryptedHistory", "type": "bytes32" },
      { "name": "historyProof", "type": "bytes" },
      { "name": "encryptedDefaults", "type": "bytes32" },
      { "name": "defaultsProof", "type": "bytes" },
      { "name": "encryptedCommunity", "type": "bytes32" },
      { "name": "communityProof", "type": "bytes" },
      { "name": "purpose", "type": "uint8" }
    ],
    "outputs": [{ "name": "loanId", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "fundLoan",
    "stateMutability": "payable",
    "inputs": [
      { "name": "loanId", "type": "uint256" },
      { "name": "encryptedAmount", "type": "bytes32" },
      { "name": "proof", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "makePayment",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "loanId", "type": "uint256" },
      { "name": "encryptedAmount", "type": "bytes32" },
      { "name": "proof", "type": "bytes" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "requestCreditEvaluation",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": [{ "name": "requestId", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "disburseLoan",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "distributeInterest",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "markAsDefaulted",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": []
  },

  // View Functions
  {
    "type": "function",
    "name": "getLoanInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": [
      { "name": "borrower", "type": "address" },
      { "name": "status", "type": "uint8" },
      { "name": "purpose", "type": "uint8" },
      { "name": "submittedAt", "type": "uint256" },
      { "name": "approvedAt", "type": "uint256" },
      { "name": "disbursedAt", "type": "uint256" },
      { "name": "isActive", "type": "bool" },
      { "name": "statusChangeCount", "type": "uint16" }
    ]
  },
  {
    "type": "function",
    "name": "getEvaluationInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": [
      { "name": "creditScore", "type": "uint32" },
      { "name": "riskTier", "type": "uint8" },
      { "name": "approvedAmount", "type": "uint64" },
      { "name": "interestRate", "type": "uint32" },
      { "name": "isDecrypted", "type": "bool" }
    ]
  },
  {
    "type": "function",
    "name": "getPoolInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": [
      { "name": "lenderCount", "type": "uint256" },
      { "name": "totalPooled", "type": "uint64" },
      { "name": "totalInterest", "type": "uint64" },
      { "name": "isFunded", "type": "bool" },
      { "name": "isDistributed", "type": "bool" }
    ]
  },
  {
    "type": "function",
    "name": "getScheduleInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "loanId", "type": "uint256" }],
    "outputs": [
      { "name": "nextPaymentDue", "type": "uint256" },
      { "name": "lastPaymentAt", "type": "uint256" },
      { "name": "isComplete", "type": "bool" },
      { "name": "isDefaulted", "type": "bool" }
    ]
  },
  {
    "type": "function",
    "name": "getBorrowerProfileInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "borrower", "type": "address" }],
    "outputs": [
      { "name": "firstLoanAt", "type": "uint256" },
      { "name": "lastLoanAt", "type": "uint256" },
      { "name": "loanCount", "type": "uint32" },
      { "name": "loanIds", "type": "uint256[]" }
    ]
  },
  {
    "type": "function",
    "name": "getLenderProfileInfo",
    "stateMutability": "view",
    "inputs": [{ "name": "lender", "type": "address" }],
    "outputs": [
      { "name": "firstFundedAt", "type": "uint256" },
      { "name": "lastFundedAt", "type": "uint256" },
      { "name": "fundedCount", "type": "uint32" },
      { "name": "fundedLoanIds", "type": "uint256[]" }
    ]
  },
  {
    "type": "function",
    "name": "getMarketplaceStats",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "name": "totalLoans", "type": "uint256" },
      { "name": "issued", "type": "uint256" },
      { "name": "completed", "type": "uint256" },
      { "name": "defaulted", "type": "uint256" }
    ]
  },
  {
    "type": "function",
    "name": "loanCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "owner",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },

  // Events
  {
    "type": "event",
    "name": "LoanApplicationSubmitted",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": true },
      { "name": "borrower", "type": "address", "indexed": true },
      { "name": "purpose", "type": "uint8", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "LoanStatusChanged",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": true },
      { "name": "oldStatus", "type": "uint8", "indexed": false },
      { "name": "newStatus", "type": "uint8", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "LoanFunded",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": true },
      { "name": "lender", "type": "address", "indexed": true },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "PaymentMade",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": true },
      { "name": "borrower", "type": "address", "indexed": true },
      { "name": "installmentNumber", "type": "uint32", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "CreditEvaluationCompleted",
    "inputs": [
      { "name": "loanId", "type": "uint256", "indexed": true },
      { "name": "creditScore", "type": "uint32", "indexed": false },
      { "name": "riskTier", "type": "uint8", "indexed": false },
      { "name": "approvedAmount", "type": "uint64", "indexed": false },
      { "name": "interestRate", "type": "uint32", "indexed": false }
    ]
  }
] as const;
