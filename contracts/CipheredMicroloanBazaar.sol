// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";

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
contract CipheredMicroloanBazaar is SepoliaZamaFHEVMConfig, GatewayCaller {

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
        bool isDecrypted;
    }

    struct LoanPool {
        uint256 loanId;
        address[] lenders;
        mapping(address => euint64) contributionsCipher;    // Encrypted contributions
        mapping(address => uint64) decryptedContributions;  // Decrypted for distribution
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
    mapping(uint256 => uint256) private gatewayRequestToLoan;
    mapping(uint256 => address) private gatewayRequestToAddress;

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
        totalVolumeProcessedCipher = TFHE.asEuint128(0);
        totalInterestCollectedCipher = TFHE.asEuint128(0);
        totalActiveBalanceCipher = TFHE.asEuint64(0);

        TFHE.allowThis(totalVolumeProcessedCipher);
        TFHE.allowThis(totalInterestCollectedCipher);
        TFHE.allowThis(totalActiveBalanceCipher);
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
     */
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
    ) external returns (uint256) {
        // Convert external inputs with proofs
        euint64 requestedAmount = TFHE.asEuint64(abi.decode(encryptedAmount, (uint256)));
        euint32 requestedTerm = TFHE.asEuint32(abi.decode(encryptedTerm, (uint256)));
        euint32 creditScore = TFHE.asEuint32(abi.decode(encryptedCredit, (uint256)));
        euint32 revenue = TFHE.asEuint32(abi.decode(encryptedRevenue, (uint256)));
        euint16 history = TFHE.asEuint16(abi.decode(encryptedHistory, (uint256)));
        euint8 defaults = TFHE.asEuint8(abi.decode(encryptedDefaults, (uint256)));
        euint8 community = TFHE.asEuint8(abi.decode(encryptedCommunity, (uint256)));

        // Allow contract access
        TFHE.allowThis(requestedAmount);
        TFHE.allowThis(requestedTerm);
        TFHE.allowThis(creditScore);
        TFHE.allowThis(revenue);
        TFHE.allowThis(history);
        TFHE.allowThis(defaults);
        TFHE.allowThis(community);

        // Allow borrower access
        TFHE.allow(requestedAmount, msg.sender);
        TFHE.allow(requestedTerm, msg.sender);
        TFHE.allow(creditScore, msg.sender);
        TFHE.allow(revenue, msg.sender);
        TFHE.allow(history, msg.sender);
        TFHE.allow(defaults, msg.sender);
        TFHE.allow(community, msg.sender);

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
            profile.totalLoansCipher = TFHE.asEuint32(0);
            profile.activeLoansCipher = TFHE.asEuint32(0);
            profile.completedLoansCipher = TFHE.asEuint32(0);
            profile.defaultedLoansCipher = TFHE.asEuint32(0);
            profile.totalBorrowedCipher = TFHE.asEuint64(0);
            profile.totalRepaidCipher = TFHE.asEuint64(0);
            profile.outstandingBalanceCipher = TFHE.asEuint64(0);
            profile.averageCreditScoreCipher = TFHE.asEuint16(0);
            profile.reputationScoreCipher = TFHE.asEuint8(50); // Start at 50/100

            TFHE.allowThis(profile.totalLoansCipher);
            TFHE.allowThis(profile.activeLoansCipher);
            TFHE.allowThis(profile.completedLoansCipher);
            TFHE.allowThis(profile.defaultedLoansCipher);
            TFHE.allowThis(profile.totalBorrowedCipher);
            TFHE.allowThis(profile.totalRepaidCipher);
            TFHE.allowThis(profile.outstandingBalanceCipher);
            TFHE.allowThis(profile.averageCreditScoreCipher);
            TFHE.allowThis(profile.reputationScoreCipher);
        }

        profile.loanIds.push(loanId);
        profile.totalLoansCipher = TFHE.add(profile.totalLoansCipher, TFHE.asEuint32(1));
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
        ebool highCommunity = TFHE.ge(loan.communityScoreCipher, TFHE.asEuint8(7));
        euint32 communityBonus = TFHE.select(highCommunity, TFHE.asEuint32(50), TFHE.asEuint32(0));
        euint32 adjustedCredit = TFHE.add(loan.creditScoreCipher, communityBonus);

        // Apply payment history bonus
        ebool goodHistory = TFHE.ge(loan.paymentHistoryCipher, TFHE.asEuint16(10));
        euint32 historyBonus = TFHE.select(goodHistory, TFHE.asEuint32(30), TFHE.asEuint32(0));
        adjustedCredit = TFHE.add(adjustedCredit, historyBonus);

        // Apply default penalty
        euint32 defaultPenalty = TFHE.mul(TFHE.asEuint32(loan.pastDefaultsCipher), uint32(100));
        ebool canSubtract = TFHE.gt(adjustedCredit, defaultPenalty);
        adjustedCredit = TFHE.select(canSubtract, TFHE.sub(adjustedCredit, defaultPenalty), TFHE.asEuint32(300));

        // Calculate risk tier (0=Minimal, 5=Rejected)
        ebool creditExcellent = TFHE.ge(adjustedCredit, TFHE.asEuint32(750));
        ebool creditGood = TFHE.ge(adjustedCredit, TFHE.asEuint32(650));
        ebool creditFair = TFHE.ge(adjustedCredit, TFHE.asEuint32(550));
        ebool creditPoor = TFHE.ge(adjustedCredit, TFHE.asEuint32(450));

        euint8 riskTier = TFHE.select(creditExcellent, TFHE.asEuint8(0),  // Minimal
            TFHE.select(creditGood, TFHE.asEuint8(1),                    // Low
                TFHE.select(creditFair, TFHE.asEuint8(2),                // Moderate
                    TFHE.select(creditPoor, TFHE.asEuint8(3),            // High
                        TFHE.asEuint8(4)))));                           // VeryHigh (or Rejected)

        // Calculate approved amount (% of requested based on risk)
        // Minimal: 100%, Low: 90%, Moderate: 75%, High: 50%, VeryHigh: 0%
        euint8 approvalPercentage = TFHE.select(creditExcellent, TFHE.asEuint8(100),
            TFHE.select(creditGood, TFHE.asEuint8(90),
                TFHE.select(creditFair, TFHE.asEuint8(75),
                    TFHE.select(creditPoor, TFHE.asEuint8(50),
                        TFHE.asEuint8(0)))));

        euint64 approvedAmount = TFHE.div(
            TFHE.mul(loan.requestedAmountCipher, TFHE.asEuint64(approvalPercentage)),
            uint64(100)
        );

        // Cap at policy max
        ebool exceedsMax = TFHE.gt(approvedAmount, TFHE.asEuint64(pol.maxLoanAmount));
        approvedAmount = TFHE.select(exceedsMax, TFHE.asEuint64(pol.maxLoanAmount), approvedAmount);

        // Calculate interest rate based on risk tier
        // Minimal: 8%, Low: 12%, Moderate: 18%, High: 24%, VeryHigh: 30%
        euint32 baseRate = TFHE.select(creditExcellent, TFHE.asEuint32(800),
            TFHE.select(creditGood, TFHE.asEuint32(1200),
                TFHE.select(creditFair, TFHE.asEuint32(1800),
                    TFHE.select(creditPoor, TFHE.asEuint32(2400),
                        TFHE.asEuint32(3000)))));

        // Add revenue-based adjustment
        ebool highRevenue = TFHE.ge(loan.monthlyRevenueCipher, TFHE.asEuint32(50000));
        euint32 revenueDiscount = TFHE.select(highRevenue, TFHE.asEuint32(200), TFHE.asEuint32(0));
        euint32 interestRate = TFHE.sub(baseRate, revenueDiscount);

        // Cap interest rate
        ebool rateTooHigh = TFHE.gt(interestRate, TFHE.asEuint32(pol.maxInterestRate));
        interestRate = TFHE.select(rateTooHigh, TFHE.asEuint32(pol.maxInterestRate), interestRate);

        // Calculate total repayment: principal + interest
        // Simple interest: principal * (1 + rate * term/365)
        euint64 interestAmount = TFHE.div(
            TFHE.mul(
                TFHE.mul(approvedAmount, TFHE.asEuint64(interestRate)),
                TFHE.asEuint64(loan.requestedTermCipher)
            ),
            uint64(365 * 10000) // basis points conversion
        );
        euint64 totalRepayment = TFHE.add(approvedAmount, interestAmount);

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

        TFHE.allowThis(adjustedCredit);
        TFHE.allowThis(riskTier);
        TFHE.allowThis(approvedAmount);
        TFHE.allowThis(interestRate);
        TFHE.allowThis(totalRepayment);

        // Prepare for Gateway decryption
        uint256[] memory cts = new uint256[](4);
        cts[0] = Gateway.toUint256(adjustedCredit);
        cts[1] = Gateway.toUint256(riskTier);
        cts[2] = Gateway.toUint256(approvedAmount);
        cts[3] = Gateway.toUint256(interestRate);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.creditEvaluationCallback.selector,
            0,
            block.timestamp + 1 hours,
            false
        );

        gatewayRequestToLoan[requestId] = loanId;

        emit CreditEvaluationRequested(loanId, requestId, msg.sender);

        return requestId;
    }

    /**
     * @notice Gateway callback for credit evaluation decryption
     */
    function creditEvaluationCallback(
        uint256 requestId,
        uint256[] calldata decryptedValues
    ) external onlyGateway {
        uint256 loanId = gatewayRequestToLoan[requestId];
        LoanApplication storage loan = loans[loanId];
        CreditEvaluation storage eval = evaluations[loanId];

        uint32 creditScore = uint32(decryptedValues[0]);
        uint8 riskTier = uint8(decryptedValues[1]);
        uint64 approvedAmount = uint64(decryptedValues[2]);
        uint32 interestRate = uint32(decryptedValues[3]);

        eval.decryptedCreditScore = creditScore;
        eval.decryptedRiskTier = riskTier;
        eval.decryptedApprovedAmount = approvedAmount;
        eval.decryptedInterestRate = interestRate;
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
        bytes calldata encryptedAmount,
        bytes calldata proof
    ) external payable {
        LoanApplication storage loan = loans[loanId];
        require(loan.status == LoanStatus.Approved, "Loan not approved");
        require(loan.isActive, "Loan not active");

        CreditEvaluation storage eval = evaluations[loanId];
        require(eval.isDecrypted, "Evaluation not ready");

        euint64 contribution = TFHE.asEuint64(abi.decode(encryptedAmount, (uint256)));
        TFHE.allowThis(contribution);

        LoanPool storage pool = pools[loanId];

        // Initialize pool if first contribution
        if (pool.lenderCount == 0) {
            pool.loanId = loanId;
            pool.totalPooledCipher = TFHE.asEuint64(0);
            pool.totalInterestCipher = TFHE.asEuint64(0);
            TFHE.allowThis(pool.totalPooledCipher);
            TFHE.allowThis(pool.totalInterestCipher);
        }

        // Track lender contribution
        if (Gateway.toUint256(pool.contributionsCipher[msg.sender]) == 0) {
            pool.lenders.push(msg.sender);
            pool.contributionsCipher[msg.sender] = TFHE.asEuint64(0);
            TFHE.allowThis(pool.contributionsCipher[msg.sender]);
            pool.lenderCount++;
        }

        pool.contributionsCipher[msg.sender] = TFHE.add(pool.contributionsCipher[msg.sender], contribution);
        pool.totalPooledCipher = TFHE.add(pool.totalPooledCipher, contribution);

        // Update lender profile
        LenderProfile storage lenderProfile = lenders[msg.sender];
        if (lenderProfile.firstFundedAt == 0) {
            lenderProfile.lender = msg.sender;
            lenderProfile.firstFundedAt = block.timestamp;
            lenderProfile.totalFundedCipher = TFHE.asEuint64(0);
            lenderProfile.totalInterestEarnedCipher = TFHE.asEuint64(0);
            lenderProfile.currentExposureCipher = TFHE.asEuint64(0);
            lenderProfile.activeLoanCountCipher = TFHE.asEuint32(0);
            lenderProfile.completedLoanCountCipher = TFHE.asEuint32(0);
            lenderProfile.avgReturnRateCipher = TFHE.asEuint16(0);

            TFHE.allowThis(lenderProfile.totalFundedCipher);
            TFHE.allowThis(lenderProfile.totalInterestEarnedCipher);
            TFHE.allowThis(lenderProfile.currentExposureCipher);
            TFHE.allowThis(lenderProfile.activeLoanCountCipher);
            TFHE.allowThis(lenderProfile.completedLoanCountCipher);
            TFHE.allowThis(lenderProfile.avgReturnRateCipher);
        }

        lenderProfile.totalFundedCipher = TFHE.add(lenderProfile.totalFundedCipher, contribution);
        lenderProfile.currentExposureCipher = TFHE.add(lenderProfile.currentExposureCipher, contribution);
        lenderProfile.fundedLoanIds.push(loanId);
        lenderProfile.lastFundedAt = block.timestamp;
        lenderProfile.fundedCount++;

        // Check if fully funded
        ebool fullyFunded = TFHE.ge(pool.totalPooledCipher, eval.approvedAmountCipher);
        if (Gateway.toUint256(fullyFunded) == 1) {
            pool.isFunded = true;
            pool.totalPooledDecrypted = eval.decryptedApprovedAmount;
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
        uint32 termDays = eval.decryptedCreditScore > 0 ?
            uint32(Gateway.toUint256(eval.approvedTermCipher)) : 180;
        uint32 installmentCount = (termDays + 29) / 30; // Round up to months

        schedule.installmentCountCipher = TFHE.asEuint32(installmentCount);
        schedule.installmentAmountCipher = TFHE.div(eval.totalRepaymentCipher, uint64(installmentCount));
        schedule.totalPaidCipher = TFHE.asEuint64(0);
        schedule.installmentsPaidCipher = TFHE.asEuint32(0);
        schedule.missedPaymentsCipher = TFHE.asEuint32(0);
        schedule.remainingBalanceCipher = eval.totalRepaymentCipher;
        schedule.nextPaymentDue = block.timestamp + 30 days;

        TFHE.allowThis(schedule.installmentCountCipher);
        TFHE.allowThis(schedule.installmentAmountCipher);
        TFHE.allowThis(schedule.totalPaidCipher);
        TFHE.allowThis(schedule.installmentsPaidCipher);
        TFHE.allowThis(schedule.missedPaymentsCipher);
        TFHE.allowThis(schedule.remainingBalanceCipher);

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.activeLoansCipher = TFHE.add(profile.activeLoansCipher, TFHE.asEuint32(1));
        profile.totalBorrowedCipher = TFHE.add(profile.totalBorrowedCipher, eval.approvedAmountCipher);
        profile.outstandingBalanceCipher = TFHE.add(profile.outstandingBalanceCipher, eval.totalRepaymentCipher);

        // Update aggregate statistics
        totalLoansIssued++;
        totalVolumeProcessedCipher = TFHE.add(totalVolumeProcessedCipher, TFHE.asEuint128(eval.approvedAmountCipher));
        totalActiveBalanceCipher = TFHE.add(totalActiveBalanceCipher, eval.totalRepaymentCipher);

        // Update lender profiles
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.activeLoanCountCipher = TFHE.add(lenderProfile.activeLoanCountCipher, TFHE.asEuint32(1));
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
        bytes calldata encryptedAmount,
        bytes calldata proof
    ) external {
        LoanApplication storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not borrower");
        require(loan.status == LoanStatus.Active || loan.status == LoanStatus.Repaying, "Invalid status");

        RepaymentSchedule storage schedule = schedules[loanId];
        require(!schedule.isDefaulted, "Loan defaulted");

        euint64 paymentAmount = TFHE.asEuint64(abi.decode(encryptedAmount, (uint256)));
        TFHE.allowThis(paymentAmount);

        // Update schedule
        schedule.totalPaidCipher = TFHE.add(schedule.totalPaidCipher, paymentAmount);
        schedule.installmentsPaidCipher = TFHE.add(schedule.installmentsPaidCipher, TFHE.asEuint32(1));

        ebool canSubtract = TFHE.ge(schedule.remainingBalanceCipher, paymentAmount);
        schedule.remainingBalanceCipher = TFHE.select(
            canSubtract,
            TFHE.sub(schedule.remainingBalanceCipher, paymentAmount),
            TFHE.asEuint64(0)
        );

        // Calculate principal and interest portions
        CreditEvaluation storage eval = evaluations[loanId];
        euint64 totalInterest = TFHE.sub(eval.totalRepaymentCipher, eval.approvedAmountCipher);
        uint32 totalInstallments = uint32(Gateway.toUint256(schedule.installmentCountCipher));
        euint64 interestPerInstallment = TFHE.div(totalInterest, uint64(totalInstallments));

        ebool isInterestPayment = TFHE.le(paymentAmount, TFHE.mul(interestPerInstallment, uint64(2)));
        euint64 interestPaid = TFHE.select(isInterestPayment, paymentAmount, interestPerInstallment);
        euint64 principalPaid = TFHE.sub(paymentAmount, interestPaid);

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
        pool.totalInterestCipher = TFHE.add(pool.totalInterestCipher, interestPaid);

        // Update borrower profile
        BorrowerProfile storage profile = borrowers[loan.borrower];
        profile.totalRepaidCipher = TFHE.add(profile.totalRepaidCipher, paymentAmount);
        profile.outstandingBalanceCipher = TFHE.sub(profile.outstandingBalanceCipher, paymentAmount);

        // Update aggregate statistics
        totalInterestCollectedCipher = TFHE.add(totalInterestCollectedCipher, TFHE.asEuint128(interestPaid));
        totalActiveBalanceCipher = TFHE.sub(totalActiveBalanceCipher, paymentAmount);

        uint32 currentInstallment = uint32(Gateway.toUint256(schedule.installmentsPaidCipher));
        emit PaymentMade(loanId, msg.sender, currentInstallment, block.timestamp);

        // Check if loan completed
        ebool isComplete = TFHE.eq(schedule.remainingBalanceCipher, TFHE.asEuint64(0));
        if (Gateway.toUint256(isComplete) == 1) {
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
        profile.defaultedLoansCipher = TFHE.add(profile.defaultedLoansCipher, TFHE.asEuint32(1));
        profile.activeLoansCipher = TFHE.sub(profile.activeLoansCipher, TFHE.asEuint32(1));

        // Penalty on reputation
        ebool canDecrease = TFHE.gt(profile.reputationScoreCipher, TFHE.asEuint8(20));
        profile.reputationScoreCipher = TFHE.select(
            canDecrease,
            TFHE.sub(profile.reputationScoreCipher, TFHE.asEuint8(20)),
            TFHE.asEuint8(0)
        );

        // Update lender profiles
        LoanPool storage pool = pools[loanId];
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.activeLoanCountCipher = TFHE.sub(lenderProfile.activeLoanCountCipher, TFHE.asEuint32(1));
            lenderProfile.currentExposureCipher = TFHE.sub(lenderProfile.currentExposureCipher, pool.contributionsCipher[lender]);
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
        profile.completedLoansCipher = TFHE.add(profile.completedLoansCipher, TFHE.asEuint32(1));
        profile.activeLoansCipher = TFHE.sub(profile.activeLoansCipher, TFHE.asEuint32(1));

        // Bonus on reputation
        ebool canIncrease = TFHE.lt(profile.reputationScoreCipher, TFHE.asEuint8(90));
        profile.reputationScoreCipher = TFHE.select(
            canIncrease,
            TFHE.add(profile.reputationScoreCipher, TFHE.asEuint8(10)),
            TFHE.asEuint8(100)
        );

        // Update lender profiles
        LoanPool storage pool = pools[loanId];
        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.completedLoanCountCipher = TFHE.add(lenderProfile.completedLoanCountCipher, TFHE.asEuint32(1));
            lenderProfile.activeLoanCountCipher = TFHE.sub(lenderProfile.activeLoanCountCipher, TFHE.asEuint32(1));
            lenderProfile.currentExposureCipher = TFHE.sub(lenderProfile.currentExposureCipher, pool.contributionsCipher[lender]);
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

        uint64 totalInterest = uint64(Gateway.toUint256(pool.totalInterestCipher));

        for (uint i = 0; i < pool.lenders.length; i++) {
            address lender = pool.lenders[i];

            // Calculate proportional interest
            uint64 contribution = uint64(Gateway.toUint256(pool.contributionsCipher[lender]));
            uint64 lenderInterest = (totalInterest * contribution) / pool.totalPooledDecrypted;

            pool.interestEarned[lender] = lenderInterest;
            pool.decryptedContributions[lender] = contribution;

            // Update lender profile
            LenderProfile storage lenderProfile = lenders[lender];
            lenderProfile.totalInterestEarnedCipher = TFHE.add(
                lenderProfile.totalInterestEarnedCipher,
                TFHE.asEuint64(lenderInterest)
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
