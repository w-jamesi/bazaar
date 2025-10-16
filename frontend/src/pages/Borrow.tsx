import Header from '../components/Header';
import LoanForm from '../components/LoanForm';
import { CheckCircle } from 'lucide-react';

const Borrow = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Apply for Microloan
              </h1>
              <p className="text-xl text-muted-foreground">
                Simple, fast, and secure borrowing process with complete privacy protection
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card p-6 rounded-lg border border-border">
                <CheckCircle className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Fast Approval</h3>
                <p className="text-muted-foreground">
                  Automated smart contract-based approval process, typically completed in minutes
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <CheckCircle className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Low Interest Rates</h3>
                <p className="text-muted-foreground">
                  Decentralized platform eliminates intermediaries, providing better rates
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <CheckCircle className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Flexible Repayment</h3>
                <p className="text-muted-foreground">
                  Choose repayment plans based on your situation, with early repayment support
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <CheckCircle className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Privacy Protection</h3>
                <p className="text-muted-foreground">
                  FHE encryption technology ensures your financial information remains completely private
                </p>
              </div>
            </div>

            <LoanForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Borrow;
