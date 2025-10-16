// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

interface ILoanPool {
    struct LoanPool {
        uint256 loanId;
        bool isFunded;
        bool isDistributed;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 distributedAt;
        
        // Pool participants
        address[] lenders;
        uint32 lenderCount;
        
        // Encrypted pool data
        mapping(address => euint64) contributionsCipher;
        euint64 totalPooledCipher;
        euint64 totalInterestCipher;
        
        // Decrypted values
        uint64 totalPooledDecrypted;
        mapping(address => uint64) decryptedContributions;
        mapping(address => uint64) interestEarned;
    }

    function fundLoan(
        uint256 loanId,
        bytes calldata encryptedAmount,
        bytes calldata proof
    ) external payable;
    
    function distributeLoanProceeds(uint256 loanId) external;
    function getLoanPool(uint256 loanId) external view returns (
        bool isFunded,
        bool isDistributed,
        uint256 createdAt,
        uint256 fundedAt,
        uint256 distributedAt,
        address[] memory lenders,
        uint32 lenderCount,
        uint64 totalPooledDecrypted
    );
    function getLenderContributions(uint256 loanId, address lender) external view returns (uint64);
}
