import { toast } from 'sonner';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

/**
 * Get block explorer URL for a transaction
 */
export const getExplorerUrl = (txHash: string): string => {
  return `${SEPOLIA_EXPLORER}/tx/${txHash}`;
};

/**
 * Truncate transaction hash for display
 */
export const truncateHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

/**
 * Transaction link component for toast messages
 */
const TxLink = ({ hash }: { hash: string }) => (
  <a
    href={getExplorerUrl(hash)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
    onClick={(e) => e.stopPropagation()}
  >
    {truncateHash(hash)}
    <ExternalLink className="w-3 h-3" />
  </a>
);

/**
 * Show pending transaction toast (when tx is sent but not confirmed)
 */
export const showTxPending = (txHash: string, message?: string) => {
  return toast(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="font-medium">{message || 'Transaction Pending'}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        Waiting for confirmation... <TxLink hash={txHash} />
      </div>
    </div>,
    {
      duration: Infinity, // Keep showing until dismissed
      id: `tx-${txHash}`, // Use txHash as ID to update later
    }
  );
};

/**
 * Show transaction success toast
 */
export const showTxSuccess = (txHash: string, message?: string) => {
  // Dismiss pending toast if exists
  toast.dismiss(`tx-${txHash}`);

  return toast.success(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="font-medium">{message || 'Transaction Confirmed'}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        View on explorer: <TxLink hash={txHash} />
      </div>
    </div>,
    {
      duration: 8000,
    }
  );
};

/**
 * Show transaction failure toast
 */
export const showTxError = (txHash: string | null, error: any, message?: string) => {
  // Dismiss pending toast if exists
  if (txHash) {
    toast.dismiss(`tx-${txHash}`);
  }

  const errorMessage = error?.reason || error?.shortMessage || error?.message || 'Unknown error';

  return toast.error(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="font-medium">{message || 'Transaction Failed'}</span>
      </div>
      <div className="text-sm text-muted-foreground">
        {errorMessage}
      </div>
      {txHash && (
        <div className="text-sm text-muted-foreground">
          View on explorer: <TxLink hash={txHash} />
        </div>
      )}
    </div>,
    {
      duration: 10000,
    }
  );
};

/**
 * Show user rejection toast (when user cancels in wallet)
 */
export const showTxRejected = () => {
  return toast.error(
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <XCircle className="w-4 h-4 text-orange-500" />
        <span className="font-medium">Transaction Rejected</span>
      </div>
      <div className="text-sm text-muted-foreground">
        You cancelled the transaction in your wallet
      </div>
    </div>,
    {
      duration: 5000,
    }
  );
};

/**
 * Helper to check if error is user rejection
 */
export const isUserRejection = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('user cancelled') ||
    error?.code === 4001 ||
    error?.code === 'ACTION_REJECTED'
  );
};
