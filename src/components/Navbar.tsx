import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeSwitch } from './ModeSwitch';
import { ThemeToggle } from './ThemeToggle';
import { useApp } from '@/contexts/AppContext';
import logoImage from '@/assets/logo.svg';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isVendorLoggedIn, currentVendor, setCurrentVendor, isUserLoggedIn, profile, signOut } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setCurrentVendor(null);
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <img src={logoImage} alt="RuxStar" className="h-10 w-10 object-contain" />
              <span className="text-xl font-bold">RuxStar</span>
            </motion.div>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Mode Switch - Desktop */}
          <div className="hidden md:block">
            <ModeSwitch />
          </div>

          {/* Theme Toggle & Auth - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isUserLoggedIn ? (
              <Button variant="ghost" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {profile?.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <span className="hidden lg:inline">{profile?.username || 'Profile'}</span>
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            {isVendorLoggedIn && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/vendor/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {currentVendor?.name}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Search - Mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mode Switch - Mobile */}
              <div className="flex justify-center">
                <ModeSwitch />
              </div>

              {/* Auth - Mobile */}
              <div className="flex flex-col gap-2">
                {isUserLoggedIn ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        My Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
                {isVendorLoggedIn && (
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/vendor/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Vendor Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
