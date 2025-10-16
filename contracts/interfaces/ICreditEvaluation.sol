// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface ICreditEvaluation {
    struct CreditEvaluation {
        uint256 loanId;
        bool isDecrypted;
        uint256 requestId;
        uint256 createdAt;
        
        // Encrypted evaluation results
        euint32 adjustedCreditScoreCipher;
        euint8 riskTierCipher;
        euint64 approvedAmountCipher;
        euint32 interestRateCipher;
        euint32 approvedTermCipher;
        euint64 totalRepaymentCipher;
        
        // Decrypted values (after Gateway callback)
        uint32 decryptedCreditScore;
        uint8 decryptedRiskTier;
        uint64 decryptedApprovedAmount;
        uint32 decryptedInterestRate;
        uint32 decryptedApprovedTerm;
        uint64 decryptedTotalRepayment;
    }

    function requestCreditEvaluation(uint256 loanId) external;
    function creditEvaluationCallback(
        uint256 requestId,
        uint256[] calldata decryptedValues
    ) external;
    function getCreditEvaluation(uint256 loanId) external view returns (CreditEvaluation memory);
}
