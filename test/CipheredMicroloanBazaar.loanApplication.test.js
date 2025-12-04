const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("CipheredMicroloanBazaar - Loan Application Tests", function () {
  let contract;
  let owner, creditAnalyst, loanOfficer, collectionAgent, borrower1, borrower2, lender1, lender2;

  // Test loan parameters (scaled values: 1 ETH = 10,000 units)
  const testLoanParams = {
    requestedAmount: 50000n,    // 5 ETH (5 * 10,000)
    requestedTerm: 180n,        // 180 days (6 months)
    creditScore: 720n,          // Good credit score
    monthlyRevenue: 30000n,     // 3 ETH monthly revenue
    paymentHistory: 15n,        // 15 successful payments
    pastDefaults: 0n,           // No defaults
    communityScore: 8n,         // Good community score
    purpose: 0                  // WorkingCapital
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

  async function createEncryptedLoanInput(borrower) {
    const contractAddress = await contract.getAddress();

    const input = await fhevm.createEncryptedInput(contractAddress, borrower.address);

    // Add all encrypted parameters
    input.add64(testLoanParams.requestedAmount);     // euint64
    input.add32(testLoanParams.requestedTerm);       // euint32
    input.add32(testLoanParams.creditScore);         // euint32
    input.add32(testLoanParams.monthlyRevenue);      // euint32
    input.add16(testLoanParams.paymentHistory);      // euint16
    input.add8(testLoanParams.pastDefaults);         // euint8
    input.add8(testLoanParams.communityScore);       // euint8

    return input.encrypt();
  }

  describe("Submit Loan Application", function () {
    it("should submit loan application with encrypted data", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

      const tx = await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,  // amount
        encrypted.handles[1], encrypted.inputProof,  // term
        encrypted.handles[2], encrypted.inputProof,  // credit score
        encrypted.handles[3], encrypted.inputProof,  // revenue
        encrypted.handles[4], encrypted.inputProof,  // payment history
        encrypted.handles[5], encrypted.inputProof,  // defaults
        encrypted.handles[6], encrypted.inputProof,  // community score
        testLoanParams.purpose
      );

      const receipt = await tx.wait();

      // Check loan count increased
      const stats = await contract.getMarketplaceStats();
      expect(stats.totalLoans).to.equal(1);

      // Check loan info
      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.borrower).to.equal(borrower1.address);
      expect(loanInfo.status).to.equal(1); // Submitted
      expect(loanInfo.purpose).to.equal(testLoanParams.purpose);
      expect(loanInfo.isActive).to.equal(true);

      console.log("Loan application submitted successfully");
    });

    it("should emit LoanApplicationSubmitted event", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

      await expect(
        contract.connect(borrower1).submitLoanApplication(
          encrypted.handles[0], encrypted.inputProof,
          encrypted.handles[1], encrypted.inputProof,
          encrypted.handles[2], encrypted.inputProof,
          encrypted.handles[3], encrypted.inputProof,
          encrypted.handles[4], encrypted.inputProof,
          encrypted.handles[5], encrypted.inputProof,
          encrypted.handles[6], encrypted.inputProof,
          testLoanParams.purpose
        )
      ).to.emit(contract, "LoanApplicationSubmitted")
        .withArgs(0, borrower1.address, testLoanParams.purpose, (await ethers.provider.getBlock("latest")).timestamp + 1);

      console.log("LoanApplicationSubmitted event emitted");
    });

    it("should emit LoanStatusChanged event", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

      await expect(
        contract.connect(borrower1).submitLoanApplication(
          encrypted.handles[0], encrypted.inputProof,
          encrypted.handles[1], encrypted.inputProof,
          encrypted.handles[2], encrypted.inputProof,
          encrypted.handles[3], encrypted.inputProof,
          encrypted.handles[4], encrypted.inputProof,
          encrypted.handles[5], encrypted.inputProof,
          encrypted.handles[6], encrypted.inputProof,
          testLoanParams.purpose
        )
      ).to.emit(contract, "LoanStatusChanged");

      console.log("LoanStatusChanged event emitted");
    });

    it("should create borrower profile on first loan", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

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

      const profile = await contract.getBorrowerProfileInfo(borrower1.address);
      expect(profile.borrowerLoanCount).to.equal(1);
      expect(profile.loanIds.length).to.equal(1);
      expect(profile.loanIds[0]).to.equal(0);
      expect(profile.firstLoanAt).to.be.gt(0);
      expect(profile.lastLoanAt).to.be.gt(0);

      console.log("Borrower profile created");
    });

    it("should handle multiple loan applications from same borrower", async function () {
      // First loan
      const encrypted1 = await createEncryptedLoanInput(borrower1);
      await contract.connect(borrower1).submitLoanApplication(
        encrypted1.handles[0], encrypted1.inputProof,
        encrypted1.handles[1], encrypted1.inputProof,
        encrypted1.handles[2], encrypted1.inputProof,
        encrypted1.handles[3], encrypted1.inputProof,
        encrypted1.handles[4], encrypted1.inputProof,
        encrypted1.handles[5], encrypted1.inputProof,
        encrypted1.handles[6], encrypted1.inputProof,
        testLoanParams.purpose
      );

      // Second loan
      const encrypted2 = await createEncryptedLoanInput(borrower1);
      await contract.connect(borrower1).submitLoanApplication(
        encrypted2.handles[0], encrypted2.inputProof,
        encrypted2.handles[1], encrypted2.inputProof,
        encrypted2.handles[2], encrypted2.inputProof,
        encrypted2.handles[3], encrypted2.inputProof,
        encrypted2.handles[4], encrypted2.inputProof,
        encrypted2.handles[5], encrypted2.inputProof,
        encrypted2.handles[6], encrypted2.inputProof,
        1 // Different purpose: Inventory
      );

      const profile = await contract.getBorrowerProfileInfo(borrower1.address);
      expect(profile.borrowerLoanCount).to.equal(2);
      expect(profile.loanIds.length).to.equal(2);

      const stats = await contract.getMarketplaceStats();
      expect(stats.totalLoans).to.equal(2);

      console.log("Multiple loan applications handled");
    });

    it("should handle loan applications from different borrowers", async function () {
      // Borrower 1
      const encrypted1 = await createEncryptedLoanInput(borrower1);
      await contract.connect(borrower1).submitLoanApplication(
        encrypted1.handles[0], encrypted1.inputProof,
        encrypted1.handles[1], encrypted1.inputProof,
        encrypted1.handles[2], encrypted1.inputProof,
        encrypted1.handles[3], encrypted1.inputProof,
        encrypted1.handles[4], encrypted1.inputProof,
        encrypted1.handles[5], encrypted1.inputProof,
        encrypted1.handles[6], encrypted1.inputProof,
        testLoanParams.purpose
      );

      // Borrower 2
      const encrypted2 = await createEncryptedLoanInput(borrower2);
      await contract.connect(borrower2).submitLoanApplication(
        encrypted2.handles[0], encrypted2.inputProof,
        encrypted2.handles[1], encrypted2.inputProof,
        encrypted2.handles[2], encrypted2.inputProof,
        encrypted2.handles[3], encrypted2.inputProof,
        encrypted2.handles[4], encrypted2.inputProof,
        encrypted2.handles[5], encrypted2.inputProof,
        encrypted2.handles[6], encrypted2.inputProof,
        2 // Equipment
      );

      const loan1 = await contract.getLoanInfo(0);
      const loan2 = await contract.getLoanInfo(1);

      expect(loan1.borrower).to.equal(borrower1.address);
      expect(loan2.borrower).to.equal(borrower2.address);

      const stats = await contract.getMarketplaceStats();
      expect(stats.totalLoans).to.equal(2);

      console.log("Different borrower applications handled");
    });

    it("should increment loanCount correctly", async function () {
      const initialStats = await contract.getMarketplaceStats();
      expect(initialStats.totalLoans).to.equal(0);

      for (let i = 0; i < 3; i++) {
        const encrypted = await createEncryptedLoanInput(borrower1);
        await contract.connect(borrower1).submitLoanApplication(
          encrypted.handles[0], encrypted.inputProof,
          encrypted.handles[1], encrypted.inputProof,
          encrypted.handles[2], encrypted.inputProof,
          encrypted.handles[3], encrypted.inputProof,
          encrypted.handles[4], encrypted.inputProof,
          encrypted.handles[5], encrypted.inputProof,
          encrypted.handles[6], encrypted.inputProof,
          i % 5 // Different purposes
        );
      }

      const finalStats = await contract.getMarketplaceStats();
      expect(finalStats.totalLoans).to.equal(3);

      console.log("Loan count incremented correctly");
    });

    it("should support all loan purposes", async function () {
      const purposes = [0, 1, 2, 3, 4]; // WorkingCapital, Inventory, Equipment, Expansion, Emergency

      for (const purpose of purposes) {
        const encrypted = await createEncryptedLoanInput(borrower1);
        await contract.connect(borrower1).submitLoanApplication(
          encrypted.handles[0], encrypted.inputProof,
          encrypted.handles[1], encrypted.inputProof,
          encrypted.handles[2], encrypted.inputProof,
          encrypted.handles[3], encrypted.inputProof,
          encrypted.handles[4], encrypted.inputProof,
          encrypted.handles[5], encrypted.inputProof,
          encrypted.handles[6], encrypted.inputProof,
          purpose
        );

        const loanInfo = await contract.getLoanInfo(purpose);
        expect(loanInfo.purpose).to.equal(purpose);
      }

      console.log("All loan purposes supported");
    });
  });

  describe("FHE Operations in Loan Application", function () {
    it("should verify FHE.fromExternal() for encrypted amount", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

      // This tests that FHE.fromExternal() correctly processes the encrypted amount
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

      // Verify loan was created (FHE.fromExternal worked)
      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.borrower).to.equal(borrower1.address);

      console.log("FHE.fromExternal() verified");
    });

    it("should reject invalid encrypted input proof", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);
      const invalidProof = "0x" + "00".repeat(64);

      await expect(
        contract.connect(borrower1).submitLoanApplication(
          encrypted.handles[0], invalidProof, // Invalid proof
          encrypted.handles[1], encrypted.inputProof,
          encrypted.handles[2], encrypted.inputProof,
          encrypted.handles[3], encrypted.inputProof,
          encrypted.handles[4], encrypted.inputProof,
          encrypted.handles[5], encrypted.inputProof,
          encrypted.handles[6], encrypted.inputProof,
          testLoanParams.purpose
        )
      ).to.be.reverted;

      console.log("Invalid proof rejected");
    });

    it("should handle edge case: zero defaults", async function () {
      const encrypted = await createEncryptedLoanInput(borrower1);

      await contract.connect(borrower1).submitLoanApplication(
        encrypted.handles[0], encrypted.inputProof,
        encrypted.handles[1], encrypted.inputProof,
        encrypted.handles[2], encrypted.inputProof,
        encrypted.handles[3], encrypted.inputProof,
        encrypted.handles[4], encrypted.inputProof,
        encrypted.handles[5], encrypted.inputProof, // 0 defaults
        encrypted.handles[6], encrypted.inputProof,
        testLoanParams.purpose
      );

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.isActive).to.equal(true);

      console.log("Zero defaults handled");
    });

    it("should handle edge case: maximum community score", async function () {
      const contractAddress = await contract.getAddress();
      const input = await fhevm.createEncryptedInput(contractAddress, borrower1.address);

      input.add64(testLoanParams.requestedAmount);
      input.add32(testLoanParams.requestedTerm);
      input.add32(testLoanParams.creditScore);
      input.add32(testLoanParams.monthlyRevenue);
      input.add16(testLoanParams.paymentHistory);
      input.add8(testLoanParams.pastDefaults);
      input.add8(10n); // Max community score

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

      const loanInfo = await contract.getLoanInfo(0);
      expect(loanInfo.isActive).to.equal(true);

      console.log("Maximum community score handled");
    });
  });
});
