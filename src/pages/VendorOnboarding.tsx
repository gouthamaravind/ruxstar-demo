import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Building2, Palette, Grid3X3, DollarSign, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { createVendor, updateVendor, upsertVendorPricing } from '@/lib/api';
import { CATEGORIES, PRINT_TYPES, formatINR } from '@/lib/types';

interface PricingEntry {
  product_type: string;
  print_type: string;
  price_1_to_10: number;
  price_11_to_50: number;
  price_51_to_200: number;
}

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Capabilities', icon: Palette },
  { id: 3, title: 'Categories', icon: Grid3X3 },
  { id: 4, title: 'Pricing', icon: DollarSign },
  { id: 5, title: 'Review', icon: FileCheck },
];

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentVendor, setCurrentVendor } = useApp();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentVendor?.name || '',
    email: currentVendor?.email || '',
    city: currentVendor?.city || '',
    address: currentVendor?.address || '',
    capabilities: currentVendor?.capabilities || [] as string[],
    categories: currentVendor?.categories || [] as string[],
    rushFee: currentVendor?.rush_fee || 500,
    turnaroundDays: currentVendor?.turnaround_days || 3,
  });
  const [pricingTable, setPricingTable] = useState<PricingEntry[]>([]);

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'capabilities' | 'categories', item: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item]
    }));
  };

  const updatePricing = (productType: string, printType: string, field: string, value: number) => {
    setPricingTable(prev => {
      const existing = prev.find(p => p.product_type === productType && p.print_type === printType);
      if (existing) {
        return prev.map(p => 
          p.product_type === productType && p.print_type === printType
            ? { ...p, [field]: value }
            : p
        );
      }
      return [...prev, {
        product_type: productType,
        print_type: printType,
        price_1_to_10: field === 'price_1_to_10' ? value : 0,
        price_11_to_50: field === 'price_11_to_50' ? value : 0,
        price_51_to_200: field === 'price_51_to_200' ? value : 0,
      }];
    });
  };

  const getPricingValue = (productType: string, printType: string, field: string): number => {
    const entry = pricingTable.find(p => p.product_type === productType && p.print_type === printType);
    return entry ? (entry as any)[field] : 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let vendor = currentVendor;
      
      if (vendor) {
        // Update existing vendor
        vendor = await updateVendor(vendor.id, {
          name: formData.name,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          capabilities: formData.capabilities,
          categories: formData.categories,
          rush_fee: formData.rushFee,
          turnaround_days: formData.turnaroundDays,
          onboarding_complete: true,
        });
      } else {
        // Create new vendor
        vendor = await createVendor({
          name: formData.name,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          capabilities: formData.capabilities,
          categories: formData.categories,
          rush_fee: formData.rushFee,
          turnaround_days: formData.turnaroundDays,
          onboarding_complete: true,
        });
      }

      // Save pricing if any
      if (pricingTable.length > 0) {
        const pricingWithVendorId = pricingTable.map(p => ({
          ...p,
          vendor_id: vendor!.id,
        }));
        await upsertVendorPricing(pricingWithVendorId);
      }

      setCurrentVendor(vendor);
      toast({
        title: "Onboarding Complete! 🎉",
        description: "Welcome to RuxStar! Your vendor account is ready.",
      });
      navigate('/vendor/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.email && formData.city;
      case 2: return formData.capabilities.length > 0;
      case 3: return formData.categories.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Vendor Onboarding</h1>
            <p className="text-muted-foreground">Set up your print business on RuxStar</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step > s.id ? 'bg-primary border-primary text-primary-foreground' :
                  step === s.id ? 'border-primary text-primary' :
                  'border-muted text-muted-foreground'
                }`}>
                  {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-16 lg:w-24 h-0.5 mx-2 transition-colors ${
                    step > s.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s) => (
              <span key={s.id} className={`text-xs ${step === s.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-6">Business Information</h2>
                <div>
                  <Label>Business Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Your Print Shop"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="contact@shop.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Mumbai"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Print Street, Mumbai 400001"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Print Capabilities</h2>
                <p className="text-muted-foreground text-sm mb-6">Select all printing methods you offer</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRINT_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.capabilities.includes(type)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={formData.capabilities.includes(type)}
                        onCheckedChange={() => toggleArrayItem('capabilities', type)}
                      />
                      <span className="font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Product Categories</h2>
                <p className="text-muted-foreground text-sm mb-6">Select categories you can print on</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        formData.categories.includes(cat)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={formData.categories.includes(cat)}
                        onCheckedChange={() => toggleArrayItem('categories', cat)}
                      />
                      <span className="font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Pricing Table</h2>
                <p className="text-muted-foreground text-sm mb-6">Set your prices per product and print type (in ₹)</p>
                
                <div className="mb-6 grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Rush Fee (₹)</Label>
                    <Input
                      type="number"
                      value={formData.rushFee}
                      onChange={(e) => updateFormData('rushFee', parseInt(e.target.value) || 0)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Standard Turnaround (days)</Label>
                    <Input
                      type="number"
                      value={formData.turnaroundDays}
                      onChange={(e) => updateFormData('turnaroundDays', parseInt(e.target.value) || 1)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium">Product / Print</th>
                        <th className="text-center py-2 font-medium">1-10 qty</th>
                        <th className="text-center py-2 font-medium">11-50 qty</th>
                        <th className="text-center py-2 font-medium">51-200 qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.categories.slice(0, 3).map(cat => 
                        formData.capabilities.slice(0, 2).map(print => (
                          <tr key={`${cat}-${print}`} className="border-b border-border/50">
                            <td className="py-2">
                              <span className="font-medium">{cat}</span>
                              <span className="text-muted-foreground"> / {print}</span>
                            </td>
                            <td className="py-2 px-1">
                              <Input
                                type="number"
                                placeholder="₹"
                                className="w-20 text-center"
                                value={getPricingValue(cat, print, 'price_1_to_10') || ''}
                                onChange={(e) => updatePricing(cat, print, 'price_1_to_10', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-2 px-1">
                              <Input
                                type="number"
                                placeholder="₹"
                                className="w-20 text-center"
                                value={getPricingValue(cat, print, 'price_11_to_50') || ''}
                                onChange={(e) => updatePricing(cat, print, 'price_11_to_50', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                            <td className="py-2 px-1">
                              <Input
                                type="number"
                                placeholder="₹"
                                className="w-20 text-center"
                                value={getPricingValue(cat, print, 'price_51_to_200') || ''}
                                onChange={(e) => updatePricing(cat, print, 'price_51_to_200', parseFloat(e.target.value) || 0)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Showing first 3 categories × 2 print types. Full pricing can be edited later.
                </p>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Review & Submit</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-medium mb-2">Business</h3>
                    <p>{formData.name}</p>
                    <p className="text-sm text-muted-foreground">{formData.city}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-medium mb-2">Capabilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.capabilities.map(c => (
                        <span key={c} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map(c => (
                        <span key={c} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-medium mb-2">Pricing</h3>
                    <p className="text-sm">Rush fee: {formatINR(formData.rushFee)} • Turnaround: {formData.turnaroundDays} days</p>
                    <p className="text-sm text-muted-foreground">{pricingTable.length} pricing entries configured</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {step < 5 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Complete Onboarding'}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
