import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { Loader2, Shield } from 'lucide-react';
import { useMicroloanContract } from '@/hooks/useMicroloanContract';

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

    setIsSubmitting(true);

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
      });

      console.log('Loan application submitted:', result);
      console.log('Loan ID:', result.loanId?.toString());

      toast.success(
        `Loan application submitted! Loan ID: ${result.loanId?.toString() || 'N/A'}. Your data is protected by FHE encryption.`
      );

      // Reset form
      setAmount('');
      setDuration('');
      setMonthlyRevenue('');
      setPurpose('0');
    } catch (error: any) {
      console.error('Error submitting loan:', error);
      toast.error(`Submission failed: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="text-base mb-2 block">
            Loan Amount (USD)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter loan amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1000"
            max="100000"
            className="text-lg h-12"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This amount will be encrypted using homomorphic encryption (Min $1,000, Max $100,000)
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
              Monthly Revenue (USD)
            </Label>
            <Input
              id="monthlyRevenue"
              type="number"
              placeholder="5000"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              required
              min="0"
              className="text-lg h-12"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your monthly revenue (encrypted)
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
