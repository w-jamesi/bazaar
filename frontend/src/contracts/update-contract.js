const fs = require('fs');
const path = require('path');

// Read the compiled contract
const contractJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../artifacts/contracts/CipheredMicroloanBazaar.sol/CipheredMicroloanBazaar.json'), 'utf8')
);

// New contract address
const CONTRACT_ADDRESS = '0x212Cc65a5Ae0B5B13b6F5e7c54034312faC8f0B0';

// Generate TypeScript file
const tsContent = `// CipheredMicroloanBazaar Contract Configuration
export const CIPHERED_MICROLOAN_BAZAAR_ADDRESS = {
  // Sepolia Testnet - Deployed contract address
  11155111: '${CONTRACT_ADDRESS}',
} as const;

export const CIPHERED_MICROLOAN_BAZAAR_ABI = ${JSON.stringify(contractJson.abi, null, 2)} as const;
`;

fs.writeFileSync(
  path.join(__dirname, 'CipheredMicroloanBazaar.ts'),
  tsContent
);

console.log('✅ Contract configuration updated successfully!');
console.log('Contract Address:', CONTRACT_ADDRESS);
