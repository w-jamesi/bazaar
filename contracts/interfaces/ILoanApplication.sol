// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface ILoanApplication {
    enum LoanStatus {
        Draft,              // 0: Initial state
        Submitted,          // 1: Application submitted
        CreditCheck,        // 2: Credit evaluation in progress
        RiskAssessment,     // 3: Risk assessment in progress
        Approved,           // 4: Approved and ready for funding
        Disbursed,          // 5: Funds disbursed to borrower
        Active,             // 6: Loan is active and being repaid
        Repaying,           // 7: Borrower is making payments
        Completed,          // 8: Loan fully repaid
        Defaulted           // 9: Loan defaulted
    }

    enum LoanPurpose {
        WorkingCapital,     // 0: General business operations
        Inventory,          // 1: Inventory purchase
        Equipment,          // 2: Equipment purchase
        Expansion,          // 3: Business expansion
        Emergency           // 4: Emergency needs
    }

    struct LoanApplication {
        uint256 loanId;
        address borrower;
        LoanStatus status;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        
        // Encrypted application data
        euint64 requestedAmountCipher;
        euint32 requestedTermCipher;
        euint32 creditScoreCipher;
        euint32 monthlyRevenueCipher;
        euint16 paymentHistoryCipher;
        euint8 pastDefaultsCipher;
        euint8 communityScoreCipher;
        LoanPurpose purpose;
    }

    function submitLoanApplication(
        bytes calldata encryptedAmount,
        bytes calldata amountProof,
        bytes calldata encryptedTerm,
        bytes calldata termProof,
        bytes calldata encryptedCredit,
        bytes calldata creditProof,
        bytes calldata encryptedRevenue,
        bytes calldata revenueProof,
        bytes calldata encryptedHistory,
        bytes calldata historyProof,
        bytes calldata encryptedDefaults,
        bytes calldata defaultsProof,
        bytes calldata encryptedCommunity,
        bytes calldata communityProof,
        LoanPurpose purpose
    ) external returns (uint256);

    function getLoanApplication(uint256 loanId) external view returns (LoanApplication memory);
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory);
}
