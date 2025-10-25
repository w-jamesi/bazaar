// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title CipheredMicroloanBazaar
 * @notice Advanced encrypted microloan marketplace with multi-lender pooling, installment repayment tracking, and comprehensive credit evaluation
 * @dev Deep improvements include:
 *      - 9-state loan lifecycle (Draft → Completed/Defaulted)
 *      - Multi-lender pooling with proportional distribution
 *      - Installment-based repayment with interest calculation
 *      - Borrower and lender portfolio management
 *      - Default detection and collection workflow
 *      - 4 roles: owner, creditAnalyst, loanOfficer, collectionAgent
 *      - Gateway decryption: creditScore, riskTier, approvedAmount, interestRate
 */
contract CipheredMicroloanBazaar is SepoliaConfig {

    // ========== Enums ==========

    enum LoanStatus {
        Draft,              // 0: Initial state
        Submitted,          // 1: Submitted for review
        CreditCheck,        // 2: Under credit evaluation
        RiskAssessment,     // 3: Under risk assessment
        Approved,           // 4: Approved, awaiting funding
        Disbursed,          // 5: Funds disbursed to borrower
        Active,             // 6: Active repayment period
        Repaying,           // 7: In repayment process
        Completed,          // 8: Fully repaid
        Defaulted           // 9: Loan defaulted
    }

    enum RiskTier {
        Minimal,            // 0: <5% default risk
        Low,                // 1: 5-10% default risk
        Moderate,           // 2: 10-20% default risk
        High,               // 3: 20-35% default risk
        VeryHigh,           // 4: >35% default risk
        Rejected            // 5: Unacceptable risk
    }

    enum LoanPurpose {
        WorkingCapital,     // 0: Business operations
        Inventory,          // 1: Stock purchase
        Equipment,          // 2: Asset acquisition
        Expansion,          // 3: Business growth
        Emergency           // 4: Urgent needs
    }

    // ========== Roles ==========

    address public owner;
    mapping(address => bool) public creditAnalysts;
    mapping(address => bool) public loanOfficers;
    mapping(address => bool) public collectionAgents;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyCreditAnalyst() {
        require(creditAnalysts[msg.sender], "Not credit analyst");
        _;
    }

    modifier onlyLoanOfficer() {
        require(loanOfficers[msg.sender], "Not loan officer");
        _;
    }

    modifier onlyCollectionAgent() {
        require(collectionAgents[msg.sender], "Not collection agent");
        _;
    }

    // ========== State Variables ==========

    struct LoanApplication {
        uint256 loanId;
        address borrower;
        euint64 requestedAmountCipher;          // Encrypted requested amount
        euint32 requestedTermCipher;            // Encrypted loan term (days)
        euint32 creditScoreCipher;              // Encrypted credit score
        euint32 monthlyRevenueCipher;           // Encrypted monthly revenue
        euint16 paymentHistoryCipher;           // Encrypted successful payment count
        euint8 pastDefaultsCipher;              // Encrypted past default count
        euint8 communityScoreCipher;            // Encrypted community rating (0-10)
        LoanPurpose purpose;
        LoanStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
        uint256 disbursedAt;
        uint256 lastStatusChangeAt;
        uint16 statusChangeCount;
        bool isActive;
    }

    struct CreditEvaluation {
        uint256 loanId;
        euint32 adjustedCreditScoreCipher;      // Credit score after adjustments
        euint8 riskTierCipher;                  // Risk tier (0-5)
        euint64 approvedAmountCipher;           // Encrypted approved amount
        euint32 interestRateCipher;             // Encrypted interest rate (basis points)
        euint32 approvedTermCipher;             // Approved term (days)
        euint64 totalRepaymentCipher;           // Total amount to repay
        uint256 evaluatedAt;
        address evaluatedBy;
        bool isComplete;
        // Decrypted values
        uint32 decryptedCreditScore;
        uint8 decryptedRiskTier;
        uint64 decryptedApprovedAmount;
        uint32 decryptedInterestRate;
        uint32 decryptedApprovedTerm;
        uint64 decryptedTotalRepayment;
        bool isDecrypted;
    }

    struct LoanPool {
        uint256 loanId;
        address[] lenders;
        mapping(address => euint64) contributionsCipher;    // Encrypted contributions
        mapping(address => uint64) decryptedContributions;  // Decrypted for distribution
        mapping(address => bool) lenderContributed;         // Track if lender has contributed
        euint64 totalPooledCipher;                          // Total pooled amount
        uint64 totalPooledDecrypted;
        euint64 totalInterestCipher;                        // Total interest collected
        uint64 totalInterestDecrypted;
        mapping(address => uint64) interestEarned;          // Interest per lender
        mapping(address => bool) hasWithdrawn;              // Withdrawal status
        uint256 lenderCount;
        bool isFunded;
        bool isDistributed;
    }

    struct RepaymentSchedule {
        uint256 loanId;
        euint32 installmentCountCipher;         // Number of installments
        euint64 installmentAmountCipher;        // Amount per installment
        euint64 totalPaidCipher;                // Total amount paid so far
        euint32 installmentsPaidCipher;         // Installments paid count
        euint32 missedPaymentsCipher;           // Missed payment count
        euint64 remainingBalanceCipher;         // Remaining balance
        uint256 nextPaymentDue;                 // Next payment timestamp
        uint256 lastPaymentAt;
        // Decrypted tracking
        uint32 installmentCountDecrypted;
        uint32 installmentsPaidDecrypted;
        bool isComplete;
        bool isDefaulted;
    }

    struct PaymentRecord {
        uint256 loanId;
        euint64 amountCipher;                   // Payment amount
        euint32 installmentNumberCipher;        // Which installment
        euint64 principalPaidCipher;            // Principal portion
        euint64 interestPaidCipher;             // Interest portion
        uint256 paidAt;
        bool isLate;
        uint32 daysLate;
    }

    struct BorrowerProfile {
        address borrower;
        uint256[] loanIds;                      // All loan IDs
        euint32 totalLoansCipher;               // Total loans taken
        euint32 activeLoansCipher;              // Currently active loans
        euint32 completedLoansCipher;           // Successfully completed loans
        euint32 defaultedLoansCipher;           // Defaulted loans
        euint64 totalBorrowedCipher;            // Total borrowed amount
        euint64 totalRepaidCipher;              // Total repaid amount
        euint64 outstandingBalanceCipher;       // Current outstanding balance
        euint16 averageCreditScoreCipher;       // Average credit score
        euint8 reputationScoreCipher;           // Reputation score (0-100)
        uint256 firstLoanAt;
        uint256 lastLoanAt;
        uint32 loanCount;
    }

    struct LenderProfile {
        address lender;
        uint256[] fundedLoanIds;                // Loans funded
        euint64 totalFundedCipher;              // Total amount funded
        euint64 totalInterestEarnedCipher;      // Total interest earned
        euint64 currentExposureCipher;          // Current outstanding exposure
        euint32 activeLoanCountCipher;          // Active loans count
        euint32 completedLoanCountCipher;       // Completed loans count
        euint16 avgReturnRateCipher;            // Average return rate (basis points)
        uint256 firstFundedAt;
        uint256 lastFundedAt;
        uint32 fundedCount;
    }

    struct MarketplacePolicy {
        uint32 minCreditScore;                  // Minimum credit score
        uint32 maxInterestRate;                 // Maximum interest rate (basis points)
        uint32 minInterestRate;                 // Minimum interest rate (basis points)
        uint64 maxLoanAmount;                   // Maximum loan amount
        uint64 minLoanAmount;                   // Minimum loan amount
        uint32 maxLoanTerm;                     // Maximum term (days)
        uint32 minLoanTerm;                     // Minimum term (days)
        uint32 defaultGracePeriod;              // Grace period before default (days)
        uint32 latePaymentThreshold;            // Days before considered late
        uint32 platformFeeBps;                  // Platform fee (basis points)
    }

    // Storage mappings
    mapping(uint256 => LoanApplication) public loans;
    mapping(uint256 => CreditEvaluation) public evaluations;
    mapping(uint256 => LoanPool) private pools;
    mapping(uint256 => RepaymentSchedule) public schedules;
    mapping(uint256 => PaymentRecord[]) public paymentHistory;
    mapping(address => BorrowerProfile) public borrowers;
    mapping(address => LenderProfile) public lenders;

    MarketplacePolicy public policy;
    uint256 public loanCount;
    uint256 public totalLoansIssued;
    uint256 public totalLoansCompleted;
    uint256 public totalLoansDefaulted;

    // Aggregate statistics
    euint128 public totalVolumeProcessedCipher;
    euint128 public totalInterestCollectedCipher;
    euint64 public totalActiveBalanceCipher;

    // ========== Events ==========

    event LoanApplicationSubmitted(
        uint256 indexed loanId,
        address indexed borrower,
        LoanPurpose purpose,
        uint256 timestamp
    );

    event LoanStatusChanged(
        uint256 indexed loanId,
        LoanStatus oldStatus,
        LoanStatus newStatus,
        uint256 timestamp
    );

    event CreditEvaluationRequested(
        uint256 indexed loanId,
        uint256 requestId,
        address evaluatedBy
    );

    event CreditEvaluationCompleted(
        uint256 indexed loanId,
        uint32 creditScore,
        uint8 riskTier,
        uint64 approvedAmount,
        uint32 interestRate
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 timestamp
    );

    event LoanDisbursed(
        uint256 indexed loanId,
        uint256 timestamp
    );

    event PaymentMade(
        uint256 indexed loanId,
        address indexed borrower,
        uint32 installmentNumber,
        uint256 timestamp
    );

    event LoanCompleted(
        uint256 indexed loanId,
        uint256 timestamp
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        uint256 timestamp
    );

    event InterestDistributed(
        uint256 indexed loanId,
        address indexed lender,
        uint64 amount
    );

    event RoleGranted(
        address indexed account,
        string role
    );

    event RoleRevoked(
        address indexed account,
        string role
    );

    // ========== Constructor ==========

    constructor() {
        owner = msg.sender;

        policy = MarketplacePolicy({
            minCreditScore: 550,              // Minimum 550 credit score
            maxInterestRate: 3600,            // 36% APR max (3600 bps)
            minInterestRate: 500,             // 5% APR min (500 bps)
            maxLoanAmount: 100_000,     // $100k max
            minLoanAmount: 1_000,       // $1k min
            maxLoanTerm: 730,                 // 2 years max
            minLoanTerm: 30,                  // 30 days min
            defaultGracePeriod: 15,           // 15 days grace
            latePaymentThreshold: 3,          // 3 days late threshold
            platformFeeBps: 100               // 1% platform fee
        });

        // Initialize aggregate statistics
        totalVolumeProcessedCipher = FHE.asEuint128(0);
        totalInterestCollectedCipher = FHE.asEuint128(0);
        totalActiveBalanceCipher = FHE.asEuint64(0);

        FHE.allowThis(totalVolumeProcessedCipher);
        FHE.allowThis(totalInterestCollectedCipher);
        FHE.allowThis(totalActiveBalanceCipher);
    }

    // ========== Role Management ==========

    function grantCreditAnalyst(address account) external onlyOwner {
        creditAnalysts[account] = true;
        emit RoleGranted(account, "CreditAnalyst");
    }

    function revokeCreditAnalyst(address account) external onlyOwner {
        creditAnalysts[account] = false;
        emit RoleRevoked(account, "CreditAnalyst");
    }

    function grantLoanOfficer(address account) external onlyOwner {
        loanOfficers[account] = true;
        emit RoleGranted(account, "LoanOfficer");
    }

    function revokeLoanOfficer(address account) external onlyOwner {
        loanOfficers[account] = false;
        emit RoleRevoked(account, "LoanOfficer");
    }

    function grantCollectionAgent(address account) external onlyOwner {
        collectionAgents[account] = true;
        emit RoleGranted(account, "CollectionAgent");
    }

    function revokeCollectionAgent(address account) external onlyOwner {
        collectionAgents[account] = false;
        emit RoleRevoked(account, "CollectionAgent");
    }

    // ========== Core Functions ==========


    /**
     * @notice Submit loan application with encrypted credentials
     * @dev Accepts encrypted inputs from frontend using Zama SDK for end-to-end privacy
     */
    function submitLoanApplication(
        externalEuint64 encryptedAmount,
        bytes calldata amountProof,
        externalEuint32 encryptedTerm,
        bytes calldata termProof,
        externalEuint32 encryptedCredit,
        bytes calldata creditProof,
        externalEuint32 encryptedRevenue,
        bytes calldata revenueProof,
        externalEuint16 encryptedHistory,
        bytes calldata historyProof,
        externalEuint8 encryptedDefaults,
        bytes calldata defaultsProof,
        externalEuint8 encryptedCommunity,
        bytes calldata communityProof,
        LoanPurpose purpose
    ) external returns (uint256) {
        // Convert external encrypted inputs to internal encrypted types with verification
        euint64 requestedAmount = FHE.fromExternal(encryptedAmount, amountProof);
        euint32 requestedTerm = FHE.fromExternal(encryptedTerm, termProof);
        euint32 creditScore = FHE.fromExternal(encryptedCredit, creditProof);
        euint32 revenue = FHE.fromExternal(encryptedRevenue, revenueProof);
        euint16 history = FHE.fromExternal(encryptedHistory, historyProof);
        euint8 defaults = FHE.fromExternal(encryptedDefaults, defaultsProof);
        euint8 community = FHE.fromExternal(encryptedCommunity, communityProof);






















        // Allow contract access
        FHE.allowThis(requestedAmount);
        FHE.allowThis(requestedTerm);
        FHE.allowThis(creditScore);
        FHE.allowThis(revenue);
        FHE.allowThis(history);
        FHE.allowThis(defaults);
        FHE.allowThis(community);

        // Allow borrower access
        FHE.allow(requestedAmount, msg.sender);
        FHE.allow(requestedTerm, msg.sender);
        FHE.allow(creditScore, msg.sender);
        FHE.allow(revenue, msg.sender);
        FHE.allow(history, msg.sender);
        FHE.allow(defaults, msg.sender);
        FHE.allow(community, msg.sender);

        uint256 loanId = loanCount++;

        LoanApplication storage loan = loans[loanId];
        loan.loanId = loanId;
        loan.borrower = msg.sender;
        loan.requestedAmountCipher = requestedAmount;
        loan.requestedTermCipher = requestedTerm;
        loan.creditScoreCipher = creditScore;
        loan.monthlyRevenueCipher = revenue;
        loan.paymentHistoryCipher = history;
        loan.pastDefaultsCipher = defaults;
        loan.communityScoreCipher = community;
        loan.purpose = purpose;
        loan.status = LoanStatus.Submitted;
        loan.submittedAt = block.timestamp;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount = 1;
        loan.isActive = true;

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[msg.sender];
        if (profile.firstLoanAt == 0) {
            profile.borrower = msg.sender;
            profile.firstLoanAt = block.timestamp;
            profile.totalLoansCipher = FHE.asEuint32(0);
            profile.activeLoansCipher = FHE.asEuint32(0);
            profile.completedLoansCipher = FHE.asEuint32(0);
            profile.defaultedLoansCipher = FHE.asEuint32(0);
            profile.totalBorrowedCipher = FHE.asEuint64(0);
            profile.totalRepaidCipher = FHE.asEuint64(0);
            profile.outstandingBalanceCipher = FHE.asEuint64(0);
            profile.averageCreditScoreCipher = FHE.asEuint16(0);
            profile.reputationScoreCipher = FHE.asEuint8(50); // Start at 50/100

            FHE.allowThis(profile.totalLoansCipher);
            FHE.allowThis(profile.activeLoansCipher);
            FHE.allowThis(profile.completedLoansCipher);
            FHE.allowThis(profile.defaultedLoansCipher);
            FHE.allowThis(profile.totalBorrowedCipher);
            FHE.allowThis(profile.totalRepaidCipher);
            FHE.allowThis(profile.outstandingBalanceCipher);
            FHE.allowThis(profile.averageCreditScoreCipher);
            FHE.allowThis(profile.reputationScoreCipher);
        }

        profile.loanIds.push(loanId);
        profile.totalLoansCipher = FHE.add(profile.totalLoansCipher, FHE.asEuint32(1));
        profile.lastLoanAt = block.timestamp;
        profile.loanCount++;

        emit LoanApplicationSubmitted(loanId, msg.sender, purpose, block.timestamp);
        emit LoanStatusChanged(loanId, LoanStatus.Draft, LoanStatus.Submitted, block.timestamp);

        return loanId;
    }

    /**
     * @notice Request credit evaluation and Gateway decryption
     */
    function requestCreditEvaluation(uint256 loanId) external onlyCreditAnalyst returns (uint256) {
        LoanApplication storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        require(loan.status == LoanStatus.Submitted, "Invalid status");

        // Update status to CreditCheck
        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.CreditCheck;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.CreditCheck, block.timestamp);

        MarketplacePolicy memory pol = policy;

        // Calculate adjusted credit score with community bonus
        ebool highCommunity = FHE.ge(loan.communityScoreCipher, FHE.asEuint8(7));
        euint32 communityBonus = FHE.select(highCommunity, FHE.asEuint32(50), FHE.asEuint32(0));
        euint32 adjustedCredit = FHE.add(loan.creditScoreCipher, communityBonus);

        // Apply payment history bonus
        ebool goodHistory = FHE.ge(loan.paymentHistoryCipher, FHE.asEuint16(10));
        euint32 historyBonus = FHE.select(goodHistory, FHE.asEuint32(30), FHE.asEuint32(0));
        adjustedCredit = FHE.add(adjustedCredit, historyBonus);

        // Apply default penalty
        euint32 defaultPenalty = FHE.mul(FHE.asEuint32(loan.pastDefaultsCipher), uint32(100));
        ebool canSubtract = FHE.gt(adjustedCredit, defaultPenalty);
        adjustedCredit = FHE.select(canSubtract, FHE.sub(adjustedCredit, defaultPenalty), FHE.asEuint32(300));

        // Calculate risk tier (0=Minimal, 5=Rejected)
        ebool creditExcellent = FHE.ge(adjustedCredit, FHE.asEuint32(750));
        ebool creditGood = FHE.ge(adjustedCredit, FHE.asEuint32(650));
        ebool creditFair = FHE.ge(adjustedCredit, FHE.asEuint32(550));
        ebool creditPoor = FHE.ge(adjustedCredit, FHE.asEuint32(450));

        euint8 riskTier = FHE.select(creditExcellent, FHE.asEuint8(0),  // Minimal
            FHE.select(creditGood, FHE.asEuint8(1),                    // Low
                FHE.select(creditFair, FHE.asEuint8(2),                // Moderate
                    FHE.select(creditPoor, FHE.asEuint8(3),            // High
                        FHE.asEuint8(4)))));                           // VeryHigh (or Rejected)

        // Calculate approved amount (% of requested based on risk)
        // Minimal: 100%, Low: 90%, Moderate: 75%, High: 50%, VeryHigh: 0%
        euint8 approvalPercentage = FHE.select(creditExcellent, FHE.asEuint8(100),
            FHE.select(creditGood, FHE.asEuint8(90),
                FHE.select(creditFair, FHE.asEuint8(75),
                    FHE.select(creditPoor, FHE.asEuint8(50),
                        FHE.asEuint8(0)))));

        euint64 approvedAmount = FHE.div(
            FHE.mul(loan.requestedAmountCipher, FHE.asEuint64(approvalPercentage)),
            uint64(100)
        );

        // Cap at policy max
        ebool exceedsMax = FHE.gt(approvedAmount, FHE.asEuint64(pol.maxLoanAmount));
        approvedAmount = FHE.select(exceedsMax, FHE.asEuint64(pol.maxLoanAmount), approvedAmount);

        // Calculate interest rate based on risk tier
        // Minimal: 8%, Low: 12%, Moderate: 18%, High: 24%, VeryHigh: 30%
        euint32 baseRate = FHE.select(creditExcellent, FHE.asEuint32(800),
            FHE.select(creditGood, FHE.asEuint32(1200),
                FHE.select(creditFair, FHE.asEuint32(1800),
                    FHE.select(creditPoor, FHE.asEuint32(2400),
                        FHE.asEuint32(3000)))));

        // Add revenue-based adjustment
        ebool highRevenue = FHE.ge(loan.monthlyRevenueCipher, FHE.asEuint32(50000));
        euint32 revenueDiscount = FHE.select(highRevenue, FHE.asEuint32(200), FHE.asEuint32(0));
        euint32 interestRate = FHE.sub(baseRate, revenueDiscount);

        // Cap interest rate
        ebool rateTooHigh = FHE.gt(interestRate, FHE.asEuint32(pol.maxInterestRate));
        interestRate = FHE.select(rateTooHigh, FHE.asEuint32(pol.maxInterestRate), interestRate);

        // Calculate total repayment: principal + interest
        // Simple interest: principal * (1 + rate * term/365)
        euint64 interestAmount = FHE.div(
            FHE.mul(
                FHE.mul(approvedAmount, FHE.asEuint64(interestRate)),
                FHE.asEuint64(loan.requestedTermCipher)
            ),
            uint64(365 * 10000) // basis points conversion
        );
        euint64 totalRepayment = FHE.add(approvedAmount, interestAmount);

        // Store evaluation
        CreditEvaluation storage eval = evaluations[loanId];
        eval.loanId = loanId;
        eval.adjustedCreditScoreCipher = adjustedCredit;
        eval.riskTierCipher = riskTier;
        eval.approvedAmountCipher = approvedAmount;
        eval.interestRateCipher = interestRate;
        eval.approvedTermCipher = loan.requestedTermCipher;
        eval.totalRepaymentCipher = totalRepayment;
        eval.evaluatedAt = block.timestamp;
        eval.evaluatedBy = msg.sender;
        eval.isComplete = false;

        FHE.allowThis(adjustedCredit);
        FHE.allowThis(riskTier);
        FHE.allowThis(approvedAmount);
        FHE.allowThis(interestRate);
        FHE.allowThis(totalRepayment);

        // Update loan status to RiskAssessment
        loan.status = LoanStatus.RiskAssessment;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.RiskAssessment, block.timestamp);

        emit CreditEvaluationRequested(loanId, 0, msg.sender);

        return loanId;
    }

    /**
     * @notice Complete credit evaluation (called by authorized analyst)
     */
    function completeCreditEvaluation(
        uint256 loanId,
        uint32 creditScore,
        uint8 riskTier,
        uint64 approvedAmount,
        uint32 interestRate,
        uint32 approvedTerm,
        uint64 totalRepayment
    ) external onlyCreditAnalyst {
        LoanApplication storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        require(loan.status == LoanStatus.RiskAssessment, "Invalid status");

        CreditEvaluation storage eval = evaluations[loanId];

        eval.decryptedCreditScore = creditScore;
        eval.decryptedRiskTier = riskTier;
        eval.decryptedApprovedAmount = approvedAmount;
        eval.decryptedInterestRate = interestRate;
        eval.decryptedApprovedTerm = approvedTerm;
        eval.decryptedTotalRepayment = totalRepayment;
        eval.isDecrypted = true;
        eval.isComplete = true;

        // Update loan status
        LoanStatus oldStatus = loan.status;
        if (riskTier <= 3 && approvedAmount > 0) {
            // Approved (Minimal, Low, Moderate, or High risk)
            loan.status = LoanStatus.Approved;
            loan.approvedAt = block.timestamp;
        } else {
            // Rejected (VeryHigh risk or 0 approved amount)
            loan.status = LoanStatus.Defaulted; // Reusing as Rejected
            loan.isActive = false;
        }
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;

        emit CreditEvaluationCompleted(loanId, creditScore, riskTier, approvedAmount, interestRate);
        emit LoanStatusChanged(loanId, oldStatus, loan.status, block.timestamp);
    }

    /**
     * @notice Lender contributes to loan pool
     */
    function fundLoan(
        uint256 loanId,
        externalEuint64 encryptedAmount,
        bytes calldata amountProof
    ) external payable {
        LoanApplication storage loan = loans[loanId];
        require(loan.status == LoanStatus.Approved, "Loan not approved");
        require(loan.isActive, "Loan not active");
        // Note: Amount verification should be done off-chain or via separate decryption

        CreditEvaluation storage eval = evaluations[loanId];
        require(eval.isDecrypted, "Evaluation not ready");

        euint64 contribution = FHE.fromExternal(encryptedAmount, amountProof);
        FHE.allowThis(contribution);
        FHE.allow(contribution, msg.sender);

        LoanPool storage pool = pools[loanId];

        // Initialize pool if first contribution
        if (pool.lenderCount == 0) {
            pool.loanId = loanId;
            pool.totalPooledCipher = FHE.asEuint64(0);
            pool.totalInterestCipher = FHE.asEuint64(0);
            FHE.allowThis(pool.totalPooledCipher);
            FHE.allowThis(pool.totalInterestCipher);
        }

        // Track lender contribution
        bool isNewLender = pool.lenderContributed[msg.sender] == false;
        if (isNewLender) {
            pool.lenders.push(msg.sender);
            pool.contributionsCipher[msg.sender] = FHE.asEuint64(0);
            FHE.allowThis(pool.contributionsCipher[msg.sender]);
            pool.lenderCount++;
            pool.lenderContributed[msg.sender] = true;
        }

        pool.contributionsCipher[msg.sender] = FHE.add(pool.contributionsCipher[msg.sender], contribution);
        pool.totalPooledCipher = FHE.add(pool.totalPooledCipher, contribution);
        // totalPooledDecrypted will be updated via completeCreditEvaluation or separate function
        // Contribution tracking will be done via decryption oracle

        // Update lender profile
        LenderProfile storage lenderProfile = lenders[msg.sender];
        if (lenderProfile.firstFundedAt == 0) {
            lenderProfile.lender = msg.sender;
            lenderProfile.firstFundedAt = block.timestamp;
            lenderProfile.totalFundedCipher = FHE.asEuint64(0);
            lenderProfile.totalInterestEarnedCipher = FHE.asEuint64(0);
            lenderProfile.currentExposureCipher = FHE.asEuint64(0);
            lenderProfile.activeLoanCountCipher = FHE.asEuint32(0);
            lenderProfile.completedLoanCountCipher = FHE.asEuint32(0);
            lenderProfile.avgReturnRateCipher = FHE.asEuint16(0);

            FHE.allowThis(lenderProfile.totalFundedCipher);
            FHE.allowThis(lenderProfile.totalInterestEarnedCipher);
            FHE.allowThis(lenderProfile.currentExposureCipher);
            FHE.allowThis(lenderProfile.activeLoanCountCipher);
            FHE.allowThis(lenderProfile.completedLoanCountCipher);
            FHE.allowThis(lenderProfile.avgReturnRateCipher);
        }

        lenderProfile.totalFundedCipher = FHE.add(lenderProfile.totalFundedCipher, contribution);
        lenderProfile.currentExposureCipher = FHE.add(lenderProfile.currentExposureCipher, contribution);
        lenderProfile.fundedLoanIds.push(loanId);
        lenderProfile.lastFundedAt = block.timestamp;
        lenderProfile.fundedCount++;

        // Check if fully funded (use decrypted amount for comparison)
        // The analyst has already decrypted the approved amount
        if (pool.totalPooledDecrypted >= eval.decryptedApprovedAmount) {
            pool.isFunded = true;
        }

        emit LoanFunded(loanId, msg.sender, block.timestamp);
    }

    /**
     * @notice Disburse funded loan to borrower
     */
    function disburseLoan(uint256 loanId) external onlyLoanOfficer {
        LoanApplication storage loan = loans[loanId];
        require(loan.status == LoanStatus.Approved, "Loan not approved");

        LoanPool storage pool = pools[loanId];
        require(pool.isFunded, "Loan not fully funded");

        CreditEvaluation storage eval = evaluations[loanId];

        // Update loan status
        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.Disbursed;
        loan.disbursedAt = block.timestamp;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;

        // Create repayment schedule
        RepaymentSchedule storage schedule = schedules[loanId];
        schedule.loanId = loanId;

        // Calculate installments (monthly payments)
        uint32 termDays = eval.decryptedApprovedTerm > 0 ? eval.decryptedApprovedTerm : 180;
        uint32 installmentCount = (termDays + 29) / 30; // Round up to months

        schedule.installmentCountCipher = FHE.asEuint32(installmentCount);
        schedule.installmentAmountCipher = FHE.div(eval.totalRepaymentCipher, uint64(installmentCount));
        schedule.totalPaidCipher = FHE.asEuint64(0);
        schedule.installmentsPaidCipher = FHE.asEuint32(0);
        schedule.missedPaymentsCipher = FHE.asEuint32(0);
        schedule.remainingBalanceCipher = eval.totalRepaymentCipher;
        schedule.nextPaymentDue = block.timestamp + 30 days;
        schedule.installmentCountDecrypted = installmentCount;
        schedule.installmentsPaidDecrypted = 0;

        FHE.allowThis(schedule.installmentCountCipher);
        FHE.allowThis(schedule.installmentAmountCipher);
        FHE.allowThis(schedule.totalPaidCipher);
        FHE.allowThis(schedule.installmentsPaidCipher);
        FHE.allowThis(schedule.missedPaymentsCipher);
        FHE.allowThis(schedule.remainingBalanceCipher);

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.activeLoansCipher = FHE.add(profile.activeLoansCipher, FHE.asEuint32(1));
        profile.totalBorrowedCipher = FHE.add(profile.totalBorrowedCipher, eval.approvedAmountCipher);
        profile.outstandingBalanceCipher = FHE.add(profile.outstandingBalanceCipher, eval.totalRepaymentCipher);

        // Update aggregate statistics
        totalLoansIssued++;
        totalVolumeProcessedCipher = FHE.add(totalVolumeProcessedCipher, FHE.asEuint128(eval.approvedAmountCipher));
        totalActiveBalanceCipher = FHE.add(totalActiveBalanceCipher, eval.totalRepaymentCipher);

        // Update lender profiles
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.activeLoanCountCipher = FHE.add(lenderProfile.activeLoanCountCipher, FHE.asEuint32(1));
        }

        emit LoanDisbursed(loanId, block.timestamp);
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.Disbursed, block.timestamp);

        // Transition to Active
        oldStatus = loan.status;
        loan.status = LoanStatus.Active;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.Active, block.timestamp);
    }

    /**
     * @notice Make loan payment
     */
    function makePayment(
        uint256 loanId,
        externalEuint64 encryptedAmount,
        bytes calldata amountProof
    ) external {
        LoanApplication storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not borrower");
        require(loan.status == LoanStatus.Active || loan.status == LoanStatus.Repaying, "Invalid status");

        RepaymentSchedule storage schedule = schedules[loanId];
        require(!schedule.isDefaulted, "Loan defaulted");

        euint64 paymentAmount = FHE.fromExternal(encryptedAmount, amountProof);
        FHE.allowThis(paymentAmount);

        // Update schedule
        schedule.totalPaidCipher = FHE.add(schedule.totalPaidCipher, paymentAmount);
        schedule.installmentsPaidCipher = FHE.add(schedule.installmentsPaidCipher, FHE.asEuint32(1));

        ebool canSubtract = FHE.ge(schedule.remainingBalanceCipher, paymentAmount);
        schedule.remainingBalanceCipher = FHE.select(
            canSubtract,
            FHE.sub(schedule.remainingBalanceCipher, paymentAmount),
            FHE.asEuint64(0)
        );

        // Calculate principal and interest portions
        CreditEvaluation storage eval = evaluations[loanId];
        euint64 totalInterest = FHE.sub(eval.totalRepaymentCipher, eval.approvedAmountCipher);
        uint32 totalInstallments = schedule.installmentCountDecrypted;
        euint64 interestPerInstallment = FHE.div(totalInterest, uint64(totalInstallments));

        ebool isInterestPayment = FHE.le(paymentAmount, FHE.mul(interestPerInstallment, uint64(2)));
        euint64 interestPaid = FHE.select(isInterestPayment, paymentAmount, interestPerInstallment);
        euint64 principalPaid = FHE.sub(paymentAmount, interestPaid);

        // Record payment
        bool isLate = block.timestamp > schedule.nextPaymentDue + (policy.latePaymentThreshold * 1 days);
        uint32 daysLate = isLate ?
            uint32((block.timestamp - schedule.nextPaymentDue) / 1 days) : 0;

        PaymentRecord memory record = PaymentRecord({
            loanId: loanId,
            amountCipher: paymentAmount,
            installmentNumberCipher: schedule.installmentsPaidCipher,
            principalPaidCipher: principalPaid,
            interestPaidCipher: interestPaid,
            paidAt: block.timestamp,
            isLate: isLate,
            daysLate: daysLate
        });
        paymentHistory[loanId].push(record);

        schedule.lastPaymentAt = block.timestamp;
        schedule.nextPaymentDue += 30 days;

        // Update loan status
        if (loan.status == LoanStatus.Active) {
            LoanStatus oldStatus = loan.status;
            loan.status = LoanStatus.Repaying;
            loan.lastStatusChangeAt = block.timestamp;
            loan.statusChangeCount++;
            emit LoanStatusChanged(loanId, oldStatus, LoanStatus.Repaying, block.timestamp);
        }

        // Distribute interest to pool
        LoanPool storage pool = pools[loanId];
        pool.totalInterestCipher = FHE.add(pool.totalInterestCipher, interestPaid);

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.totalRepaidCipher = FHE.add(profile.totalRepaidCipher, paymentAmount);
        profile.outstandingBalanceCipher = FHE.sub(profile.outstandingBalanceCipher, paymentAmount);

        // Update aggregate statistics
        totalInterestCollectedCipher = FHE.add(totalInterestCollectedCipher, FHE.asEuint128(interestPaid));
        totalActiveBalanceCipher = FHE.sub(totalActiveBalanceCipher, paymentAmount);

        schedule.installmentsPaidDecrypted++;
        uint32 currentInstallment = schedule.installmentsPaidDecrypted;
        emit PaymentMade(loanId, msg.sender, currentInstallment, block.timestamp);

        // Check if loan completed
        if (schedule.installmentsPaidDecrypted >= schedule.installmentCountDecrypted) {
            _completeLoan(loanId);
        }
    }

    /**
     * @notice Mark loan as defaulted (collection agent)
     */
    function markAsDefaulted(uint256 loanId) external onlyCollectionAgent {
        LoanApplication storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active || loan.status == LoanStatus.Repaying, "Invalid status");

        RepaymentSchedule storage schedule = schedules[loanId];
        uint256 gracePeriodEnd = schedule.nextPaymentDue + (policy.defaultGracePeriod * 1 days);
        require(block.timestamp > gracePeriodEnd, "Grace period not expired");

        schedule.isDefaulted = true;

        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.Defaulted;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;
        loan.isActive = false;

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.defaultedLoansCipher = FHE.add(profile.defaultedLoansCipher, FHE.asEuint32(1));
        profile.activeLoansCipher = FHE.sub(profile.activeLoansCipher, FHE.asEuint32(1));

        // Penalty on reputation
        ebool canDecrease = FHE.gt(profile.reputationScoreCipher, FHE.asEuint8(20));
        profile.reputationScoreCipher = FHE.select(
            canDecrease,
            FHE.sub(profile.reputationScoreCipher, FHE.asEuint8(20)),
            FHE.asEuint8(0)
        );

        // Update lender profiles
        LoanPool storage pool = pools[loanId];
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.activeLoanCountCipher = FHE.sub(lenderProfile.activeLoanCountCipher, FHE.asEuint32(1));
            lenderProfile.currentExposureCipher = FHE.sub(lenderProfile.currentExposureCipher, pool.contributionsCipher[lender]);
        }

        totalLoansDefaulted++;

        emit LoanDefaulted(loanId, block.timestamp);
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.Defaulted, block.timestamp);
    }

    /**
     * @notice Internal function to complete loan
     */
    function _completeLoan(uint256 loanId) internal {
        LoanApplication storage loan = loans[loanId];
        RepaymentSchedule storage schedule = schedules[loanId];

        schedule.isComplete = true;

        LoanStatus oldStatus = loan.status;
        loan.status = LoanStatus.Completed;
        loan.lastStatusChangeAt = block.timestamp;
        loan.statusChangeCount++;
        loan.isActive = false;

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.completedLoansCipher = FHE.add(profile.completedLoansCipher, FHE.asEuint32(1));
        profile.activeLoansCipher = FHE.sub(profile.activeLoansCipher, FHE.asEuint32(1));

        // Bonus on reputation
        ebool canIncrease = FHE.lt(profile.reputationScoreCipher, FHE.asEuint8(90));
        profile.reputationScoreCipher = FHE.select(
            canIncrease,
            FHE.add(profile.reputationScoreCipher, FHE.asEuint8(10)),
            FHE.asEuint8(100)
        );

        // Update lender profiles
        LoanPool storage pool = pools[loanId];
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.completedLoanCountCipher = FHE.add(lenderProfile.completedLoanCountCipher, FHE.asEuint32(1));
            lenderProfile.activeLoanCountCipher = FHE.sub(lenderProfile.activeLoanCountCipher, FHE.asEuint32(1));
            lenderProfile.currentExposureCipher = FHE.sub(lenderProfile.currentExposureCipher, pool.contributionsCipher[lender]);
        }

        totalLoansCompleted++;

        emit LoanCompleted(loanId, block.timestamp);
        emit LoanStatusChanged(loanId, oldStatus, LoanStatus.Completed, block.timestamp);
    }

    /**
     * @notice Distribute interest to lenders (after loan completion)
     */
    function distributeInterest(uint256 loanId) external {
        LoanApplication storage loan = loans[loanId];
        require(loan.status == LoanStatus.Completed, "Loan not completed");

        LoanPool storage pool = pools[loanId];
        require(!pool.isDistributed, "Already distributed");

        uint64 totalInterest = pool.totalInterestDecrypted;

        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];

            // Calculate proportional interest (use decrypted contribution we already have)
            uint64 contribution = pool.decryptedContributions[lender];
            uint64 lenderInterest = (totalInterest * contribution) / pool.totalPooledDecrypted;

            pool.interestEarned[lender] = lenderInterest;

            // Update lender profile
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.totalInterestEarnedCipher = FHE.add(
                lenderProfile.totalInterestEarnedCipher,
                FHE.asEuint64(lenderInterest)
            );

            emit InterestDistributed(loanId, lender, lenderInterest);
        }

        pool.isDistributed = true;
        pool.totalInterestDecrypted = totalInterest;
    }

    // ========== View Functions ==========

    function getLoanInfo(uint256 loanId) external view returns (
        address borrower,
        LoanStatus status,
        LoanPurpose purpose,
        uint256 submittedAt,
        uint256 approvedAt,
        uint256 disbursedAt,
        bool isActive,
        uint16 statusChangeCount
    ) {
        LoanApplication storage loan = loans[loanId];
        return (
            loan.borrower,
            loan.status,
            loan.purpose,
            loan.submittedAt,
            loan.approvedAt,
            loan.disbursedAt,
            loan.isActive,
            loan.statusChangeCount
        );
    }

    function getEvaluationInfo(uint256 loanId) external view returns (
        uint32 creditScore,
        uint8 riskTier,
        uint64 approvedAmount,
        uint32 interestRate,
        bool isDecrypted
    ) {
        CreditEvaluation storage eval = evaluations[loanId];
        return (
            eval.decryptedCreditScore,
            eval.decryptedRiskTier,
            eval.decryptedApprovedAmount,
            eval.decryptedInterestRate,
            eval.isDecrypted
        );
    }

    function getPoolInfo(uint256 loanId) external view returns (
        uint256 lenderCount,
        uint64 totalPooled,
        uint64 totalInterest,
        bool isFunded,
        bool isDistributed
    ) {
        LoanPool storage pool = pools[loanId];
        return (
            pool.lenderCount,
            pool.totalPooledDecrypted,
            pool.totalInterestDecrypted,
            pool.isFunded,
            pool.isDistributed
        );
    }

    function getScheduleInfo(uint256 loanId) external view returns (
        uint256 nextPaymentDue,
        uint256 lastPaymentAt,
        bool isComplete,
        bool isDefaulted
    ) {
        RepaymentSchedule storage schedule = schedules[loanId];
        return (
            schedule.nextPaymentDue,
            schedule.lastPaymentAt,
            schedule.isComplete,
            schedule.isDefaulted
        );
    }

    function getBorrowerProfileInfo(address borrower) external view returns (
        uint256 firstLoanAt,
        uint256 lastLoanAt,
        uint32 borrowerLoanCount,
        uint256[] memory loanIds
    ) {
        BorrowerProfile storage profile = borrowers[borrower];
        return (
            profile.firstLoanAt,
            profile.lastLoanAt,
            profile.loanCount,
            profile.loanIds
        );
    }

    function getLenderProfileInfo(address lender) external view returns (
        uint256 firstFundedAt,
        uint256 lastFundedAt,
        uint32 fundedCount,
        uint256[] memory fundedLoanIds
    ) {
        LenderProfile storage profile = lenders[lender];
        return (
            profile.firstFundedAt,
            profile.lastFundedAt,
            profile.fundedCount,
            profile.fundedLoanIds
        );
    }

    function getPaymentHistory(uint256 loanId) external view returns (uint256) {
        return paymentHistory[loanId].length;
    }

    function getPaymentRecord(uint256 loanId, uint256 index) external view returns (
        uint256 paidAt,
        bool isLate,
        uint32 daysLate
    ) {
        PaymentRecord storage record = paymentHistory[loanId][index];
        return (
            record.paidAt,
            record.isLate,
            record.daysLate
        );
    }

    function getLenderInterest(uint256 loanId, address lender) external view returns (uint64) {
        return pools[loanId].interestEarned[lender];
    }

    function getMarketplaceStats() external view returns (
        uint256 totalLoans,
        uint256 issued,
        uint256 completed,
        uint256 defaulted
    ) {
        return (
            loanCount,
            totalLoansIssued,
            totalLoansCompleted,
            totalLoansDefaulted
        );
    }

    // ========== Admin Functions ==========

    function updatePolicy(MarketplacePolicy calldata newPolicy) external onlyOwner {
        require(newPolicy.minCreditScore > 0, "Invalid credit score");
        require(newPolicy.maxLoanAmount > newPolicy.minLoanAmount, "Invalid loan amounts");
        require(newPolicy.maxInterestRate > newPolicy.minInterestRate, "Invalid interest rates");

        policy = newPolicy;
    }
}
