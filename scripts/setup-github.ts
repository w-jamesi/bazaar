import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

async function setupGitHubRepository() {
  const githubToken = process.env.GITHUB_PAT;
  
  if (!githubToken) {
    console.error("❌ GITHUB_PAT environment variable is required");
    process.exit(1);
  }

  const octokit = new Octokit({
    auth: githubToken,
  });

  const repoName = "CipheredMicroloan-Bazaar";
  const owner = "william2332-limf";
  const description = "FHE-enabled microloan marketplace for developing countries";
  const isPrivate = false;

  try {
    console.log("🔍 Checking if repository exists...");
    
    try {
      await octokit.repos.get({ owner, repo: repoName });
      console.log("✅ Repository already exists");
      return;
    } catch (error: any) {
      if (error.status === 404) {
        console.log("📦 Creating new repository...");
      } else {
        throw error;
      }
    }

    // Create repository
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: isPrivate,
      auto_init: false,
      gitignore_template: "Node",
      license_template: "mit",
    });

    console.log("✅ Repository created successfully!");
    console.log(`🔗 Repository URL: ${repo.html_url}`);
    console.log(`📋 Clone URL: ${repo.clone_url}`);

    // Create initial commit
    console.log("📝 Setting up initial commit...");
    
    const readmeContent = `# CipheredMicroloan-Bazaar

A fully homomorphic encryption (FHE) enabled microloan marketplace for developing countries, built on Zama's FHE technology.

## 🚀 Features

- **FHE Encryption**: All sensitive financial data encrypted using homomorphic encryption
- **Multi-lender Pooling**: Multiple lenders can fund a single loan
- **Credit Evaluation**: Automated risk assessment with community scoring
- **Installment Tracking**: Monthly payment schedules with interest calculation
- **Role-based Access**: Owner, CreditAnalyst, LoanOfficer, CollectionAgent

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity 0.8.24 with FHEVM
- **Frontend**: React + TypeScript + Vite
- **Web3**: Wagmi + RainbowKit + Ethers.js
- **FHE**: Zama FHE SDK 0.2.0
- **UI**: shadcn/ui + Tailwind CSS

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Sepolia ETH for gas fees

### Installation

1. **Clone and install dependencies**:
   \`\`\`bash
   git clone ${repo.clone_url}
   cd CipheredMicroloan-Bazaar
   npm run setup
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp env.template .env
   # Add your private key and RPC URL
   \`\`\`

3. **Deploy smart contract**:
   \`\`\`bash
   npm run deploy:update
   \`\`\`

4. **Start frontend**:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔒 Privacy & Security

- **FHE Encryption**: All sensitive financial data encrypted using homomorphic encryption
- **Zero-Knowledge**: Lenders cannot see borrower's personal financial information
- **Smart Contract Security**: Audited contract logic with role-based permissions
- **Decentralized**: No central authority controls the platform

## 🌍 Social Impact

This platform enables:
- **Financial Inclusion**: Access to credit for underserved populations
- **Transparent Lending**: Fair interest rates without hidden fees
- **Privacy Protection**: Borrowers maintain financial privacy
- **Global Reach**: Cross-border microlending without intermediaries

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Zama's FHE technology for a more private and inclusive financial future.**
`;

    // Create README.md
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: "README.md",
      message: "Initial commit: Add README.md",
      content: Buffer.from(readmeContent).toString("base64"),
    });

    console.log("✅ README.md created");

    // Create .gitignore
    const gitignoreContent = fs.readFileSync(path.join(__dirname, "..", ".gitignore"), "utf8");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: ".gitignore",
      message: "Add .gitignore",
      content: Buffer.from(gitignoreContent).toString("base64"),
    });

    console.log("✅ .gitignore created");

    // Create LICENSE
    const licenseContent = `MIT License

Copyright (c) 2024 0rangel-woodrown

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: "LICENSE",
      message: "Add MIT License",
      content: Buffer.from(licenseContent).toString("base64"),
    });

    console.log("✅ LICENSE created");

    console.log("\n🎉 GitHub repository setup completed!");
    console.log("📋 Next steps:");
    console.log("1. Add remote origin: git remote add origin " + repo.clone_url);
    console.log("2. Push your code: git push -u origin main");
    console.log("3. Set up GitHub Actions secrets");
    console.log("4. Deploy to Vercel");

  } catch (error: any) {
    console.error("❌ Error setting up GitHub repository:", error.message);
    process.exit(1);
  }
}

setupGitHubRepository();
