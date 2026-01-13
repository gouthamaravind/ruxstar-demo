import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { fetchVendorByEmail, createVendor } from '@/lib/api';

export default function VendorLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentVendor } = useApp();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const vendor = await fetchVendorByEmail(email);
      
      if (vendor) {
        // For demo, we just check email exists (no real password check in DB for MVP)
        setCurrentVendor(vendor);
        toast({ title: "Welcome back!", description: `Logged in as ${vendor.name}` });
        navigate('/vendor/dashboard');
      } else {
        toast({ 
          title: "Login Failed", 
          description: "No vendor found with this email", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Login Failed", 
        description: "An error occurred", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!name || !email) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in all fields", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const existingVendor = await fetchVendorByEmail(email);
      if (existingVendor) {
        toast({ 
          title: "Account Exists", 
          description: "An account with this email already exists", 
          variant: "destructive" 
        });
        return;
      }

      const newVendor = await createVendor({
        name,
        email,
        city: null,
        address: null,
        capabilities: [],
        categories: [],
        rush_fee: 500,
        turnaround_days: 3,
        onboarding_complete: false,
      });

      setCurrentVendor(newVendor);
      toast({ title: "Account Created!", description: "Complete your onboarding to start receiving orders" });
      navigate('/vendor/onboarding');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create account", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@vendor.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl mb-4">
              R
            </div>
            <h1 className="text-2xl font-bold">Vendor Portal</h1>
            <p className="text-muted-foreground mt-1">
              {isLogin ? 'Sign in to manage your orders' : 'Create your vendor account'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin ? 'bg-background shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <Label>Business Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Print Shop"
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={isLogin ? handleLogin : handleCreateAccount}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Loading...'
              ) : isLogin ? (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {isLogin && (
              <div className="text-center">
                <button
                  onClick={handleDemoLogin}
                  className="text-sm text-primary hover:underline"
                >
                  Use demo credentials
                </button>
                <p className="text-xs text-muted-foreground mt-1">
                  demo@vendor.com
                </p>
              </div>
            )}
          </div>

          {!isLogin && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
