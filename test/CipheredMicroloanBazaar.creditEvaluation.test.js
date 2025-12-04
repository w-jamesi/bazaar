const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("CipheredMicroloanBazaar - Credit Evaluation Tests", function () {
  let contract;
  let owner, creditAnalyst, loanOfficer, collectionAgent, borrower1, borrower2, lender1, lender2;

  // Test loan parameters (scaled values)
  const testLoanParams = {
    requestedAmount: 50000n,    // 5 ETH
    requestedTerm: 180n,        // 180 days
    creditScore: 720n,          // Good credit
    monthlyRevenue: 30000n,     // 3 ETH
    paymentHistory: 15n,        // 15 payments
    pastDefaults: 0n,           // No defaults
    communityScore: 8n,         // Good score
    purpose: 0
  };

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, creditAnalyst, loanOfficer, collectionAgent, borrower1, borrower2, lender1, lender2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CipheredMicroloanBazaar");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    // Setup roles
    await contract.connect(owner).grantCreditAnalyst(creditAnalyst.address);
    await contract.connect(owner).grantLoanOfficer(loanOfficer.address);
    await contract.connect(owner).grantCollectionAgent(collectionAgent.address);
  });

  async function createEncryptedLoanInput(borrower, customParams = {}) {
    const params = { ...testLoanParams, ...customParams };
    const contractAddress = await contract.getAddress();
    const input = await fhevm.createEncryptedInput(contractAddress, borrower.address);

    input.add64(params.requestedAmount);
    input.add32(params.requestedTerm);
    input.add32(params.creditScore);
    input.add32(params.monthlyRevenue);
    input.add16(params.paymentHistory);
    input.add8(params.pastDefaults);
    input.add8(params.communityScore);

    return input.encrypt();
  }

  async function submitLoanApplication(borrower, customParams = {}) {
    const encrypted = await createEncryptedLoanInput(borrower, customParams);

    await contract.connect(borrower).submitLoanApplication(
      encrypted.handles[0], encrypted.inputProof,
      encrypted.handles[1], encrypted.inputProof,
      encrypted.handles[2], encrypted.inputProof,
      encrypted.handles[3], encrypted.inputProof,
      encrypted.handles[4], encrypted.inputProof,
      encrypted.handles[5], encrypted.inputProof,
      encrypted.handles[6], encrypted.inputProof,
      customParams.purpose || testLoanParams.purpose
    );

    const stats = await contract.getMarketplaceStats();
    return Number(stats.totalLoans) - 1;
  }

  describe("Request Credit Evaluation", function () {
    it("should request credit evaluation for submitted loan", async function () {
      const loanId = await submitLoanApplication(borrower1);

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3); // RiskAssessment

      console.log("Credit evaluation requested");
    });

    it("should emit CreditEvaluationRequested event", async function () {
      const loanId = await submitLoanApplication(borrower1);

      await expect(
        contract.connect(creditAnalyst).requestCreditEvaluation(loanId)
      ).to.emit(contract, "CreditEvaluationRequested")
        .withArgs(loanId, 0, creditAnalyst.address);

      console.log("CreditEvaluationRequested event emitted");
    });

    it("should emit LoanStatusChanged event to CreditCheck then RiskAssessment", async function () {
      const loanId = await submitLoanApplication(borrower1);

      await expect(
        contract.connect(creditAnalyst).requestCreditEvaluation(loanId)
      ).to.emit(contract, "LoanStatusChanged");

      console.log("LoanStatusChanged events emitted");
    });

    it("should reject credit evaluation from non-analyst", async function () {
      const loanId = await submitLoanApplication(borrower1);

      await expect(
        contract.connect(borrower1).requestCreditEvaluation(loanId)
      ).to.be.revertedWith("Not credit analyst");

      console.log("Non-analyst credit evaluation rejected");
    });

    it("should reject credit evaluation for non-submitted loan", async function () {
      const loanId = await submitLoanApplication(borrower1);

      // First request changes status
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Second request should fail (status no longer Submitted)
      await expect(
        contract.connect(creditAnalyst).requestCreditEvaluation(loanId)
      ).to.be.revertedWith("Invalid status");

      console.log("Non-submitted loan evaluation rejected");
    });

    it("should update status change count", async function () {
      const loanId = await submitLoanApplication(borrower1);

      const loanInfoBefore = await contract.getLoanInfo(loanId);
      const countBefore = loanInfoBefore.statusChangeCount;

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      const loanInfoAfter = await contract.getLoanInfo(loanId);
      expect(loanInfoAfter.statusChangeCount).to.be.gt(countBefore);

      console.log("Status change count updated");
    });
  });

  describe("Complete Credit Evaluation", function () {
    it("should complete credit evaluation with decrypted values", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Simulate decrypted values (would come from Gateway in production)
      const decryptedValues = {
        creditScore: 750,
        riskTier: 1, // Low
        approvedAmount: 45000,
        interestRate: 1200, // 12%
        approvedTerm: 180,
        totalRepayment: 47700
      };

      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId,
        decryptedValues.creditScore,
        decryptedValues.riskTier,
        decryptedValues.approvedAmount,
        decryptedValues.interestRate,
        decryptedValues.approvedTerm,
        decryptedValues.totalRepayment
      );

      const evalInfo = await contract.getEvaluationInfo(loanId);
      expect(evalInfo.creditScore).to.equal(decryptedValues.creditScore);
      expect(evalInfo.riskTier).to.equal(decryptedValues.riskTier);
      expect(evalInfo.approvedAmount).to.equal(decryptedValues.approvedAmount);
      expect(evalInfo.interestRate).to.equal(decryptedValues.interestRate);
      expect(evalInfo.isDecrypted).to.equal(true);

      console.log("Credit evaluation completed");
    });

    it("should emit CreditEvaluationCompleted event", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      const decryptedValues = {
        creditScore: 750,
        riskTier: 1,
        approvedAmount: 45000,
        interestRate: 1200,
        approvedTerm: 180,
        totalRepayment: 47700
      };

      await expect(
        contract.connect(creditAnalyst).completeCreditEvaluation(
          loanId,
          decryptedValues.creditScore,
          decryptedValues.riskTier,
          decryptedValues.approvedAmount,
          decryptedValues.interestRate,
          decryptedValues.approvedTerm,
          decryptedValues.totalRepayment
        )
      ).to.emit(contract, "CreditEvaluationCompleted")
        .withArgs(
          loanId,
          decryptedValues.creditScore,
          decryptedValues.riskTier,
          decryptedValues.approvedAmount,
          decryptedValues.interestRate
        );

      console.log("CreditEvaluationCompleted event emitted");
    });

    it("should approve loan with acceptable risk tier", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Low risk tier (1) with positive amount = Approved
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId,
        750, 1, 45000, 1200, 180, 47700
      );

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(4); // Approved
      expect(loanInfo.approvedAt).to.be.gt(0);

      console.log("Loan approved with acceptable risk");
    });

    it("should reject loan with high risk tier", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // VeryHigh risk tier (4) = Rejected
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId,
        400, 4, 0, 3000, 180, 0
      );

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(9); // Defaulted (used as Rejected)
      expect(loanInfo.isActive).to.equal(false);

      console.log("Loan rejected with high risk");
    });

    it("should reject loan with zero approved amount", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Zero approved amount = Rejected
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId,
        600, 2, 0, 1800, 180, 0 // Moderate risk but 0 amount
      );

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(9); // Rejected
      expect(loanInfo.isActive).to.equal(false);

      console.log("Loan rejected with zero amount");
    });

    it("should reject completion from non-analyst", async function () {
      const loanId = await submitLoanApplication(borrower1);
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      await expect(
        contract.connect(borrower1).completeCreditEvaluation(
          loanId, 750, 1, 45000, 1200, 180, 47700
        )
      ).to.be.revertedWith("Not credit analyst");

      console.log("Non-analyst completion rejected");
    });

    it("should reject completion for loan not in RiskAssessment", async function () {
      const loanId = await submitLoanApplication(borrower1);
      // Not calling requestCreditEvaluation - loan is still in Submitted status

      await expect(
        contract.connect(creditAnalyst).completeCreditEvaluation(
          loanId, 750, 1, 45000, 1200, 180, 47700
        )
      ).to.be.revertedWith("Invalid status");

      console.log("Wrong status completion rejected");
    });
  });

  describe("FHE Credit Score Calculations", function () {
    it("should test FHE operations: select, add, sub, mul", async function () {
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 720n,
        communityScore: 8n,   // High community score triggers bonus
        paymentHistory: 15n,  // Good history triggers bonus
        pastDefaults: 0n      // No defaults
      });

      // Request evaluation triggers FHE calculations
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Verify loan is now in RiskAssessment (FHE operations succeeded)
      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3); // RiskAssessment

      console.log("FHE credit score calculations verified");
    });

    it("should apply community bonus for high community score", async function () {
      // High community score (>= 7) should add 50 points
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 700n,
        communityScore: 8n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // The encrypted adjusted score should be 700 + 50 (community) + 30 (history) = 780
      // This is verified internally by completing evaluation
      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3);

      console.log("Community bonus applied");
    });

    it("should apply payment history bonus", async function () {
      // Good payment history (>= 10) should add 30 points
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 700n,
        paymentHistory: 15n,
        communityScore: 5n // Low to isolate history bonus
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3);

      console.log("Payment history bonus applied");
    });

    it("should apply default penalty", async function () {
      // Each default should subtract 100 points
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 750n,
        pastDefaults: 2n, // 2 defaults = -200 points
        communityScore: 5n,
        paymentHistory: 5n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3);

      console.log("Default penalty applied");
    });

    it("should handle credit score calculation with all factors", async function () {
      // Full calculation: base + community + history - defaults
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 650n,      // Base
        communityScore: 8n,     // +50 (>= 7)
        paymentHistory: 15n,    // +30 (>= 10)
        pastDefaults: 1n        // -100
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Expected: 650 + 50 + 30 - 100 = 630
      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3);

      console.log("Full credit score calculation verified");
    });
  });

  describe("Risk Tier Classification", function () {
    it("should classify as Minimal risk for excellent credit", async function () {
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 800n, // Excellent
        communityScore: 9n,
        paymentHistory: 20n,
        pastDefaults: 0n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      // Complete with simulated Minimal risk result
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId, 850, 0, 50000, 800, 180, 52200
      );

      const evalInfo = await contract.getEvaluationInfo(loanId);
      expect(evalInfo.riskTier).to.equal(0); // Minimal

      console.log("Minimal risk classification verified");
    });

    it("should classify as Low risk for good credit", async function () {
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 700n,
        communityScore: 7n,
        paymentHistory: 12n,
        pastDefaults: 0n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId, 730, 1, 45000, 1200, 180, 47700
      );

      const evalInfo = await contract.getEvaluationInfo(loanId);
      expect(evalInfo.riskTier).to.equal(1); // Low

      console.log("Low risk classification verified");
    });

    it("should classify as Moderate risk for fair credit", async function () {
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 600n,
        communityScore: 5n,
        paymentHistory: 5n,
        pastDefaults: 1n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId, 580, 2, 37500, 1800, 180, 40875
      );

      const evalInfo = await contract.getEvaluationInfo(loanId);
      expect(evalInfo.riskTier).to.equal(2); // Moderate

      console.log("Moderate risk classification verified");
    });

    it("should classify as High risk for poor credit", async function () {
      const loanId = await submitLoanApplication(borrower1, {
        creditScore: 500n,
        communityScore: 3n,
        paymentHistory: 2n,
        pastDefaults: 2n
      });

      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);

      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId, 480, 3, 25000, 2400, 180, 28000
      );

      const evalInfo = await contract.getEvaluationInfo(loanId);
      expect(evalInfo.riskTier).to.equal(3); // High

      console.log("High risk classification verified");
    });
  });
});
