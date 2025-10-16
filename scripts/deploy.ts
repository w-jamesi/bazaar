import { ethers } from "hardhat";

async function main() {
  console.log("Starting CipheredMicroloanBazaar contract deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy CipheredMicroloanBazaar Contract
  const CipheredMicroloanBazaarFactory = await ethers.getContractFactory("CipheredMicroloanBazaar");
  console.log("Deploying CipheredMicroloanBazaar contract (FHE enabled)...");

  const microloanBazaar = await CipheredMicroloanBazaarFactory.deploy();
  await microloanBazaar.waitForDeployment();

  const contractAddress = await microloanBazaar.getAddress();
  console.log("CipheredMicroloanBazaar contract deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for a few block confirmations
  console.log("\nWaiting for 2 block confirmations...");
  await microloanBazaar.deploymentTransaction()?.wait(2);
  console.log("Deployment confirmed!");

  // Grant roles to deployer for testing
  console.log("\nSetting up roles for testing...");
  await microloanBazaar.grantCreditAnalyst(deployer.address);
  await microloanBazaar.grantLoanOfficer(deployer.address);
  await microloanBazaar.grantCollectionAgent(deployer.address);
  console.log("Roles granted to deployer for testing");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
