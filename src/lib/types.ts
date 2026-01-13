// Types matching Supabase schema
export interface Vendor {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  city: string | null;
  address: string | null;
  capabilities: string[];
  categories: string[];
  rush_fee: number;
  turnaround_days: number;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorPricing {
  id: string;
  vendor_id: string;
  product_type: string;
  print_type: string;
  price_1_to_10: number;
  price_11_to_50: number;
  price_51_to_200: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
  supported_print_types: string[];
  sizes: string[];
  colors: string[];
  turnaround: string;
  image: string;
  active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  size: string | null;
  color: string | null;
  print_type: string | null;
  placement: string;
  unit_price: number;
  created_at: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  timestamp: string;
}

export interface Order {
  id: string;
  vendor_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  file_url: string | null;
  status: 'new' | 'accepted' | 'printing' | 'ready' | 'completed';
  total_price: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_timeline?: OrderTimeline[];
}

export interface Post {
  id: string;
  user_id: string | null;
  username: string;
  user_avatar: string;
  content: string;
  media: string[];
  likes: number;
  comments: number;
  reposts: number;
  pod_product_id: string | null;
  pod_print_type: string | null;
  pod_design_preview: string | null;
  created_at: string;
  products?: Product;
}

// Constants
export const PRINT_TYPES = ['DTF', 'DTG', 'Screen Print', 'Sublimation', 'UV Print', 'Embroidery', 'Vinyl'];
export const CATEGORIES = ['T-Shirts', 'Hoodies', 'Mugs', 'Stickers', 'Posters', 'Caps', 'Business Cards'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const COLORS = ['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'];
export const PLACEMENTS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Full Body'];
export const TURNAROUNDS = ['Same Day', '24 Hours', '2-3 Days', '5-7 Days'];

// Currency formatter for INR
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Local storage keys for vendor session (until auth is implemented)
const CURRENT_VENDOR_KEY = 'ruxstar_current_vendor';

export function getCurrentVendorLocal(): Vendor | null {
  const data = localStorage.getItem(CURRENT_VENDOR_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentVendorLocal(vendor: Vendor | null) {
  if (vendor) {
    localStorage.setItem(CURRENT_VENDOR_KEY, JSON.stringify(vendor));
  } else {
    localStorage.removeItem(CURRENT_VENDOR_KEY);
  }
}
