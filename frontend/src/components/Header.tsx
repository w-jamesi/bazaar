import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import logo from '../assets/brand/bazaar-logo.svg';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Bazaar logo" className="w-10 h-10 rounded-lg" />
            <span className="text-2xl font-bold text-foreground">Bazaar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/borrow" className="text-foreground hover:text-primary transition-colors">
              Borrow
            </Link>
            <Link to="/lend" className="text-foreground hover:text-primary transition-colors">
              Lend
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
