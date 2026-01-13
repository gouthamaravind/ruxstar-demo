import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetMockData } from '@/lib/mockData';

export function Footer() {
  const handleReset = () => {
    if (confirm('Reset all demo data? This will clear vendors, orders, and posts.')) {
      resetMockData();
      window.location.reload();
    }
  };

  return (
    <footer className="border-t border-border bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Demo Mode
            </span>
            <span>RuxStar MVP © 2025</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Demo Data
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
