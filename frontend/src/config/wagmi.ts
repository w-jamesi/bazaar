import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';

// Define Zama's FHE-enabled Sepolia testnet
export const zamaFheSepoliaTestnet = {
  id: 8009,
  name: 'Zama FHE Sepolia Testnet',
  network: 'zama-fhe-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.zama.ai'],
    },
    public: {
      http: ['https://devnet.zama.ai'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://main.explorer.zama.ai' },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'CipheredMicroloan Bazaar',
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || '2ca57f59c4f7b855c87dc29aa9b68b5f', // Placeholder for demo
  chains: [zamaFheSepoliaTestnet, sepolia, mainnet],
  ssr: false,
});
