const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2Dcd5C11697674Eaa476BD9B93a746fe63A4E01e";
  
  console.log("🔍 Verifying deployment...\n");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  
  // Check if contract exists
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code === "0x") {
    console.log("❌ No contract found at this address!");
    return;
  }
  
  console.log("✅ Contract code exists");
  console.log("Code size:", code.length / 2 - 1, "bytes\n");
  
  // Get contract instance
  const CipheredMicroloanBazaar = await hre.ethers.getContractFactory("CipheredMicroloanBazaar");
  const contract = CipheredMicroloanBazaar.attach(contractAddress);
  
  // Check basic contract state
  try {
    const loanCount = await contract.loanCount();
    console.log("📊 Contract State:");
    console.log("  - Total Loans:", loanCount.toString());
    
    // Check if we can read policy
    const policy = await contract.policy();
    console.log("  - Min Loan Amount:", policy.minLoanAmount.toString());
    console.log("  - Max Loan Amount:", policy.maxLoanAmount.toString());
    console.log("  - Max Interest Rate:", policy.maxInterestRate.toString());
    
    console.log("\n✅ Contract is properly deployed and functional!");
    console.log("\n🎯 Ready for FHE encrypted transactions!");
    
  } catch (error) {
    console.log("⚠️  Could not read contract state:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
