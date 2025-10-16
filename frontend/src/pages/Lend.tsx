import Header from '../components/Header';
import LoanList from '../components/LoanList';
import { Card } from '../components/ui/card';
import { TrendingUp, Users, Shield } from 'lucide-react';

const Lend = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Become a Lender
              </h1>
              <p className="text-xl text-muted-foreground">
                Support entrepreneurs in developing countries while earning stable investment returns
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Stable Returns</h3>
                <p className="text-muted-foreground">
                  Average annual return 8-12%
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Social Impact</h3>
                <p className="text-muted-foreground">
                  Help improve lives
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Transparent & Secure</h3>
                <p className="text-muted-foreground">
                  Smart contract protection
                </p>
              </Card>
            </div>

            <Card className="p-8 mb-12">
              <h2 className="text-2xl font-bold mb-6 text-foreground">How to Get Started</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-foreground">Connect Wallet</h3>
                    <p className="text-muted-foreground">
                      Connect MetaMask or other Web3 wallet to the Bazaar platform
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-foreground">Browse Loan Requests</h3>
                    <p className="text-muted-foreground">
                      View verified loan applications and choose projects you want to support
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-foreground">Lend Funds</h3>
                    <p className="text-muted-foreground">
                      Securely lend your funds through smart contracts with automatic repayment tracking
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-foreground">Earn Returns</h3>
                    <p className="text-muted-foreground">
                      Receive monthly repayments and interest, withdraw to your wallet anytime
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Loan List Section */}
            <LoanList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lend;
