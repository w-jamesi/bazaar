import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import {
  CIPHERED_MICROLOAN_BAZAAR_ADDRESS,
  CIPHERED_MICROLOAN_BAZAAR_ABI,
} from '@/contracts/CipheredMicroloanBazaar';
import {
  initializeFHEVM,
  getFHEVMInstance,
  encryptUint64,
  encryptUint32,
  encryptUint16,
  encryptUint8,
  toContractInput,
  toProofBytes,
  isFheInitialized,
} from '@/lib/fhevm';

export interface LoanApplicationParams {
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
      if (!walletClient || !chain || !address) return;

      try {
        // Get provider from wallet client
        const provider = new BrowserProvider(walletClient as any);

        // Initialize FHEVM (no longer needs provider and chainId)
        await initializeFHEVM();

        // Get contract address
        const contractAddress = CIPHERED_MICROLOAN_BAZAAR_ADDRESS[
          chain.id as keyof typeof CIPHERED_MICROLOAN_BAZAAR_ADDRESS
        ];

        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
          console.warn(`Contract not deployed on chain ${chain.id}`);
          return;
        }

        // Create contract instance
        const signer = await provider.getSigner();
        const contractInstance = new Contract(
          contractAddress,
          CIPHERED_MICROLOAN_BAZAAR_ABI,
          signer
        );

        setContract(contractInstance);
        setIsInitialized(true);
        console.log('Microloan contract initialized');
      } catch (error) {
        console.error('Failed to initialize contract:', error);
      }
    };

    initialize();
  }, [walletClient, chain, address]);

  /**
   * Submit a loan application with encrypted data
   */
  const submitLoanApplication = useCallback(
    async (params: LoanApplicationParams) => {
      if (!contract || !isInitialized || !address || !chain) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      try {
        if (!isFheInitialized()) {
          throw new Error('FHE not initialized');
        }

        const contractAddress = CIPHERED_MICROLOAN_BAZAAR_ADDRESS[
          chain.id as keyof typeof CIPHERED_MICROLOAN_BAZAAR_ADDRESS
        ];

        // Encrypt all sensitive data
        const encAmount = await encryptUint64(
          params.requestedAmount,
          contractAddress,
          address
        );
        const encTerm = await encryptUint32(
          params.requestedTerm,
          contractAddress,
          address
        );
        const encCredit = await encryptUint32(
          params.creditScore,
          contractAddress,
          address
        );
        const encRevenue = await encryptUint32(
          params.monthlyRevenue,
          contractAddress,
          address
        );
        const encHistory = await encryptUint16(
          params.paymentHistory,
          contractAddress,
          address
        );
        const encDefaults = await encryptUint8(
          params.pastDefaults,
          contractAddress,
          address
        );
        const encCommunity = await encryptUint8(
          params.communityScore,
          contractAddress,
          address
        );

        // Submit transaction
        const tx = await contract.submitLoanApplication(
          toContractInput(encAmount.data),
          toProofBytes(encAmount.signature),
          toContractInput(encTerm.data),
          toProofBytes(encTerm.signature),
          toContractInput(encCredit.data),
          toProofBytes(encCredit.signature),
          toContractInput(encRevenue.data),
          toProofBytes(encRevenue.signature),
          toContractInput(encHistory.data),
          toProofBytes(encHistory.signature),
          toContractInput(encDefaults.data),
          toProofBytes(encDefaults.signature),
          toContractInput(encCommunity.data),
          toProofBytes(encCommunity.signature),
          params.purpose
        );

        const receipt = await tx.wait();
        console.log('Loan application submitted:', receipt);

        // Extract loanId from events
        const event = receipt.logs.find((log: any) =>
          log.topics[0] === contract.interface.getEvent('LoanApplicationSubmitted')?.topicHash
        );

        const loanId = event ? BigInt(event.topics[1]) : null;

        return { receipt, loanId };
      } catch (error) {
        console.error('Error submitting loan application:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isInitialized, address, chain]
  );

  /**
   * Fund a loan with encrypted amount
   */
  const fundLoan = useCallback(
    async (loanId: number, amount: number) => {
      if (!contract || !isInitialized || !address || !chain) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      try {
        if (!isFheInitialized()) {
          throw new Error('FHE not initialized');
        }

        const contractAddress = CIPHERED_MICROLOAN_BAZAAR_ADDRESS[
          chain.id as keyof typeof CIPHERED_MICROLOAN_BAZAAR_ADDRESS
        ];

        const encAmount = await encryptUint64(
          amount,
          contractAddress,
          address
        );

        const tx = await contract.fundLoan(
          loanId,
          toContractInput(encAmount.data),
          toProofBytes(encAmount.signature)
        );

        const receipt = await tx.wait();
        console.log('Loan funded:', receipt);

        return receipt;
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
    async (loanId: number, amount: number) => {
      if (!contract || !isInitialized || !address || !chain) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      try {
        if (!isFheInitialized()) {
          throw new Error('FHE not initialized');
        }

        const contractAddress = CIPHERED_MICROLOAN_BAZAAR_ADDRESS[
          chain.id as keyof typeof CIPHERED_MICROLOAN_BAZAAR_ADDRESS
        ];

        const encAmount = await encryptUint64(
          amount,
          contractAddress,
          address
        );

        const tx = await contract.makePayment(
          loanId,
          toContractInput(encAmount.data),
          toProofBytes(encAmount.signature)
        );

        const receipt = await tx.wait();
        console.log('Payment made:', receipt);

        return receipt;
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
