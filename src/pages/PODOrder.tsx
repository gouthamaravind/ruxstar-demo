import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchProducts, fetchVendors, createOrder, createOrderItem } from '@/lib/api';
import { Product, Vendor, PLACEMENTS, formatINR } from '@/lib/types';

export default function PODOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const preselectedProductId = searchParams.get('product') || '';
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [printType, setPrintType] = useState('');
  const [placement, setPlacement] = useState('Front');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    Promise.all([fetchProducts(), fetchVendors()]).then(([prods, vends]) => {
      setProducts(prods);
      setVendors(vends);
    }).finally(() => setLoading(false));
  }, []);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const pricing = useMemo(() => {
    if (!selectedProduct) return { base: 0, print: 0, discount: 0, total: 0, discountPercent: 0 };
    const basePrice = selectedProduct.base_price;
    const printFee = printType ? 100 : 0;
    const subtotal = (basePrice + printFee) * quantity;
    let discountPercent = 0;
    if (quantity >= 51) discountPercent = 20;
    else if (quantity >= 11) discountPercent = 10;
    else if (quantity >= 5) discountPercent = 5;
    const discount = subtotal * (discountPercent / 100);
    return { base: basePrice * quantity, print: printFee * quantity, discount, discountPercent, total: subtotal - discount };
  }, [selectedProduct, quantity, printType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !size || !color || !printType || !customerName) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const vendor = vendors[0]; // Use first available vendor
      const order = await createOrder({
        vendor_id: vendor?.id || '',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes,
        file_url: fileName || 'design.png',
        total_price: pricing.total,
      });

      await createOrderItem({
        order_id: order.id,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity,
        size,
        color,
        print_type: printType,
        placement,
        unit_price: selectedProduct.base_price,
      });

      toast({ title: "Order Placed! 🎉", description: "Your order has been submitted" });
      navigate('/pod');
    } catch (error) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Order Configurator</h1>
            <p className="text-muted-foreground">Customize your print order</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Your Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Name *</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" className="mt-1.5" /></div>
                <div><Label>Phone</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1.5" /></div>
                <div><Label>Email</Label><Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5" /></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Product *</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a product" /></SelectTrigger>
                    <SelectContent>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.image} {product.name} - {formatINR(product.base_price)}</SelectItem>)}</SelectContent></Select>
                </div>
                <div><Label>Quantity *</Label><Input type="number" min={1} max={500} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1.5" /></div>
                <div><Label>Size *</Label><Select value={size} onValueChange={setSize} disabled={!selectedProduct}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent>{selectedProduct?.sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Color *</Label><Select value={color} onValueChange={setColor} disabled={!selectedProduct}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select color" /></SelectTrigger><SelectContent>{selectedProduct?.colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Print Type *</Label><Select value={printType} onValueChange={setPrintType} disabled={!selectedProduct}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select print type" /></SelectTrigger><SelectContent>{selectedProduct?.supported_print_types.map((pt) => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Placement</Label><Select value={placement} onValueChange={setPlacement}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{PLACEMENTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Design Upload</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input type="file" id="design-upload" accept="image/*,.pdf,.ai,.psd" onChange={handleFileChange} className="hidden" />
                <label htmlFor="design-upload" className="cursor-pointer"><Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />{fileName ? <p className="font-medium text-primary">{fileName}</p> : <><p className="font-medium">Click to upload design</p><p className="text-sm text-muted-foreground mt-1">PNG, JPG, PDF, AI, PSD</p></>}</label>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <Textarea placeholder="E.g., Use matte finish, center aligned, specific color codes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-6 shadow-card sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              {selectedProduct ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-4"><span className="text-3xl">{selectedProduct.image}</span><div><p className="font-medium">{selectedProduct.name}</p><p className="text-sm text-muted-foreground">Qty: {quantity}</p></div></div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Base price × {quantity}</span><span>{formatINR(pricing.base)}</span></div>
                    {pricing.print > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Print fee × {quantity}</span><span>{formatINR(pricing.print)}</span></div>}
                    {pricing.discount > 0 && <div className="flex justify-between text-green-600"><span>Volume discount ({pricing.discountPercent}%)</span><span>-{formatINR(pricing.discount)}</span></div>}
                    <div className="border-t border-border pt-3 flex justify-between font-semibold text-base"><span>Total</span><span>{formatINR(pricing.total)}</span></div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full mt-6" size="lg" disabled={submitting}><ShoppingCart className="h-4 w-4 mr-2" />{submitting ? 'Placing Order...' : 'Place Order'}</Button>
                </>
              ) : <p className="text-muted-foreground text-center py-8">Select a product to see pricing</p>}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
