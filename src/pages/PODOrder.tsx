import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getProducts, getOrders, saveOrders, PLACEMENTS, Order, OrderItem } from '@/lib/mockData';

export default function PODOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const products = getProducts();
  
  const preselectedProductId = searchParams.get('product') || '';
  
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [printType, setPrintType] = useState('');
  const [placement, setPlacement] = useState('Front');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedProduct) return { base: 0, print: 0, discount: 0, total: 0 };
    
    const basePrice = selectedProduct.basePrice;
    const printFee = printType ? 5 : 0; // Mock print fee
    const subtotal = (basePrice + printFee) * quantity;
    
    // Quantity discounts
    let discountPercent = 0;
    if (quantity >= 51) discountPercent = 20;
    else if (quantity >= 11) discountPercent = 10;
    else if (quantity >= 5) discountPercent = 5;
    
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;
    
    return {
      base: basePrice * quantity,
      print: printFee * quantity,
      discount,
      discountPercent,
      total
    };
  }, [selectedProduct, quantity, printType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    if (!selectedProduct || !size || !color || !printType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      size,
      color,
      printType,
      placement,
      unitPrice: selectedProduct.basePrice,
    };

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      vendorId: 'vendor-1',
      customerName: 'Demo Customer',
      customerPhone: '+1 555-0199',
      customerEmail: 'customer@demo.com',
      items: [orderItem],
      notes,
      fileUrl: fileName || 'design.png',
      status: 'new',
      timestamps: [{ status: 'new', time: new Date().toISOString() }],
      totalPrice: pricing.total,
      createdAt: new Date().toISOString(),
    };

    const orders = getOrders();
    saveOrders([newOrder, ...orders]);

    toast({
      title: "Order Placed! 🎉",
      description: "Your mock order has been submitted to the vendor",
    });

    navigate('/pod');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">Order Configurator</h1>
            <p className="text-muted-foreground">Customize your print order</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Product *</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.image} {product.name} - ${product.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Size *</Label>
                  <Select value={size} onValueChange={setSize} disabled={!selectedProduct}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.sizes.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color *</Label>
                  <Select value={color} onValueChange={setColor} disabled={!selectedProduct}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.colors.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Print Type *</Label>
                  <Select value={printType} onValueChange={setPrintType} disabled={!selectedProduct}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select print type" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.supportedPrintTypes.map((pt) => (
                        <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Placement</Label>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-semibold mb-4">Design Upload</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="design-upload"
                  accept="image/*,.pdf,.ai,.psd"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="design-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  {fileName ? (
                    <p className="font-medium text-primary">{fileName}</p>
                  ) : (
                    <>
                      <p className="font-medium">Click to upload design</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, PDF, AI, PSD</p>
                    </>
                  )}
                </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <Textarea
                placeholder="E.g., Use matte finish, center aligned, specific color codes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </motion.div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card sticky top-24"
            >
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {selectedProduct ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4">
                    <span className="text-3xl">{selectedProduct.image}</span>
                    <div>
                      <p className="font-medium">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base price × {quantity}</span>
                      <span>${pricing.base.toFixed(2)}</span>
                    </div>
                    {pricing.print > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Print fee × {quantity}</span>
                        <span>${pricing.print.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Volume discount ({pricing.discountPercent}%)</span>
                        <span>-${pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button onClick={handleSubmit} className="w-full mt-6" size="lg">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order (Mock)
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    This is a demo. No real order will be placed.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Select a product to see pricing
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
