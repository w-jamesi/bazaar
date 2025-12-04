import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import {
  CIPHERED_MICROLOAN_BAZAAR_ADDRESS,
  CIPHERED_MICROLOAN_BAZAAR_ABI,
} from '../contracts/CipheredMicroloanBazaar';
import {
  initializeFHE,
  encryptUint64,
  encryptUint32,
  encryptUint16,
  encryptUint8,
  isFheInitialized,
} from '../lib/fhe';

export interface LoanApplicationParams {
  // Amounts are entered in ETH on the UI. We scale them to integers before
  // encryption to satisfy TFHE integer input requirements.
  requestedAmount: number;
  requestedTerm: number;
  creditScore: number;
  monthlyRevenue: number;
  paymentHistory: number;
  pastDefaults: number;
  communityScore: number;
  purpose: number; // 0-4 for LoanPurpose enum
}

export interface LoanInfo {
  borrower: string;
  status: number;
  purpose: number;
  submittedAt: bigint;
  approvedAt: bigint;
  disbursedAt: bigint;
  isActive: boolean;
  statusChangeCount: number;
}

export interface EvaluationInfo {
  creditScore: number;
  riskTier: number;
  approvedAmount: bigint;
  interestRate: number;
  isDecrypted: boolean;
}

export const useMicroloanContract = () => {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isInitialized, setIsInitialized] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize FHEVM and contract
  useEffect(() => {
    const initialize = async () => {
      console.log('[Contract Init] Starting initialization...', {
        hasWalletClient: !!walletClient,
        chain: chain?.id,
        address,
      });

      if (!walletClient || !chain || !address) {
        console.warn('[Contract Init] Missing required dependencies:', {
          walletClient: !!walletClient,
          chain: !!chain,
          address: !!address,
        });
        return;
      }

      try {
        // Get provider from wallet client
        console.log('[Contract Init] Creating provider...');
        const provider = new BrowserProvider(walletClient as any);

        // Initialize FHE (no longer needs provider and chainId)
        console.log('[Contract Init] Initializing FHE...');
        await initializeFHE();
        console.log('[Contract Init] FHE initialized successfully');

        // Get contract address - use chain.id to support network switching
        const contractAddress = CIPHERED_MICROLOAN_BAZAAR_ADDRESS[
          chain.id as keyof typeof CIPHERED_MICROLOAN_BAZAAR_ADDRESS
        ];

        if (!contractAddress) {
          console.error(`[Contract Init] Contract not deployed on chain ${chain.id}`);
          console.error('[Contract Init] Available chains:', Object.keys(CIPHERED_MICROLOAN_BAZAAR_ADDRESS));
          setIsInitialized(false);
          setContract(null);
          return;
        }

        console.log('[Contract Init] Creating contract instance...', { contractAddress });

        // Create contract instance
        const signer = await provider.getSigner();
        const contractInstance = new Contract(
          contractAddress,
          CIPHERED_MICROLOAN_BAZAAR_ABI,
          signer
        );

        setContract(contractInstance);
        setIsInitialized(true);
        console.log('[Contract Init] ✅ Microloan contract initialized successfully');
      } catch (error) {
        console.error('[Contract Init] ❌ Failed to initialize contract:', error);
        setIsInitialized(false);
        setContract(null);
      }
    };

    initialize();
  }, [walletClient, chain, address]);

  /**
   * Submit a loan application with encrypted data
   */
  const submitLoanApplication = useCallback(
    async (params: LoanApplicationParams, onProgress?: (message: string, txHash?: string) => void) => {
      console.log('[Submit Loan] Checking initialization...', {
        hasContract: !!contract,
        isInitialized,
        hasAddress: !!address,
        hasChain: !!chain,
      });

      if (!contract || !isInitialized) {
        throw new Error('Contract not initialized. Please ensure your wallet is connected to Sepolia network.');
      }

      if (!address || !chain) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      setIsLoading(true);
      try {
        onProgress?.('Initializing FHE runtime...');
        console.log('[Submit Loan] Checking FHE initialization...');
        if (!isFheInitialized()) {
          console.error('[Submit Loan] FHE not initialized, attempting to initialize...');
          await initializeFHE();
          if (!isFheInitialized()) {
            throw new Error('FHE initialization failed. Please refresh the page and try again.');
          }
        }

        onProgress?.('Encrypting requested amount...');
        // Scale ETH to 1e4 (0.0001 ETH units) to fit contract policy [1_000..100_000]
        // 0.1 ETH -> 1,000 ; 10 ETH -> 100,000
        const ETH_SCALE = 10_000; // 1e4
        const requestedAmountScaled = Math.round(params.requestedAmount * ETH_SCALE);
        const monthlyRevenueScaled = Math.round(params.monthlyRevenue * ETH_SCALE);

        // Encrypt all parameters using new API (address as second param)
        onProgress?.('Encrypting loan term...');
        const encTerm = await encryptUint32(params.requestedTerm, address as `0x${string}`);

        onProgress?.('Encrypting credit score...');
        const encCredit = await encryptUint32(params.creditScore, address as `0x${string}`);

        onProgress?.('Encrypting monthly revenue...');
        const encRevenue = await encryptUint32(monthlyRevenueScaled, address as `0x${string}`);

        onProgress?.('Encrypting payment history...');
        const encHistory = await encryptUint16(params.paymentHistory, address as `0x${string}`);

        onProgress?.('Encrypting past defaults...');
        const encDefaults = await encryptUint8(params.pastDefaults, address as `0x${string}`);

        onProgress?.('Encrypting community score...');
        const encCommunity = await encryptUint8(params.communityScore, address as `0x${string}`);

        // Encrypt amount last
        const encAmount = await encryptUint64(requestedAmountScaled, address as `0x${string}`);

        // Submit transaction with encrypted data
        onProgress?.('Requesting wallet confirmation...');
        const tx = await contract.submitLoanApplication(
          encAmount.handle,
          encAmount.proof,
          encTerm.handle,
          encTerm.proof,
          encCredit.handle,
          encCredit.proof,
          encRevenue.handle,
          encRevenue.proof,
          encHistory.handle,
          encHistory.proof,
          encDefaults.handle,
          encDefaults.proof,
          encCommunity.handle,
          encCommunity.proof,
          params.purpose
        );

        const txHash = tx.hash;
        onProgress?.('Transaction sent. Waiting for confirmations...', txHash);

        const receipt = await tx.wait();
        console.log('Loan application submitted:', receipt);

        // Extract loanId from events
        const event = receipt.logs.find((log: any) =>
          log.topics[0] === contract.interface.getEvent('LoanApplicationSubmitted')?.topicHash
        );

        const loanId = event ? BigInt(event.topics[1]) : null;

        return { receipt, loanId, txHash };
      } catch (error) {
        console.error('Error submitting loan application:', error);
        throw error;
      } finally {
        onProgress?.('');
        setIsLoading(false);
      }
    },
    [contract, isInitialized, address, chain]
  );

  /**
   * Fund a loan with encrypted amount
   */
  const fundLoan = useCallback(
    async (loanId: number, amount: number, onProgress?: (message: string, txHash?: string) => void) => {
      if (!contract || !isInitialized || !address || !chain) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      try {
        onProgress?.('Initializing FHE...');
        if (!isFheInitialized()) {
          await initializeFHE();
          if (!isFheInitialized()) {
            throw new Error('FHE not initialized');
          }
        }

        onProgress?.('Encrypting funding amount...');
        // Scale ETH -> 1e4 integer
        const ETH_SCALE = 10_000;
        const amountScaled = Math.round(amount * ETH_SCALE);
        const encAmount = await encryptUint64(amountScaled, address as `0x${string}`);

        onProgress?.('Requesting wallet confirmation...');
        const tx = await contract.fundLoan(
          loanId,
          encAmount.handle,
          encAmount.proof
        );

        const txHash = tx.hash;
        onProgress?.('Transaction sent. Waiting for confirmations...', txHash);

        const receipt = await tx.wait();
        console.log('Loan funded:', receipt);

        return { receipt, txHash };
      } catch (error) {
        console.error('Error funding loan:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isInitialized, address, chain]
  );

  /**
   * Make a loan payment with encrypted amount
   */
  const makePayment = useCallback(
    async (loanId: number, amount: number, onProgress?: (message: string, txHash?: string) => void) => {
      if (!contract || !isInitialized || !address || !chain) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      try {
        onProgress?.('Initializing FHE...');
        if (!isFheInitialized()) {
          await initializeFHE();
          if (!isFheInitialized()) {
            throw new Error('FHE not initialized');
          }
        }

        onProgress?.('Encrypting payment amount...');
        // Scale ETH -> 1e4 integer
        const ETH_SCALE = 10_000;
        const amountScaled = Math.round(amount * ETH_SCALE);
        const encAmount = await encryptUint64(amountScaled, address as `0x${string}`);

        onProgress?.('Requesting wallet confirmation...');
        const tx = await contract.makePayment(
          loanId,
          encAmount.handle,
          encAmount.proof
        );

        const txHash = tx.hash;
        onProgress?.('Transaction sent. Waiting for confirmations...', txHash);

        const receipt = await tx.wait();
        console.log('Payment made:', receipt);

        return { receipt, txHash };
      } catch (error) {
        console.error('Error making payment:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isInitialized, address, chain]
  );

  /**
   * Get loan information
   */
  const getLoanInfo = useCallback(
    async (loanId: number): Promise<LoanInfo | null> => {
      if (!contract) return null;

      try {
        const info = await contract.getLoanInfo(loanId);
        return {
          borrower: info[0],
          status: info[1],
          purpose: info[2],
          submittedAt: info[3],
          approvedAt: info[4],
          disbursedAt: info[5],
          isActive: info[6],
          statusChangeCount: info[7],
        };
      } catch (error) {
        console.error('Error getting loan info:', error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Get evaluation information
   */
  const getEvaluationInfo = useCallback(
    async (loanId: number): Promise<EvaluationInfo | null> => {
      if (!contract) return null;

      try {
        const info = await contract.getEvaluationInfo(loanId);
        return {
          creditScore: info[0],
          riskTier: info[1],
          approvedAmount: info[2],
          interestRate: info[3],
          isDecrypted: info[4],
        };
      } catch (error) {
        console.error('Error getting evaluation info:', error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Get borrower profile
   */
  const getBorrowerProfile = useCallback(
    async (borrowerAddress: string) => {
      if (!contract) return null;

      try {
        const profile = await contract.getBorrowerProfileInfo(borrowerAddress);
        return {
          firstLoanAt: profile[0],
          lastLoanAt: profile[1],
          loanCount: profile[2],
          loanIds: profile[3],
        };
      } catch (error) {
        console.error('Error getting borrower profile:', error);
        return null;
      }
    },
    [contract]
  );

  /**
   * Get marketplace statistics
   */
  const getMarketplaceStats = useCallback(async () => {
    if (!contract) return null;

    try {
      const stats = await contract.getMarketplaceStats();
      return {
        totalLoans: stats[0],
        issued: stats[1],
        completed: stats[2],
        defaulted: stats[3],
      };
    } catch (error) {
      console.error('Error getting marketplace stats:', error);
      return null;
    }
  }, [contract]);

  return {
    contract,
    isInitialized,
    isLoading,
    submitLoanApplication,
    fundLoan,
    makePayment,
    getLoanInfo,
    getEvaluationInfo,
    getBorrowerProfile,
    getMarketplaceStats,
  };
};
