import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting CipheredMicroloanBazaar deployment and update process...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Warning: Low balance, deployment might fail");
  }

  // Deploy CipheredMicroloanBazaar Contract
  const CipheredMicroloanBazaarFactory = await ethers.getContractFactory("CipheredMicroloanBazaar");
  console.log("📦 Deploying CipheredMicroloanBazaar contract (FHE enabled)...");

  const microloanBazaar = await CipheredMicroloanBazaarFactory.deploy();
  await microloanBazaar.waitForDeployment();

  const contractAddress = await microloanBazaar.getAddress();
  console.log("✅ CipheredMicroloanBazaar contract deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("\n📊 === Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for confirmations
  console.log("\n⏳ Waiting for 2 block confirmations...");
  await microloanBazaar.deploymentTransaction()?.wait(2);
  console.log("✅ Deployment confirmed!");

  // Grant roles to deployer for testing
  console.log("\n🔐 Setting up roles for testing...");
  try {
    await microloanBazaar.grantCreditAnalyst(deployer.address);
    await microloanBazaar.grantLoanOfficer(deployer.address);
    await microloanBazaar.grantCollectionAgent(deployer.address);
    console.log("✅ Roles granted to deployer for testing");
  } catch (error) {
    console.warn("⚠️  Warning: Could not grant roles:", error);
  }

  // Save deployment info to file
  const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Update frontend contract address
  const frontendConfigPath = path.join(__dirname, "..", "frontend", "src", "contracts", "CipheredMicroloanBazaar.ts");
  if (fs.existsSync(frontendConfigPath)) {
    let configContent = fs.readFileSync(frontendConfigPath, "utf8");
    
    // Update contract address
    configContent = configContent.replace(
      /11155111: '0x[0-9a-fA-F]{40}'/,
      `11155111: '${contractAddress}'`
    );
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("🔄 Frontend contract address updated");
  }

  // Create environment file for frontend
  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.local");
  const frontendEnvContent = `# Auto-generated from deployment
VITE_CIPHERED_MICROLOAN_BAZAAR_ADDRESS=${contractAddress}
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.drpc.org
`;

  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("📝 Frontend environment file created");

  // Verify contract on Etherscan (if API key is provided)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await microloanBazaar.deploymentTransaction()?.wait(5); // Wait for more confirmations
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.warn("⚠️  Warning: Contract verification failed:", error);
    }
  } else {
    console.log("ℹ️  Skipping Etherscan verification (no API key provided)");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Update your frontend .env.local file with the contract address");
  console.log("2. Test the contract functions");
  console.log("3. Deploy frontend to Vercel");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
