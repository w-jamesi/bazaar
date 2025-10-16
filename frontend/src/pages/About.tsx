import Header from '../components/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shield, Zap, Users, Target, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              About Ciphered Microloan Bazaar
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A decentralized microloan platform powered by Fully Homomorphic Encryption (FHE) 
              technology, enabling privacy-preserving financial services for underserved communities.
            </p>
          </div>

          {/* Prototype Disclaimer */}
          <Card className="p-8 mb-12 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  🚧 Product Prototype Notice
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  This is a <strong>proof-of-concept prototype</strong> demonstrating FHE-enabled microloan functionality. 
                  The platform is currently in development and should not be used for real financial transactions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Development Phase
                  </Badge>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Testnet Only
                  </Badge>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    No Real Funds
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Technology Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">FHE Technology</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Fully Homomorphic Encryption allows computations on encrypted data without decryption, 
                ensuring complete privacy for sensitive financial information.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Zero-knowledge credit evaluation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Private loan amount processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Encrypted repayment calculations
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Decentralized Lending</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Multi-lender pooling system enables community-driven microloans with 
                transparent, blockchain-based governance.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Peer-to-peer lending pools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated risk distribution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Smart contract execution
                </li>
              </ul>
            </Card>
          </div>

          {/* Development Roadmap */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Development Roadmap</h2>
            
            <div className="space-y-8">
              {/* Phase 1 - Current (2025 Q4) */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-green-500">Current Phase · 2025 Q4</Badge>
                    <h3 className="text-xl font-semibold">Core Prototype (Public Demo)</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Public demo of an FHE-enabled microloan platform with essential functionality and
                    demo-only flows on Sepolia testnet. No real funds.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Smart contract deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Basic loan application system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Multi-lender funding mechanism
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Encrypted data processing
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Phase 2 (2026 H1) */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-bold">2</span>
                  </div>
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      <Clock className="h-3 w-3 mr-1" />
                      2026 H1
                    </Badge>
                    <h3 className="text-xl font-semibold">FHE Credit Scoring MVP</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    MVP of a privacy-preserving on-chain credit evaluation system with encrypted features and
                    gateway-assisted decryption for risk tiers.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      On-chain FHE credit scoring model
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      Privacy-preserving risk assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      Automated loan approval system
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      Dynamic interest rate calculation
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Phase 3 (2026 H2) */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-bold">3</span>
                  </div>
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="border-purple-500 text-purple-500">
                      <Clock className="h-3 w-3 mr-1" />
                      2026 H2
                    </Badge>
                    <h3 className="text-xl font-semibold">Advanced Features</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Enhanced functionality and user experience improvements.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-500" />
                      Mobile application
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-500" />
                      Cross-chain compatibility
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-500" />
                      Advanced analytics dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-500" />
                      Integration with traditional finance
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Phase 4 (2027) */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground font-bold">4</span>
                  </div>
                </div>
                <Card className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="border-orange-500 text-orange-500">
                      <Clock className="h-3 w-3 mr-1" />
                      2027
                    </Badge>
                    <h3 className="text-xl font-semibold">Production Launch</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Full-scale deployment with regulatory compliance and security audits.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      Mainnet deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      Security audit completion
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      Regulatory compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      Community governance
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <Card className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Get Involved</h3>
            <p className="text-muted-foreground mb-6">
              Join our community and contribute to the future of privacy-preserving finance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <Target className="h-4 w-4 mr-2" />
                GitHub
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Discord
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Twitter
              </Badge>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
