const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("CipheredMicroloanBazaar - Basic Functionality Tests", function () {
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

    // Setup roles
    await contract.connect(owner).grantCreditAnalyst(creditAnalyst.address);
    await contract.connect(owner).grantLoanOfficer(loanOfficer.address);
    await contract.connect(owner).grantCollectionAgent(collectionAgent.address);
  });

  describe("Deployment", function () {
    it("should deploy contract successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
      console.log("Contract deployed at:", await contract.getAddress());
    });

    it("should set correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      console.log("Owner set correctly");
    });

    it("should have correct initial marketplace stats", async function () {
      const stats = await contract.getMarketplaceStats();
      expect(stats.totalLoans).to.equal(0);
      expect(stats.issued).to.equal(0);
      expect(stats.completed).to.equal(0);
      expect(stats.defaulted).to.equal(0);
      console.log("Initial marketplace stats correct");
    });

    it("should have correct default policy", async function () {
      const policy = await contract.policy();
      expect(policy.minCreditScore).to.equal(550);
      expect(policy.maxInterestRate).to.equal(3600);
      expect(policy.minInterestRate).to.equal(500);
      expect(policy.maxLoanAmount).to.equal(100_000);
      expect(policy.minLoanAmount).to.equal(1_000);
      expect(policy.maxLoanTerm).to.equal(730);
      expect(policy.minLoanTerm).to.equal(30);
      expect(policy.defaultGracePeriod).to.equal(15);
      expect(policy.latePaymentThreshold).to.equal(3);
      expect(policy.platformFeeBps).to.equal(100);
      console.log("Default policy correct");
    });
  });

  describe("Role Management", function () {
    it("should grant credit analyst role", async function () {
      const newAnalyst = borrower1;
      await contract.connect(owner).grantCreditAnalyst(newAnalyst.address);
      expect(await contract.creditAnalysts(newAnalyst.address)).to.equal(true);
      console.log("Credit analyst role granted");
    });

    it("should revoke credit analyst role", async function () {
      await contract.connect(owner).revokeCreditAnalyst(creditAnalyst.address);
      expect(await contract.creditAnalysts(creditAnalyst.address)).to.equal(false);
      console.log("Credit analyst role revoked");
    });

    it("should grant loan officer role", async function () {
      const newOfficer = borrower1;
      await contract.connect(owner).grantLoanOfficer(newOfficer.address);
      expect(await contract.loanOfficers(newOfficer.address)).to.equal(true);
      console.log("Loan officer role granted");
    });

    it("should revoke loan officer role", async function () {
      await contract.connect(owner).revokeLoanOfficer(loanOfficer.address);
      expect(await contract.loanOfficers(loanOfficer.address)).to.equal(false);
      console.log("Loan officer role revoked");
    });

    it("should grant collection agent role", async function () {
      const newAgent = borrower1;
      await contract.connect(owner).grantCollectionAgent(newAgent.address);
      expect(await contract.collectionAgents(newAgent.address)).to.equal(true);
      console.log("Collection agent role granted");
    });

    it("should revoke collection agent role", async function () {
      await contract.connect(owner).revokeCollectionAgent(collectionAgent.address);
      expect(await contract.collectionAgents(collectionAgent.address)).to.equal(false);
      console.log("Collection agent role revoked");
    });

    it("should reject non-owner role management", async function () {
      await expect(
        contract.connect(borrower1).grantCreditAnalyst(borrower2.address)
      ).to.be.revertedWith("Not owner");
      console.log("Non-owner role management rejected");
    });

    it("should emit RoleGranted event", async function () {
      await expect(contract.connect(owner).grantCreditAnalyst(borrower1.address))
        .to.emit(contract, "RoleGranted")
        .withArgs(borrower1.address, "CreditAnalyst");
      console.log("RoleGranted event emitted");
    });

    it("should emit RoleRevoked event", async function () {
      await expect(contract.connect(owner).revokeCreditAnalyst(creditAnalyst.address))
        .to.emit(contract, "RoleRevoked")
        .withArgs(creditAnalyst.address, "CreditAnalyst");
      console.log("RoleRevoked event emitted");
    });
  });

  describe("Policy Management", function () {
    it("should allow owner to update policy", async function () {
      const newPolicy = {
        minCreditScore: 600,
        maxInterestRate: 4000,
        minInterestRate: 600,
        maxLoanAmount: 150_000,
        minLoanAmount: 2_000,
        maxLoanTerm: 900,
        minLoanTerm: 60,
        defaultGracePeriod: 20,
        latePaymentThreshold: 5,
        platformFeeBps: 150
      };

      await contract.connect(owner).updatePolicy(newPolicy);

      const policy = await contract.policy();
      expect(policy.minCreditScore).to.equal(600);
      expect(policy.maxInterestRate).to.equal(4000);
      expect(policy.maxLoanAmount).to.equal(150_000);
      console.log("Policy updated successfully");
    });

    it("should reject policy update from non-owner", async function () {
      const newPolicy = {
        minCreditScore: 600,
        maxInterestRate: 4000,
        minInterestRate: 600,
        maxLoanAmount: 150_000,
        minLoanAmount: 2_000,
        maxLoanTerm: 900,
        minLoanTerm: 60,
        defaultGracePeriod: 20,
        latePaymentThreshold: 5,
        platformFeeBps: 150
      };

      await expect(
        contract.connect(borrower1).updatePolicy(newPolicy)
      ).to.be.revertedWith("Not owner");
      console.log("Non-owner policy update rejected");
    });

    it("should reject invalid policy values", async function () {
      const invalidPolicy = {
        minCreditScore: 0, // Invalid: should be > 0
        maxInterestRate: 4000,
        minInterestRate: 600,
        maxLoanAmount: 150_000,
        minLoanAmount: 2_000,
        maxLoanTerm: 900,
        minLoanTerm: 60,
        defaultGracePeriod: 20,
        latePaymentThreshold: 5,
        platformFeeBps: 150
      };

      await expect(
        contract.connect(owner).updatePolicy(invalidPolicy)
      ).to.be.revertedWith("Invalid credit score");
      console.log("Invalid policy rejected");
    });
  });
});
