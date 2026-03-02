import { LayoutDashboard } from 'lucide-react';

export function UserDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <LayoutDashboard className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold">My Dashboard</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Your Dashboard</h2>
        <p className="text-muted-foreground">
          This section will be implemented soon. You'll see your account overview and activity here.
        </p>
      </div>
    </div>
  );
}
