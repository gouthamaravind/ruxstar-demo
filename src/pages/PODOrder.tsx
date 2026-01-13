import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, ArrowLeft, ShoppingCart, X, FileImage, Loader2, 
  Package, Clock, Palette, Ruler, Printer, Check, 
  ChevronRight, Sparkles, Info, Minus, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts, fetchVendors, createOrder, createOrderItem } from '@/lib/api';
import { Product, Vendor, PLACEMENTS, CATEGORY_ICONS, formatINR, TurnaroundOption, QuantitySlab } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export default function PODOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const preselectedProductId = searchParams.get('product') || '';
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId);
  const [quantity, setQuantity] = useState(10);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [printType, setPrintType] = useState('');
  const [placement, setPlacement] = useState('Front');
  const [selectedTurnaround, setSelectedTurnaround] = useState<TurnaroundOption | null>(null);
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Current step for mobile stepper visualization
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchVendors()]).then(([prods, vends]) => {
      setProducts(prods);
      setVendors(vends);
      
      // Auto-select first turnaround option if product is preselected
      const preselected = prods.find(p => p.id === preselectedProductId);
      if (preselected?.turnaround_options?.length > 0) {
        setSelectedTurnaround(preselected.turnaround_options[0]);
      }
    }).finally(() => setLoading(false));
  }, [preselectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // When product changes, reset dependent fields and set defaults
  useEffect(() => {
    if (selectedProduct) {
      // Auto-select first available options
      if (selectedProduct.sizes?.length > 0 && !size) {
        setSize(selectedProduct.sizes[0]);
      }
      if (selectedProduct.colors?.length > 0 && !color) {
        setColor(selectedProduct.colors[0]);
      }
      if (selectedProduct.supported_print_types?.length > 0 && !printType) {
        setPrintType(selectedProduct.supported_print_types[0]);
      }
      if (selectedProduct.turnaround_options?.length > 0 && !selectedTurnaround) {
        setSelectedTurnaround(selectedProduct.turnaround_options[0]);
      }
    }
  }, [selectedProduct]);

  // Calculate pricing with quantity slabs and turnaround
  const pricing = useMemo(() => {
    if (!selectedProduct) return { unitPrice: 0, subtotal: 0, turnaroundFee: 0, discount: 0, total: 0, discountPercent: 0 };
    
    // Get unit price from quantity slabs if available
    let unitPrice = selectedProduct.base_price;
    const slabs = selectedProduct.quantity_slabs as QuantitySlab[] || [];
    
    for (const slab of slabs) {
      if (quantity >= slab.min && quantity <= slab.max) {
        unitPrice = slab.price_per_unit;
        break;
      }
    }
    
    // Apply turnaround multiplier
    const turnaroundMultiplier = selectedTurnaround?.price_multiplier || 1;
    const adjustedUnitPrice = unitPrice * turnaroundMultiplier;
    
    const subtotal = adjustedUnitPrice * quantity;
    
    // Volume discount (additional to slab pricing)
    let discountPercent = 0;
    if (quantity >= 100) discountPercent = 10;
    else if (quantity >= 50) discountPercent = 5;
    
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;
    
    return { 
      unitPrice: adjustedUnitPrice, 
      subtotal, 
      turnaroundFee: (turnaroundMultiplier - 1) * unitPrice * quantity,
      discount, 
      discountPercent, 
      total 
    };
  }, [selectedProduct, quantity, selectedTurnaround]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
      return;
    }
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `orders/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);
      
      setUploadedFile({ name: file.name, url: publicUrl });
      toast({ title: "Design uploaded!", description: file.name });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: "Could not upload file. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => setUploadedFile(null);

  const handleSubmit = async () => {
    if (!selectedProduct || !customerName) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const vendor = vendors[0];
      const order = await createOrder({
        vendor_id: vendor?.id || '',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes: notes + (selectedTurnaround ? `\nTurnaround: ${selectedTurnaround.label}` : ''),
        file_url: uploadedFile?.url || null,
        total_price: pricing.total,
      });

      await createOrderItem({
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        size: size || null,
        color: color || null,
        print_type: printType || null,
        placement,
        unit_price: pricing.unitPrice,
      });

      toast({ title: "Order Placed! 🎉", description: "We'll start processing your order right away." });
      navigate('/pod');
    } catch (error) {
      toast({ title: "Error", description: "Failed to place order. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(500, prev + delta)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading configurator...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/pod')} 
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {selectedProduct?.image || CATEGORY_ICONS[selectedProduct?.category || ''] || '📦'}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Order Configurator</h1>
                  {selectedProduct && (
                    <p className="text-muted-foreground">{selectedProduct.name}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Form - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Product Selection Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-card rounded-2xl border border-border p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Select Product</h2>
                </div>

                <div className="space-y-5">
                  {/* Product Dropdown */}
                  <div>
                    <Label className="text-sm font-medium">Product</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger className="mt-1.5 h-12">
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{product.image || '📦'}</span>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.category} • From {formatINR(product.base_price)}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      Quantity
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Higher quantities get better per-unit pricing</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl shrink-0"
                        onClick={() => adjustQuantity(-10)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        min={1} 
                        max={500} 
                        value={quantity} 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                        className="h-12 text-center text-lg font-semibold"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl shrink-0"
                        onClick={() => adjustQuantity(10)}
                        disabled={quantity >= 500}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {pricing.discountPercent > 0 && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {pricing.discountPercent}% bulk discount applied!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Customization Options */}
              <AnimatePresence>
                {selectedProduct && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold">Customization</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Size */}
                      {selectedProduct.sizes?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Ruler className="h-3.5 w-3.5" />
                            Size
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProduct.sizes.map((s) => (
                              <button
                                key={s}
                                onClick={() => setSize(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                  size === s 
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                                    : 'bg-muted/50 hover:bg-muted border-transparent'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color */}
                      {selectedProduct.colors?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Palette className="h-3.5 w-3.5" />
                            Color
                          </Label>
                          <Select value={color} onValueChange={setColor}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProduct.colors.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Print Type */}
                      {selectedProduct.supported_print_types?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Printer className="h-3.5 w-3.5" />
                            Print Type
                          </Label>
                          <Select value={printType} onValueChange={setPrintType}>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select print type" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProduct.supported_print_types.map((pt) => (
                                <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Placement */}
                      <div>
                        <Label className="text-sm font-medium">Placement</Label>
                        <Select value={placement} onValueChange={setPlacement}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PLACEMENTS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Turnaround Options */}
                    {selectedProduct.turnaround_options?.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-border">
                        <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Clock className="h-3.5 w-3.5" />
                          Turnaround Time
                        </Label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {(selectedProduct.turnaround_options as TurnaroundOption[]).map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => setSelectedTurnaround(opt)}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                selectedTurnaround?.label === opt.label
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{opt.label}</span>
                                {selectedTurnaround?.label === opt.label && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{opt.days} days</p>
                              {opt.price_multiplier > 1 && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  +{Math.round((opt.price_multiplier - 1) * 100)}%
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Design Upload */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileImage className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Upload Design</h2>
                  <Badge variant="outline" className="ml-auto">Optional</Badge>
                </div>

                {uploadedFile ? (
                  <div className="border border-border rounded-xl p-4 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileImage className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          Uploaded successfully
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="shrink-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {uploadedFile.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img src={uploadedFile.url} alt="Preview" className="mt-4 rounded-lg max-h-48 object-contain mx-auto" />
                    )}
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      uploading 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="design-upload" 
                      accept="image/*,.pdf,.ai,.psd" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      disabled={uploading} 
                    />
                    <label htmlFor="design-upload" className={uploading ? '' : 'cursor-pointer'}>
                      {uploading ? (
                        <>
                          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
                          <p className="font-medium">Uploading your design...</p>
                        </>
                      ) : (
                        <>
                          <div className="h-14 w-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                            <Upload className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <p className="font-medium mb-1">Click to upload your design</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, PDF, AI, PSD (max 10MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </motion.div>

              {/* Customer Details */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-base">👤</span>
                  </div>
                  <h2 className="text-lg font-semibold">Your Details</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder="John Doe" 
                      className="mt-1.5 h-12" 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)} 
                      placeholder="+91 98765 43210" 
                      className="mt-1.5 h-12" 
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input 
                      type="email" 
                      value={customerEmail} 
                      onChange={(e) => setCustomerEmail(e.target.value)} 
                      placeholder="you@example.com" 
                      className="mt-1.5 h-12" 
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <Textarea 
                    placeholder="Any special instructions? E.g., specific colors, placement details, finish preferences..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              </motion.div>
            </div>

            {/* Order Summary - 2 columns */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border shadow-sm sticky top-24 overflow-hidden"
              >
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 px-6 py-5 border-b border-border">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </h2>
                </div>

                <div className="p-6">
                  {selectedProduct ? (
                    <>
                      {/* Product Preview */}
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl mb-6">
                        <div className="h-16 w-16 rounded-xl bg-background flex items-center justify-center text-3xl shrink-0">
                          {selectedProduct.image || CATEGORY_ICONS[selectedProduct.category] || '📦'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{selectedProduct.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">Qty: {quantity}</Badge>
                            {size && <Badge variant="outline" className="text-xs">{size}</Badge>}
                            {color && <Badge variant="outline" className="text-xs">{color}</Badge>}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit price</span>
                          <span>{formatINR(pricing.unitPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>× {quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatINR(pricing.subtotal)}</span>
                        </div>
                        {selectedTurnaround && selectedTurnaround.price_multiplier > 1 && (
                          <div className="flex justify-between text-amber-600">
                            <span>Rush fee ({selectedTurnaround.label})</span>
                            <span>+{formatINR(pricing.turnaroundFee)}</span>
                          </div>
                        )}
                        {pricing.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              Bulk discount ({pricing.discountPercent}%)
                            </span>
                            <span>-{formatINR(pricing.discount)}</span>
                          </div>
                        )}
                        
                        <div className="border-t border-border pt-3 mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-base">Total</span>
                            <span className="font-bold text-xl">{formatINR(pricing.total)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Inclusive of all taxes
                          </p>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      {selectedTurnaround && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">Estimated delivery</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedTurnaround.days} business days after approval
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button 
                        onClick={handleSubmit} 
                        className="w-full mt-6 h-14 text-base font-semibold" 
                        size="lg" 
                        disabled={submitting || !customerName}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Place Order
                            <ChevronRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-4">
                        By placing this order, you agree to our terms of service
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">No product selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a product above to see pricing
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}