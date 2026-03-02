import { BarChart3 } from 'lucide-react';

export function AdminReports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-8 h-8 text-accent" />
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          This section will be implemented soon. You'll be able to view detailed reports and analytics here.
        </p>
      </div>
    </div>
  );
}
