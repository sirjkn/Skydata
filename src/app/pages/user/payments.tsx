import { CreditCard } from 'lucide-react';

export function UserPayments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold">My Payments</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Payment History</h2>
        <p className="text-muted-foreground">
          This section will be implemented soon. You'll be able to view your payment history and transactions here.
        </p>
      </div>
    </div>
  );
}
