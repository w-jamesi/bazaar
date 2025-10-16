import { Shield, Lock, Eye } from 'lucide-react';
import { Card } from './ui/card';

const PrivacyFeature = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Fully Homomorphic Encryption Privacy Protection
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Using FHE technology, your financial information remains encrypted throughout the entire lending process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">End-to-End Encryption</h3>
            <p className="text-muted-foreground leading-relaxed">
              Loan amounts and personal information remain encrypted during transmission and storage, 
              ensuring no one can view plaintext data.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">Encrypted Computation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Using FHE homomorphic encryption technology, smart contracts can perform calculations 
              and verification without decrypting the data.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">Privacy Guarantee</h3>
            <p className="text-muted-foreground leading-relaxed">
              Even platform administrators cannot view your loan details, truly achieving data sovereignty and privacy protection.
            </p>
          </Card>
        </div>

        <div className="mt-16 p-8 bg-muted rounded-2xl">
          <h3 className="text-2xl font-bold mb-4 text-center text-foreground">
            How FHE Homomorphic Encryption Works
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <p className="text-sm text-muted-foreground">Submit Loan Application</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <p className="text-sm text-muted-foreground">Local Data Encryption</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <p className="text-sm text-muted-foreground">On-Chain Encrypted Computation</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <p className="text-sm text-muted-foreground">Secure Transaction Completion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyFeature;
