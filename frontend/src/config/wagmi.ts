import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'CipheredMicroloan Bazaar',
  projectId: '2ca57f59c4f7b855c87dc29aa9b68b5f',
  chains: [sepolia],
  ssr: false,
});
