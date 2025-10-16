import fs from "fs";
import path from "path";

interface ProjectStatus {
  contracts: {
    compiled: boolean;
    deployed: boolean;
    address?: string;
  };
  frontend: {
    dependenciesInstalled: boolean;
    built: boolean;
    envConfigured: boolean;
  };
  deployment: {
    infoExists: boolean;
    lastDeployed?: string;
  };
  github: {
    repositoryExists: boolean;
    workflowsConfigured: boolean;
  };
}

async function checkProjectStatus(): Promise<ProjectStatus> {
  const status: ProjectStatus = {
    contracts: {
      compiled: false,
      deployed: false,
    },
    frontend: {
      dependenciesInstalled: false,
      built: false,
      envConfigured: false,
    },
    deployment: {
      infoExists: false,
    },
    github: {
      repositoryExists: false,
      workflowsConfigured: false,
    },
  };

  console.log("🔍 Checking CipheredMicroloan-Bazaar project status...\n");

  // Check contracts
  console.log("📋 Smart Contracts:");
  const artifactsPath = path.join(__dirname, "..", "artifacts");
  const contractsPath = path.join(artifactsPath, "contracts", "CipheredMicroloanBazaar.sol");
  status.contracts.compiled = fs.existsSync(contractsPath);
  console.log(`  ✅ Compiled: ${status.contracts.compiled ? "Yes" : "No"}`);

  // Check deployment info
  const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
  status.deployment.infoExists = fs.existsSync(deploymentPath);
  if (status.deployment.infoExists) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    status.contracts.deployed = true;
    status.contracts.address = deploymentInfo.contractAddress;
    status.deployment.lastDeployed = deploymentInfo.timestamp;
    console.log(`  ✅ Deployed: Yes (${deploymentInfo.contractAddress})`);
    console.log(`  📅 Last deployed: ${deploymentInfo.timestamp}`);
  } else {
    console.log("  ❌ Deployed: No");
  }

  // Check frontend
  console.log("\n🌐 Frontend:");
  const frontendNodeModules = path.join(__dirname, "..", "frontend", "node_modules");
  status.frontend.dependenciesInstalled = fs.existsSync(frontendNodeModules);
  console.log(`  ✅ Dependencies installed: ${status.frontend.dependenciesInstalled ? "Yes" : "No"}`);

  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  status.frontend.built = fs.existsSync(frontendDist);
  console.log(`  ✅ Built: ${status.frontend.built ? "Yes" : "No"}`);

  const frontendEnv = path.join(__dirname, "..", "frontend", ".env.local");
  status.frontend.envConfigured = fs.existsSync(frontendEnv);
  console.log(`  ✅ Environment configured: ${status.frontend.envConfigured ? "Yes" : "No"}`);

  // Check GitHub
  console.log("\n🐙 GitHub:");
  const gitPath = path.join(__dirname, "..", ".git");
  status.github.repositoryExists = fs.existsSync(gitPath);
  console.log(`  ✅ Repository initialized: ${status.github.repositoryExists ? "Yes" : "No"}`);

  const workflowsPath = path.join(__dirname, "..", ".github", "workflows", "ci.yml");
  status.github.workflowsConfigured = fs.existsSync(workflowsPath);
  console.log(`  ✅ Workflows configured: ${status.github.workflowsConfigured ? "Yes" : "No"}`);

  return status;
}

function generateRecommendations(status: ProjectStatus): string[] {
  const recommendations: string[] = [];

  if (!status.contracts.compiled) {
    recommendations.push("🔨 Run 'npm run compile' to compile smart contracts");
  }

  if (!status.contracts.deployed) {
    recommendations.push("🚀 Run 'npm run deploy:update' to deploy contracts");
  }

  if (!status.frontend.dependenciesInstalled) {
    recommendations.push("📦 Run 'npm run frontend:install' to install frontend dependencies");
  }

  if (!status.frontend.envConfigured) {
    recommendations.push("⚙️  Configure frontend environment variables in frontend/.env.local");
  }

  if (!status.frontend.built) {
    recommendations.push("🏗️  Run 'npm run frontend:build' to build frontend");
  }

  if (!status.github.repositoryExists) {
    recommendations.push("🐙 Initialize Git repository and connect to GitHub");
  }

  if (!status.github.workflowsConfigured) {
    recommendations.push("🔄 Set up GitHub Actions workflows");
  }

  return recommendations;
}

function printStatusSummary(status: ProjectStatus) {
  console.log("\n📊 Status Summary:");
  console.log("==================");

  const totalChecks = 6;
  let passedChecks = 0;

  if (status.contracts.compiled) passedChecks++;
  if (status.contracts.deployed) passedChecks++;
  if (status.frontend.dependenciesInstalled) passedChecks++;
  if (status.frontend.envConfigured) passedChecks++;
  if (status.frontend.built) passedChecks++;
  if (status.github.repositoryExists) passedChecks++;

  const percentage = Math.round((passedChecks / totalChecks) * 100);
  console.log(`✅ Progress: ${passedChecks}/${totalChecks} (${percentage}%)`);

  if (percentage === 100) {
    console.log("🎉 Project is fully set up and ready for deployment!");
  } else if (percentage >= 80) {
    console.log("🚀 Project is almost ready, just a few more steps!");
  } else if (percentage >= 50) {
    console.log("⚡ Project is partially set up, continue with the recommendations below");
  } else {
    console.log("🔧 Project needs more setup, follow the recommendations below");
  }
}

async function main() {
  try {
    const status = await checkProjectStatus();
    printStatusSummary(status);
    
    const recommendations = generateRecommendations(status);
    
    if (recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      console.log("===================");
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log("\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md");
    
  } catch (error: any) {
    console.error("❌ Error checking project status:", error.message);
    process.exit(1);
  }
}

main();
