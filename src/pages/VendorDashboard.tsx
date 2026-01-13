import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Package, DollarSign, Settings, User, ChevronRight, 
  Clock, CheckCircle, Printer, Truck, X, FileText, Phone, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { fetchAllOrders, updateOrderStatus } from '@/lib/api';
import { Order, formatINR } from '@/lib/types';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-500', icon: Package },
  accepted: { label: 'Accepted', color: 'bg-yellow-500', icon: Clock },
  printing: { label: 'Printing', color: 'bg-purple-500', icon: Printer },
  ready: { label: 'Ready', color: 'bg-green-500', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-gray-500', icon: Truck },
};

type Tab = 'orders' | 'capabilities' | 'profile';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentVendor, isVendorLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isVendorLoggedIn) {
      navigate('/vendor/login');
      return;
    }
    loadOrders();
  }, [isVendorLoggedIn, navigate]);

  const loadOrders = async () => {
    try {
      const allOrders = await fetchAllOrders();
      // Filter orders for this vendor or demo vendor
      const vendorOrders = allOrders.filter(o => 
        o.vendor_id === currentVendor?.id || 
        (currentVendor?.email === 'demo@vendor.com')
      );
      setOrders(vendorOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      if (newStatus === 'ready') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast({ title: "Order Ready! 🎉", description: "Customer has been notified" });
      } else {
        toast({ title: "Status Updated", description: `Order marked as ${newStatus}` });
      }

      // Refresh orders
      await loadOrders();
      
      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    }
  };

  const getNextStatus = (current: Order['status']): Order['status'] | null => {
    const flow: Order['status'][] = ['new', 'accepted', 'printing', 'ready', 'completed'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getStatusAction = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'Accept Order';
      case 'accepted': return 'Start Printing';
      case 'printing': return 'Mark as Ready';
      case 'ready': return 'Complete';
      default: return null;
    }
  };

  if (!isVendorLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {currentVendor?.name?.charAt(0) || 'V'}
              </div>
              <div>
                <p className="font-semibold">{currentVendor?.name}</p>
                <p className="text-xs text-muted-foreground">{currentVendor?.city}</p>
              </div>
            </div>
            {currentVendor?.onboarding_complete && (
              <Badge className="mt-3" variant="secondary">✓ Onboarding Complete</Badge>
            )}
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'orders' as Tab, icon: Package, label: 'Orders', count: orders.filter(o => o.status === 'new').length },
              { id: 'capabilities' as Tab, icon: Settings, label: 'Capabilities' },
              { id: 'profile' as Tab, icon: User, label: 'Profile' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && item.count > 0 && (
                  <Badge variant={activeTab === item.id ? 'secondary' : 'default'} className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border z-50">
          <div className="flex">
            {[
              { id: 'orders' as Tab, icon: Package },
              { id: 'capabilities' as Tab, icon: Settings },
              { id: 'profile' as Tab, icon: User },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 ${
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs capitalize">{item.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          <div className="p-6 md:p-8">
            {activeTab === 'orders' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Orders</h1>
                
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = orders.filter(o => o.status === status).length;
                    return (
                      <Badge key={status} variant="outline" className="gap-2">
                        <span className={`w-2 h-2 rounded-full ${config.color}`} />
                        {config.label} ({count})
                      </Badge>
                    );
                  })}
                </div>

                {/* Orders List */}
                {loading ? (
                  <div className="text-center py-10 text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No orders yet</div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const config = STATUS_CONFIG[order.status];
                      const firstItem = order.order_items?.[0];
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedOrder(order)}
                          className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center`}>
                              <config.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold truncate">{order.customer_name}</p>
                                <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {firstItem?.product_name || 'Order'} × {firstItem?.quantity || 1}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatINR(order.total_price)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'capabilities' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Capabilities</h1>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-3">Print Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVendor?.capabilities?.map(c => (
                        <Badge key={c} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVendor?.categories?.map(c => (
                        <Badge key={c} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Profile</h1>
                <div className="bg-card rounded-xl border border-border p-6 max-w-md">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Business Name</p>
                      <p className="font-medium">{currentVendor?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{currentVendor?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{currentVendor?.city}</p>
                      <p className="text-sm text-muted-foreground">{currentVendor?.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Order Detail Drawer */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setSelectedOrder(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border z-50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <Badge className={`${STATUS_CONFIG[selectedOrder.status].color} text-white`}>
                      {STATUS_CONFIG[selectedOrder.status].label}
                    </Badge>
                  </div>

                  {/* Customer */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold mb-3">Customer</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {selectedOrder.customer_name}
                      </p>
                      {selectedOrder.customer_phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {selectedOrder.customer_phone}
                        </p>
                      )}
                      {selectedOrder.customer_email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {selectedOrder.customer_email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    {selectedOrder.order_items?.map((item, i) => (
                      <div key={i} className="space-y-1 text-sm">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-muted-foreground">
                          {item.quantity} × {item.size} / {item.color}
                        </p>
                        <p className="text-muted-foreground">
                          {item.print_type} • {item.placement}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* File & Notes */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold mb-3">Design File</h3>
                    <p className="flex items-center gap-2 text-sm text-primary">
                      <FileText className="h-4 w-4" />
                      {selectedOrder.file_url || 'No file uploaded'}
                    </p>
                    {selectedOrder.notes && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-medium mb-1">Notes</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Timeline</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_timeline?.map((ts, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[ts.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-400'}`} />
                          <span className="capitalize">{ts.status}</span>
                          <span className="text-muted-foreground">
                            {new Date(ts.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-semibold mb-6 p-4 bg-primary/5 rounded-xl">
                    <span>Total</span>
                    <span>{formatINR(selectedOrder.total_price)}</span>
                  </div>

                  {/* Action Button */}
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        const next = getNextStatus(selectedOrder.status);
                        if (next) handleUpdateStatus(selectedOrder.id, next);
                      }}
                    >
                      {getStatusAction(selectedOrder.status)}
                    </Button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
