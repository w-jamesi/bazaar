import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Bazaar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              首页
            </Link>
            <Link to="/borrow" className="text-foreground hover:text-primary transition-colors">
              借款
            </Link>
            <Link to="/lend" className="text-foreground hover:text-primary transition-colors">
              出借
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              关于
            </Link>
          </nav>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
