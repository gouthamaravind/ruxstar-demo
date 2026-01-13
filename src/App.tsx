import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import HomePage from "./pages/HomePage";
import PODCatalog from "./pages/PODCatalog";
import PODOrder from "./pages/PODOrder";
import VendorOnboarding from "./pages/VendorOnboarding";
import VendorLogin from "./pages/VendorLogin";
import VendorDashboard from "./pages/VendorDashboard";
import SocialFeed from "./pages/SocialFeed";
import UserLogin from "./pages/UserLogin";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/pod" element={<Layout><PODCatalog /></Layout>} />
            <Route path="/pod/order" element={<Layout><PODOrder /></Layout>} />
            <Route path="/social" element={<Layout><SocialFeed /></Layout>} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
