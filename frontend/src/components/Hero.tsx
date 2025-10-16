import { Button } from './ui/button';
import { ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero-image.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Community collaboration"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by FHE Technology</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
            Fair Financial Access
            <br />
            <span className="text-primary">For Everyone</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Bazaar is a decentralized microloan platform using blockchain technology and homomorphic encryption 
            to protect borrower privacy, providing fair and transparent financial services for underserved communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/borrow">
              <Button size="lg" className="text-lg gap-2">
                Start Borrowing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/lend">
              <Button size="lg" variant="outline" className="text-lg">
                Become a Lender
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Privacy Protected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Platform Fees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-foreground mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Global Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
