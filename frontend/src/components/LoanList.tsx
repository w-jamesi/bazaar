import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useMicroloanContract, LoanInfo, EvaluationInfo } from '../hooks/useMicroloanContract';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import {
  showTxPending,
  showTxSuccess,
  showTxError,
  showTxRejected,
  isUserRejection,
} from '../lib/txToast';

const LOAN_STATUS_LABELS = [
  'Draft', 'Submitted', 'Credit Check', 'Risk Assessment',
  'Approved', 'Disbursed', 'Active', 'Repaying', 'Completed', 'Defaulted'
];

const LOAN_PURPOSE_LABELS = [
  'Working Capital', 'Inventory', 'Equipment', 'Expansion', 'Emergency'
];

const RISK_TIER_LABELS = [
  'Minimal', 'Low', 'Moderate', 'High', 'Very High', 'Rejected'
];

const RISK_COLORS: Record<number, string> = {
  0: 'bg-green-500',
  1: 'bg-blue-500',
  2: 'bg-yellow-500',
  3: 'bg-orange-500',
  4: 'bg-red-500',
  5: 'bg-gray-500',
};

interface LoanData {
  loanId: number;
  info: LoanInfo;
  evaluation?: EvaluationInfo;
}

const LoanList = () => {
  const { address, isConnected } = useAccount();
  const {
    getMarketplaceStats,
    getLoanInfo,
    getEvaluationInfo,
    fundLoan,
    isLoading: contractLoading,
    isInitialized,
  } = useMicroloanContract();

  const [loans, setLoans] = useState<LoanData[]>([]);
  const [totalLoans, setTotalLoans] = useState(0);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [fundingLoanId, setFundingLoanId] = useState<number | null>(null);
  const [fundAmount, setFundAmount] = useState<Record<number, string>>({});

  useEffect(() => {
    loadLoans();
  }, [isInitialized]);

  const loadLoans = async () => {
    if (!isInitialized) return;

    setIsLoadingLoans(true);
    try {
      const stats = await getMarketplaceStats();
      if (!stats) return;

      setTotalLoans(Number(stats.totalLoans));

      // Load visible loans (show Submitted and onward)
      const loanPromises: Promise<LoanData | null>[] = [];
      for (let i = 0; i < Number(stats.totalLoans); i++) {
        loanPromises.push(
          (async () => {
            const info = await getLoanInfo(i);
            if (!info) return null;
            // Show all non-defaulted, active requests so lenders can browse pipeline
            if (info.status === 9) return null; // Defaulted

            const evaluation = await getEvaluationInfo(i);
            return { loanId: i, info, evaluation: evaluation || undefined };
          })()
        );
      }

      const loadedLoans = (await Promise.all(loanPromises)).filter(
        (loan): loan is LoanData => loan !== null
      );

      setLoans(loadedLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
      toast.error('Failed to load loan list');
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const handleFundLoan = async (loanId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = fundAmount[loanId];
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid funding amount');
      return;
    }

    setFundingLoanId(loanId);
    let txHash: string | null = null;

    try {
      const result = await fundLoan(loanId, Number(amount), (msg, hash) => {
        // Show pending toast when transaction is sent
        if (hash && !txHash) {
          txHash = hash;
          showTxPending(txHash, `Funding Loan #${loanId}`);
        }
      });

      txHash = result.txHash;

      // Show success toast with tx link
      showTxSuccess(txHash, `Successfully funded Loan #${loanId} with ${amount} ETH!`);

      // Reload loans
      await loadLoans();
    } catch (error: any) {
      console.error('Error funding loan:', error);

      if (isUserRejection(error)) {
        showTxRejected();
      } else {
        showTxError(txHash, error, `Failed to fund Loan #${loanId}`);
      }
    } finally {
      setFundingLoanId(null);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Initializing contract...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Available Loans</h2>
        <Button onClick={loadLoans} disabled={isLoadingLoans} variant="outline">
          {isLoadingLoans ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh List'
          )}
        </Button>
      </div>

      {isLoadingLoans ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : loans.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No available loan applications</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {loans.map((loan) => (
            <Card key={loan.loanId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Loan #{loan.loanId}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {LOAN_STATUS_LABELS[loan.info.status]}
                    </Badge>
                    <Badge variant="secondary">
                      {LOAN_PURPOSE_LABELS[loan.info.purpose]}
                    </Badge>
                    {loan.evaluation && (
                      <Badge
                        className={`${
                          RISK_COLORS[loan.evaluation.riskTier]
                        } text-white`}
                      >
                        {RISK_TIER_LABELS[loan.evaluation.riskTier]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Approved Amount (ETH)</p>
                    <p className="font-bold text-foreground">
                      {loan.evaluation ? Number(loan.evaluation.approvedAmount).toString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="font-bold text-foreground">
                      {loan.evaluation
                        ? `${(Number(loan.evaluation.interestRate) / 100).toFixed(2)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Credit Score</p>
                    <p className="font-bold text-foreground">
                      {loan.evaluation?.creditScore || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="number"
                  placeholder="Investment Amount (ETH)"
                  className="flex-1 px-4 py-2 border rounded-lg"
                  value={fundAmount[loan.loanId] || ''}
                  onChange={(e) =>
                    setFundAmount({ ...fundAmount, [loan.loanId]: e.target.value })
                  }
                  min="100"
                />
                <Button
                  onClick={() => handleFundLoan(loan.loanId)}
                  disabled={fundingLoanId === loan.loanId || !isConnected}
                >
                  {fundingLoanId === loan.loanId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Invest'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanList;
