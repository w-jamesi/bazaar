// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface IUserProfile {
    struct BorrowerProfile {
        address borrower;
        uint256 firstLoanAt;
        uint256 lastLoanAt;
        uint32 loanCount;
        uint256[] loanIds;
        
        // Encrypted profile data
        euint32 totalLoansCipher;
        euint32 activeLoansCipher;
        euint32 completedLoansCipher;
        euint32 defaultedLoansCipher;
        euint64 totalBorrowedCipher;
        euint64 totalRepaidCipher;
        euint64 outstandingBalanceCipher;
        euint16 averageCreditScoreCipher;
        euint8 reputationScoreCipher;
    }

    struct LenderProfile {
        address lender;
        uint256 firstFundedAt;
        uint256 lastFundedAt;
        uint32 fundedCount;
        uint256[] fundedLoanIds;
        
        // Encrypted profile data
        euint64 totalFundedCipher;
        euint64 totalInterestEarnedCipher;
        euint64 currentExposureCipher;
        euint32 activeLoanCountCipher;
        euint32 completedLoanCountCipher;
        euint16 avgReturnRateCipher;
    }

    function getBorrowerProfile(address borrower) external view returns (BorrowerProfile memory);
    function getLenderProfile(address lender) external view returns (LenderProfile memory);
    function updateBorrowerProfile(address borrower, uint256 loanId, bool isNewLoan) external;
    function updateLenderProfile(address lender, uint256 loanId, uint64 amount) external;
}
