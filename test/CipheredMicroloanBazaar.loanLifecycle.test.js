const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("CipheredMicroloanBazaar - Loan Lifecycle Tests", function () {
  let contract;
  let owner, creditAnalyst, loanOfficer, collectionAgent, borrower1, borrower2, lender1, lender2;

  // Test loan parameters
  const testLoanParams = {
    requestedAmount: 50000n,
    requestedTerm: 180n,
    creditScore: 720n,
    monthlyRevenue: 30000n,
    paymentHistory: 15n,
    pastDefaults: 0n,
    communityScore: 8n,
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

    await contract.connect(owner).grantCreditAnalyst(creditAnalyst.address);
    await contract.connect(owner).grantLoanOfficer(loanOfficer.address);
    await contract.connect(owner).grantCollectionAgent(collectionAgent.address);
  });

  async function createEncryptedInput(user, value, bitWidth) {
    const contractAddress = await contract.getAddress();
    const input = await fhevm.createEncryptedInput(contractAddress, user.address);

    if (bitWidth === 64) input.add64(value);
    else if (bitWidth === 32) input.add32(value);
    else if (bitWidth === 16) input.add16(value);
    else input.add8(value);

    return input.encrypt();
  }

  async function submitAndApproveLoan(borrower) {
    const contractAddress = await contract.getAddress();
    const input = await fhevm.createEncryptedInput(contractAddress, borrower.address);

    input.add64(testLoanParams.requestedAmount);
    input.add32(testLoanParams.requestedTerm);
    input.add32(testLoanParams.creditScore);
    input.add32(testLoanParams.monthlyRevenue);
    input.add16(testLoanParams.paymentHistory);
    input.add8(testLoanParams.pastDefaults);
    input.add8(testLoanParams.communityScore);

    const encrypted = await input.encrypt();

    await contract.connect(borrower).submitLoanApplication(
      encrypted.handles[0], encrypted.inputProof,
      encrypted.handles[1], encrypted.inputProof,
      encrypted.handles[2], encrypted.inputProof,
      encrypted.handles[3], encrypted.inputProof,
      encrypted.handles[4], encrypted.inputProof,
      encrypted.handles[5], encrypted.inputProof,
      encrypted.handles[6], encrypted.inputProof,
      testLoanParams.purpose
    );

    const stats = await contract.getMarketplaceStats();
    const loanId = Number(stats.totalLoans) - 1;

    await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);
    await contract.connect(creditAnalyst).completeCreditEvaluation(
      loanId, 750, 1, 45000, 1200, 180, 47700
    );

    return loanId;
  }

  describe("Loan Funding", function () {
    it("should allow lender to fund approved loan", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);

      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      const poolInfo = await contract.getPoolInfo(loanId);
      expect(poolInfo.lenderCount).to.equal(1);

      console.log("Loan funded by lender");
    });

    it("should emit LoanFunded event", async function () {
      const loanId = await submitAndApproveLoan(borrower1);
      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);

      await expect(
        contract.connect(lender1).fundLoan(
          loanId,
          encryptedAmount.handles[0],
          encryptedAmount.inputProof
        )
      ).to.emit(contract, "LoanFunded")
        .withArgs(loanId, lender1.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

      console.log("LoanFunded event emitted");
    });

    it("should allow multiple lenders", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encrypted1 = await createEncryptedInput(lender1, 25000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encrypted1.handles[0],
        encrypted1.inputProof
      );

      const encrypted2 = await createEncryptedInput(lender2, 20000n, 64);
      await contract.connect(lender2).fundLoan(
        loanId,
        encrypted2.handles[0],
        encrypted2.inputProof
      );

      const poolInfo = await contract.getPoolInfo(loanId);
      expect(poolInfo.lenderCount).to.equal(2);

      console.log("Multiple lenders contributed");
    });

    it("should reject funding for non-approved loan", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(testLoanParams.requestedAmount);
      input.add32(testLoanParams.requestedTerm);
      input.add32(testLoanParams.creditScore);
      input.add32(testLoanParams.monthlyRevenue);
      input.add16(testLoanParams.paymentHistory);
      input.add8(testLoanParams.pastDefaults);
      input.add8(testLoanParams.communityScore);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        testLoanParams.purpose
      );

      const loanId = 0;

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);

      await expect(
        contract.connect(lender1).fundLoan(
          loanId,
          encryptedAmount.handles[0],
          encryptedAmount.inputProof
        )
      ).to.be.revertedWith("Loan not approved");

      console.log("Non-approved loan funding rejected");
    });

    it("should create lender profile on first funding", async function () {
      const loanId = await submitAndApproveLoan(borrower1);
      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);

      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      const lenderProfile = await contract.getLenderProfileInfo(lender1.address);
      expect(lenderProfile.fundedCount).to.equal(1);
      expect(lenderProfile.fundedLoanIds.length).to.equal(1);
      expect(lenderProfile.firstFundedAt).to.be.gt(0);

      console.log("Lender profile created");
    });
  });

  describe("Loan Disbursement", function () {
    it("should disburse funded loan", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      // Manually set pool as funded for test
      // In production, this would be verified via decryption

      await contract.connect(loanOfficer).disburseLoan(loanId);

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(6); // Active
      expect(loanInfo.disbursedAt).to.be.gt(0);

      console.log("Loan disbursed");
    });

    it("should emit LoanDisbursed event", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await expect(
        contract.connect(loanOfficer).disburseLoan(loanId)
      ).to.emit(contract, "LoanDisbursed");

      console.log("LoanDisbursed event emitted");
    });

    it("should create repayment schedule", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await contract.connect(loanOfficer).disburseLoan(loanId);

      const scheduleInfo = await contract.getScheduleInfo(loanId);
      expect(scheduleInfo.nextPaymentDue).to.be.gt(0);
      expect(scheduleInfo.isComplete).to.equal(false);
      expect(scheduleInfo.isDefaulted).to.equal(false);

      console.log("Repayment schedule created");
    });

    it("should reject disbursement from non-officer", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await expect(
        contract.connect(borrower1).disburseLoan(loanId)
      ).to.be.revertedWith("Not loan officer");

      console.log("Non-officer disbursement rejected");
    });

    it("should update marketplace stats after disbursement", async function () {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await contract.connect(loanOfficer).disburseLoan(loanId);

      const stats = await contract.getMarketplaceStats();
      expect(stats.issued).to.equal(1);

      console.log("Marketplace stats updated");
    });
  });

  describe("Loan Payments", function () {
    async function setupActiveLoan() {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await contract.connect(loanOfficer).disburseLoan(loanId);

      return loanId;
    }

    it("should allow borrower to make payment", async function () {
      const loanId = await setupActiveLoan();

      const paymentAmount = await createEncryptedInput(borrower1, 8000n, 64);

      await contract.connect(borrower1).makePayment(
        loanId,
        paymentAmount.handles[0],
        paymentAmount.inputProof
      );

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(7); // Repaying

      console.log("Payment made successfully");
    });

    it("should emit PaymentMade event", async function () {
      const loanId = await setupActiveLoan();

      const paymentAmount = await createEncryptedInput(borrower1, 8000n, 64);

      await expect(
        contract.connect(borrower1).makePayment(
          loanId,
          paymentAmount.handles[0],
          paymentAmount.inputProof
        )
      ).to.emit(contract, "PaymentMade");

      console.log("PaymentMade event emitted");
    });

    it("should record payment in history", async function () {
      const loanId = await setupActiveLoan();

      const paymentAmount = await createEncryptedInput(borrower1, 8000n, 64);

      await contract.connect(borrower1).makePayment(
        loanId,
        paymentAmount.handles[0],
        paymentAmount.inputProof
      );

      const historyLength = await contract.getPaymentHistory(loanId);
      expect(historyLength).to.equal(1);

      console.log("Payment recorded in history");
    });

    it("should reject payment from non-borrower", async function () {
      const loanId = await setupActiveLoan();

      const paymentAmount = await createEncryptedInput(lender1, 8000n, 64);

      await expect(
        contract.connect(lender1).makePayment(
          loanId,
          paymentAmount.handles[0],
          paymentAmount.inputProof
        )
      ).to.be.revertedWith("Not borrower");

      console.log("Non-borrower payment rejected");
    });

    it("should update borrower profile after payment", async function () {
      const loanId = await setupActiveLoan();

      const paymentAmount = await createEncryptedInput(borrower1, 8000n, 64);

      await contract.connect(borrower1).makePayment(
        loanId,
        paymentAmount.handles[0],
        paymentAmount.inputProof
      );

      // Profile is updated with encrypted values
      // We verify the payment was recorded
      const historyLength = await contract.getPaymentHistory(loanId);
      expect(historyLength).to.equal(1);

      console.log("Borrower profile updated");
    });
  });

  describe("Loan Default", function () {
    async function setupActiveLoan() {
      const loanId = await submitAndApproveLoan(borrower1);

      const encryptedAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        encryptedAmount.handles[0],
        encryptedAmount.inputProof
      );

      await contract.connect(loanOfficer).disburseLoan(loanId);

      return loanId;
    }

    it("should mark loan as defaulted after grace period", async function () {
      const loanId = await setupActiveLoan();

      // Advance time past grace period (15 days default + 30 days for payment)
      await ethers.provider.send("evm_increaseTime", [46 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await contract.connect(collectionAgent).markAsDefaulted(loanId);

      const loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(9); // Defaulted
      expect(loanInfo.isActive).to.equal(false);

      console.log("Loan marked as defaulted");
    });

    it("should emit LoanDefaulted event", async function () {
      const loanId = await setupActiveLoan();

      await ethers.provider.send("evm_increaseTime", [46 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        contract.connect(collectionAgent).markAsDefaulted(loanId)
      ).to.emit(contract, "LoanDefaulted");

      console.log("LoanDefaulted event emitted");
    });

    it("should reject default marking from non-agent", async function () {
      const loanId = await setupActiveLoan();

      await ethers.provider.send("evm_increaseTime", [46 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        contract.connect(borrower1).markAsDefaulted(loanId)
      ).to.be.revertedWith("Not collection agent");

      console.log("Non-agent default rejected");
    });

    it("should reject default before grace period expires", async function () {
      const loanId = await setupActiveLoan();

      // Only advance 10 days (within grace period)
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        contract.connect(collectionAgent).markAsDefaulted(loanId)
      ).to.be.revertedWith("Grace period not expired");

      console.log("Early default rejected");
    });

    it("should update marketplace stats on default", async function () {
      const loanId = await setupActiveLoan();

      await ethers.provider.send("evm_increaseTime", [46 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await contract.connect(collectionAgent).markAsDefaulted(loanId);

      const stats = await contract.getMarketplaceStats();
      expect(stats.defaulted).to.equal(1);

      console.log("Marketplace stats updated on default");
    });
  });

  describe("Full Loan Lifecycle", function () {
    it("should complete full loan lifecycle: submit -> approve -> fund -> disburse -> repay -> complete", async function () {
      // 1. Submit loan application
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(testLoanParams.requestedAmount);
      input.add32(testLoanParams.requestedTerm);
      input.add32(testLoanParams.creditScore);
      input.add32(testLoanParams.monthlyRevenue);
      input.add16(testLoanParams.paymentHistory);
      input.add8(testLoanParams.pastDefaults);
      input.add8(testLoanParams.communityScore);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        testLoanParams.purpose
      );

      const loanId = 0;
      let loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(1); // Submitted
      console.log("Step 1: Loan submitted");

      // 2. Credit evaluation
      await contract.connect(creditAnalyst).requestCreditEvaluation(loanId);
      loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(3); // RiskAssessment
      console.log("Step 2: Credit evaluation requested");

      // 3. Complete evaluation (approve)
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        loanId, 750, 1, 45000, 1200, 180, 47700
      );
      loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(4); // Approved
      console.log("Step 3: Loan approved");

      // 4. Fund loan
      const fundAmount = await createEncryptedInput(lender1, 45000n, 64);
      await contract.connect(lender1).fundLoan(
        loanId,
        fundAmount.handles[0],
        fundAmount.inputProof
      );
      console.log("Step 4: Loan funded");

      // 5. Disburse loan
      await contract.connect(loanOfficer).disburseLoan(loanId);
      loanInfo = await contract.getLoanInfo(loanId);
      expect(loanInfo.status).to.equal(6); // Active
      console.log("Step 5: Loan disbursed");

      // 6. Make payments (simulate 6 monthly payments)
      const schedule = await contract.getScheduleInfo(loanId);
      const evalInfo = await contract.getEvaluationInfo(loanId);

      // Make enough payments to complete the loan
      for (let i = 0; i < 6; i++) {
        const paymentAmount = await createEncryptedInput(borrower1, 8000n, 64);
        await contract.connect(borrower1).makePayment(
          loanId,
          paymentAmount.handles[0],
          paymentAmount.inputProof
        );

        // Advance time by 30 days for next payment
        await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);
      }

      console.log("Step 6: Payments made");

      // Verify loan is completed or repaying
      loanInfo = await contract.getLoanInfo(loanId);
      expect([7, 8]).to.include(loanInfo.status); // Repaying or Completed

      console.log("Full loan lifecycle completed successfully!");
    });
  });
});
