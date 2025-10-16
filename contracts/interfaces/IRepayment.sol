// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface IRepayment {
    struct RepaymentSchedule {
        uint256 loanId;
        bool isComplete;
        bool isDefaulted;
        uint256 createdAt;
        uint256 completedAt;
        
        // Encrypted schedule data
        euint32 installmentCountCipher;
        euint64 installmentAmountCipher;
        euint64 totalPaidCipher;
        euint32 installmentsPaidCipher;
        euint32 missedPaymentsCipher;
        euint64 remainingBalanceCipher;
    }

    struct PaymentRecord {
        uint256 loanId;
        address borrower;
        uint256 timestamp;
        
        // Encrypted payment data
        euint64 amountCipher;
        euint32 installmentNumberCipher;
        euint64 principalPaidCipher;
        euint64 interestPaidCipher;
    }

    function makePayment(
        uint256 loanId,
        bytes calldata encryptedAmount,
        bytes calldata proof
    ) external;
    
    function getRepaymentSchedule(uint256 loanId) external view returns (RepaymentSchedule memory);
    function getPaymentHistory(uint256 loanId) external view returns (PaymentRecord[] memory);
    function checkLoanStatus(uint256 loanId) external view returns (bool isComplete, bool isDefaulted);
}
