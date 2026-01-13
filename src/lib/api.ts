import { supabase } from '@/integrations/supabase/client';
import { Product, Vendor, VendorPricing, Order, OrderItem, OrderTimeline, Post, TurnaroundOption, QuantitySlab, Addon } from './types';

// Helper to transform DB product to typed Product
function transformProduct(data: any): Product {
  return {
    ...data,
    turnaround_options: (data.turnaround_options || []) as TurnaroundOption[],
    quantity_slabs: (data.quantity_slabs || []) as QuantitySlab[],
    addons: (data.addons || []) as Addon[],
  };
}

// Products
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return (data || []).map(transformProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data ? transformProduct(data) : null;
}

// Vendors
export async function fetchVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function fetchVendorByEmail(email: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function fetchVendorById(id: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function createVendor(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .insert(vendor)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Vendor Pricing
export async function fetchVendorPricing(vendorId: string): Promise<VendorPricing[]> {
  const { data, error } = await supabase
    .from('vendor_pricing')
    .select('*')
    .eq('vendor_id', vendorId);
  
  if (error) throw error;
  return data || [];
}

export async function upsertVendorPricing(pricing: Omit<VendorPricing, 'id' | 'created_at'>[]): Promise<void> {
  const { error } = await supabase
    .from('vendor_pricing')
    .upsert(pricing as any, { onConflict: 'vendor_id,product_type,print_type' });
  
  if (error) throw error;
}

// Orders
export async function fetchOrdersByVendor(vendorId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_timeline (*)
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as Order[];
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_timeline (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as Order[];
}

export async function createOrder(order: {
  vendor_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  notes?: string;
  file_url?: string;
  total_price: number;
}): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...order, status: 'new' })
    .select()
    .single();
  
  if (error) throw error;
  
  // Add initial timeline entry
  await supabase.from('order_timeline').insert({
    order_id: data.id,
    status: 'new'
  });
  
  return data as Order;
}

export async function createOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('order_items')
    .insert(item as any)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  
  if (updateError) throw updateError;
  
  // Add timeline entry
  const { error: timelineError } = await supabase
    .from('order_timeline')
    .insert({
      order_id: orderId,
      status
    });
  
  if (timelineError) throw timelineError;
}

// Posts
export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      products (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []).map((post: any) => ({
    ...post,
    products: post.products ? transformProduct(post.products) : undefined,
  })) as Post[];
}

export async function createPost(post: {
  username: string;
  user_avatar?: string;
  content: string;
  media?: string[];
  pod_product_id?: string;
  pod_print_type?: string;
  pod_design_preview?: string;
}): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePostLikes(postId: string, likes: number): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ likes })
    .eq('id', postId);
  
  if (error) throw error;
}
