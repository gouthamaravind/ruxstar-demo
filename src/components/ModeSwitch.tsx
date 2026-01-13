import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { MessageCircle, Printer } from 'lucide-react';

interface ModeSwitchProps {
  size?: 'sm' | 'lg';
}

export function ModeSwitch({ size = 'sm' }: ModeSwitchProps) {
  const { mode, setMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLarge = size === 'lg';
  
  const handleModeChange = (newMode: 'social' | 'pod') => {
    setMode(newMode);
    // Navigate to the corresponding route if not already there
    const targetPath = newMode === 'social' ? '/social' : '/pod';
    if (!location.pathname.startsWith(targetPath)) {
      navigate(targetPath);
    }
  };
  
  return (
    <div className={`relative flex items-center gap-1 rounded-full bg-muted p-1 ${isLarge ? 'text-base' : 'text-sm'}`}>
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-primary"
        initial={false}
        animate={{
          left: mode === 'social' ? '4px' : '50%',
          right: mode === 'pod' ? '4px' : '50%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      
      <button
        onClick={() => handleModeChange('social')}
        className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors ${
          mode === 'social' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        } ${isLarge ? 'px-6 py-3' : ''}`}
      >
        <MessageCircle className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
        Social
      </button>
      
      <button
        onClick={() => handleModeChange('pod')}
        className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors ${
          mode === 'pod' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        } ${isLarge ? 'px-6 py-3' : ''}`}
      >
        <Printer className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} />
        POD
      </button>
    </div>
  );
}
