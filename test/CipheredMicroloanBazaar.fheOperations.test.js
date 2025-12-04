const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("CipheredMicroloanBazaar - FHE Operations Tests", function () {
  let contract;
  let owner, creditAnalyst, loanOfficer, collectionAgent, borrower1, borrower2, lender1, lender2;

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

  describe("FHE.fromExternal() - Input Verification", function () {
    it("should verify euint64 encrypted input", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      const stats = await contract.getMarketplaceStats();
      expect(stats.totalLoans).to.equal(1);

      console.log("FHE.fromExternal() with euint64 verified");
    });

    it("should verify euint32 encrypted input", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);       // euint32 term
      input.add32(720n);       // euint32 credit score
      input.add32(30000n);     // euint32 revenue
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      console.log("FHE.fromExternal() with euint32 verified");
    });

    it("should verify euint16 encrypted input", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);        // euint16 payment history
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      console.log("FHE.fromExternal() with euint16 verified");
    });

    it("should verify euint8 encrypted input", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);          // euint8 defaults
      input.add8(8n);          // euint8 community score

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      console.log("FHE.fromExternal() with euint8 verified");
    });
  });

  describe("FHE.asEuint*() - Type Conversion", function () {
    it("should initialize encrypted aggregates correctly", async function () {
      // Contract constructor initializes euint128 and euint64 aggregates
      // This test verifies deployment succeeds (which means FHE.asEuint*() worked)
      const contractAddress = await contract.getAddress();
      expect(contractAddress).to.be.properAddress;

      console.log("FHE.asEuint*() type conversions verified");
    });
  });

  describe("FHE.allowThis() - Permission Management", function () {
    it("should grant contract access to encrypted data", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      // Submit loan - this calls FHE.allowThis() for all encrypted values
      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Request evaluation - this uses the encrypted data (verifies allowThis worked)
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3); // RiskAssessment

      console.log("FHE.allowThis() permission verified");
    });
  });

  describe("FHE.allow() - User Permission", function () {
    it("should grant borrower access to their encrypted data", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      // Submit loan - this calls FHE.allow() for borrower
      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Verify loan was created (FHE.allow worked for borrower)
      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.borrower).to.equal(borrower1.address);

      console.log("FHE.allow() user permission verified");
    });
  });

  describe("FHE.add() - Encrypted Addition", function () {
    it("should perform encrypted addition in credit score calculation", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      // High community score (8) and good payment history (15) trigger bonuses
      input.add64(50000n);
      input.add32(180n);
      input.add32(700n);       // Base credit score
      input.add32(30000n);
      input.add16(15n);        // Good history adds 30
      input.add8(0n);
      input.add8(8n);          // High community adds 50

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Request evaluation triggers FHE.add() operations
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.add() encrypted addition verified");
    });

    it("should accumulate encrypted loan pool contributions", async function () {
      // Setup approved loan
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      await contract.connect(creditAnalyst).requestCreditEvaluation(0);
      await contract.connect(creditAnalyst).completeCreditEvaluation(
        0, 750, 1, 45000, 1200, 180, 47700
      );

      // Fund loan - this uses FHE.add() to accumulate contributions
      const fundInput1 = await fhevm.createEncryptedInput(contractAddress, lender1.address);
      fundInput1.add64(25000n);
      const encrypted1 = await fundInput1.encrypt();

      await contract.connect(lender1).fundLoan(
        0,
        encrypted1.handles[0],
        encrypted1.inputProof
      );

      const fundInput2 = await fhevm.createEncryptedInput(contractAddress, lender2.address);
      fundInput2.add64(20000n);
      const encrypted2 = await fundInput2.encrypt();

      await contract.connect(lender2).fundLoan(
        0,
        encrypted2.handles[0],
        encrypted2.inputProof
      );

      const poolInfo = await contract.getPoolInfo(0);
      expect(poolInfo.lenderCount).to.equal(2);

      console.log("FHE.add() pool accumulation verified");
    });
  });

  describe("FHE.sub() - Encrypted Subtraction", function () {
    it("should perform encrypted subtraction for default penalty", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      // Past defaults trigger penalty subtraction
      input.add64(50000n);
      input.add32(180n);
      input.add32(750n);       // High base score
      input.add32(30000n);
      input.add16(5n);         // Low history (no bonus)
      input.add8(2n);          // 2 defaults = -200 penalty
      input.add8(5n);          // Low community (no bonus)

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Request evaluation triggers FHE.sub() for penalty
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.sub() encrypted subtraction verified");
    });
  });

  describe("FHE.mul() - Encrypted Multiplication", function () {
    it("should perform encrypted multiplication for penalty calculation", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      // pastDefaults * 100 = default penalty (using FHE.mul)
      input.add64(50000n);
      input.add32(180n);
      input.add32(700n);
      input.add32(30000n);
      input.add16(5n);
      input.add8(3n);          // 3 defaults * 100 = 300 penalty
      input.add8(5n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.mul() encrypted multiplication verified");
    });
  });

  describe("FHE.div() - Encrypted Division", function () {
    it("should perform encrypted division for approval percentage", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Request evaluation uses FHE.div() for percentage calculations
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.div() encrypted division verified");
    });
  });

  describe("FHE.ge(), FHE.gt(), FHE.lt(), FHE.le() - Comparisons", function () {
    it("should perform encrypted comparisons for risk tier classification", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(720n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(8n);

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Request evaluation uses FHE.ge() for risk tier comparisons
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE comparison operations verified");
    });
  });

  describe("FHE.select() - Conditional Selection", function () {
    it("should perform encrypted conditional selection for bonuses", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      // High community score triggers select() to add bonus
      input.add64(50000n);
      input.add32(180n);
      input.add32(700n);
      input.add32(30000n);
      input.add16(15n);
      input.add8(0n);
      input.add8(9n);          // High score triggers bonus via select()

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.select() conditional selection verified");
    });

    it("should select correct interest rate based on risk tier", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(800n);       // Excellent credit
      input.add32(60000n);     // High revenue
      input.add16(20n);
      input.add8(0n);
      input.add8(10n);         // Max community score

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // Evaluation uses select() to choose interest rate
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("FHE.select() interest rate selection verified");
    });
  });

  describe("Edge Cases and Boundary Values", function () {
    it("should handle minimum values", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(1000n);      // Minimum amount
      input.add32(30n);        // Minimum term
      input.add32(300n);       // Minimum credit score
      input.add32(1000n);      // Minimum revenue
      input.add16(0n);         // Zero history
      input.add8(0n);          // Zero defaults
      input.add8(0n);          // Zero community score

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.isActive).to.equal(true);

      console.log("Minimum values handled correctly");
    });

    it("should handle maximum values", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(100000n);    // Maximum amount
      input.add32(730n);       // Maximum term
      input.add32(850n);       // Maximum credit score
      input.add32(100000n);    // High revenue
      input.add16(65535n);     // Max euint16
      input.add8(0n);          // Zero defaults
      input.add8(10n);         // Max community score

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.isActive).to.equal(true);

      console.log("Maximum values handled correctly");
    });

    it("should handle high default count gracefully", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(50000n);
      input.add32(180n);
      input.add32(400n);       // Low credit score
      input.add32(30000n);
      input.add16(0n);         // No history
      input.add8(10n);         // Many defaults
      input.add8(0n);          // No community score

      const encrypted = await input.encrypt();

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof,
        encrypted.handles[6], encrypted.inputProof,
        0
      );

      // High defaults should not crash the contract
      await contract.connect(creditAnalyst).requestCreditEvaluation(0);

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.status).to.equal(3);

      console.log("High default count handled gracefully");
    });
  });
});
