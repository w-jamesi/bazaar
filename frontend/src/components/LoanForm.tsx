import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { Loader2, Shield } from 'lucide-react';
import { useMicroloanContract } from '../hooks/useMicroloanContract';
import {
  showTxPending,
  showTxSuccess,
  showTxError,
  showTxRejected,
  isUserRejection,
} from '../lib/txToast';

const LoanForm = () => {
  const { address, isConnected } = useAccount();
  const { submitLoanApplication, isLoading: contractLoading, isInitialized } = useMicroloanContract();

  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('0'); // LoanPurpose enum
  const [duration, setDuration] = useState('');
  const [creditScore, setCreditScore] = useState('650');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [paymentHistory, setPaymentHistory] = useState('0');
  const [pastDefaults, setPastDefaults] = useState('0');
  const [communityScore, setCommunityScore] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isInitialized) {
      toast.error('Contract not initialized, please try again later');
      return;
    }

    // Immediately show overlay before any heavy async work
    setIsSubmitting(true);
    setProgress('Preparing submission...');
    // Yield to the browser so the overlay renders before encryption begins
    await new Promise((r) => setTimeout(r, 0));

    let txHash: string | null = null;

    try {
      // Submit loan application with encrypted data
      const result = await submitLoanApplication({
        requestedAmount: Number(amount),
        requestedTerm: Number(duration) * 30, // Convert months to days
        creditScore: Number(creditScore),
        monthlyRevenue: Number(monthlyRevenue),
        paymentHistory: Number(paymentHistory),
        pastDefaults: Number(pastDefaults),
        communityScore: Number(communityScore),
        purpose: Number(purpose),
      }, (msg, hash) => {
        setProgress(msg);
        // Show pending toast when transaction is sent
        if (hash && !txHash) {
          txHash = hash;
          showTxPending(txHash, 'Submitting Loan Application');
        }
      });

      txHash = result.txHash;
      console.log('Loan application submitted:', result);
      console.log('Loan ID:', result.loanId?.toString());

      // Show success toast with tx link
      showTxSuccess(
        txHash,
        `Loan #${result.loanId?.toString() || 'N/A'} submitted successfully!`
      );

      // Reset form
      setAmount('');
      setDuration('');
      setMonthlyRevenue('');
      setPurpose('0');
    } catch (error: any) {
      console.error('Error submitting loan:', error);

      if (isUserRejection(error)) {
        showTxRejected();
      } else {
        showTxError(txHash, error, 'Loan Submission Failed');
      }
    } finally {
      setIsSubmitting(false);
      setProgress('');
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Apply for Loan</h2>
          <p className="text-sm text-muted-foreground">Your information will be protected by FHE encryption</p>
        </div>
      </div>

      {/* Full-screen progress overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Submitting loan...</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{progress || 'Processing...'}</p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '66%' }} />
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="text-base mb-2 block">
            Loan Amount (ETH)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter loan amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.1"
            max="50"
            step="0.01"
            className="text-lg h-12"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This amount will be encrypted using homomorphic encryption (Min 0.1 ETH, Max 50 ETH)
          </p>
        </div>

        <div>
          <Label htmlFor="purpose" className="text-base mb-2 block">
            Loan Purpose
          </Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="text-lg h-12">
              <SelectValue placeholder="Select loan purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Working Capital</SelectItem>
              <SelectItem value="1">Inventory Purchase</SelectItem>
              <SelectItem value="2">Equipment Purchase</SelectItem>
              <SelectItem value="3">Business Expansion</SelectItem>
              <SelectItem value="4">Emergency Needs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration" className="text-base mb-2 block">
            Repayment Term (Months)
          </Label>
          <Input
            id="duration"
            type="number"
            placeholder="6"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
            max="24"
            className="text-lg h-12"
          />
          <p className="text-xs text-muted-foreground mt-1">
            1-24 months
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="creditScore" className="text-base mb-2 block">
              Credit Score
            </Label>
            <Input
              id="creditScore"
              type="number"
              placeholder="650"
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value)}
              required
              min="300"
              max="850"
              className="text-lg h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              300-850 (encrypted)
            </p>
          </div>

          <div>
            <Label htmlFor="monthlyRevenue" className="text-base mb-2 block">
              Monthly Revenue (ETH)
            </Label>
            <Input
              id="monthlyRevenue"
              type="number"
              placeholder="2.5"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              required
              min="0"
              step="0.01"
              className="text-lg h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your monthly revenue in ETH (encrypted)
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentHistory" className="text-base mb-2 block">
              Successful Payments
            </Label>
            <Input
              id="paymentHistory"
              type="number"
              placeholder="0"
              value={paymentHistory}
              onChange={(e) => setPaymentHistory(e.target.value)}
              required
              min="0"
              className="text-lg h-12"
            />
          </div>

          <div>
            <Label htmlFor="pastDefaults" className="text-base mb-2 block">
              Past Defaults
            </Label>
            <Input
              id="pastDefaults"
              type="number"
              placeholder="0"
              value={pastDefaults}
              onChange={(e) => setPastDefaults(e.target.value)}
              required
              min="0"
              className="text-lg h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="communityScore" className="text-base mb-2 block">
            Community Score (0-10)
          </Label>
          <Input
            id="communityScore"
            type="number"
            placeholder="5"
            value={communityScore}
            onChange={(e) => setCommunityScore(e.target.value)}
            required
            min="0"
            max="10"
            className="text-lg h-12"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your reputation score in the community
          </p>
        </div>

        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex gap-2 items-start">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <strong>Privacy Protection:</strong>
              Your loan amount will be encrypted using Fully Homomorphic Encryption (FHE) technology, ensuring all operations on the blockchain maintain data privacy.
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Submit Loan Application'
          )}
        </Button>

        {!isConnected && (
          <p className="text-center text-sm text-muted-foreground">
            Please connect your wallet to submit a loan application
          </p>
        )}
      </form>
    </Card>
  );
};

export default LoanForm;
