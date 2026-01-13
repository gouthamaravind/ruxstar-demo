// Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  password: string;
  city: string;
  address: string;
  capabilities: string[];
  categories: string[];
  pricingTable: PricingEntry[];
  rushFee: number;
  turnaroundDays: number;
  onboardingComplete: boolean;
}

export interface PricingEntry {
  productType: string;
  printType: string;
  price1to10: number;
  price11to50: number;
  price51to200: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  supportedPrintTypes: string[];
  sizes: string[];
  colors: string[];
  turnaround: string;
  image: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  size: string;
  color: string;
  printType: string;
  placement: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  notes: string;
  fileUrl: string;
  status: 'new' | 'accepted' | 'printing' | 'ready' | 'completed';
  timestamps: { status: string; time: string }[];
  totalPrice: number;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  media: string[];
  likes: number;
  comments: number;
  reposts: number;
  timestamp: string;
  podAttachment?: {
    productId: string;
    productName: string;
    printType: string;
    designPreview: string;
    price: number;
  };
}

// Constants
export const PRINT_TYPES = ['DTF', 'DTG', 'Screen Print', 'Sublimation', 'UV Print', 'Embroidery', 'Vinyl'];
export const CATEGORIES = ['T-Shirts', 'Hoodies', 'Mugs', 'Stickers', 'Posters', 'Caps', 'Business Cards'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const COLORS = ['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'];
export const PLACEMENTS = ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Full Body'];
export const TURNAROUNDS = ['Same Day', '24 Hours', '2-3 Days', '5-7 Days'];

// Initial mock data
const initialVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'PrintMaster Pro',
    email: 'demo@vendor.com',
    password: 'demo123',
    city: 'Los Angeles',
    address: '123 Print Street, LA 90001',
    capabilities: ['DTF', 'DTG', 'Screen Print', 'Sublimation'],
    categories: ['T-Shirts', 'Hoodies', 'Mugs', 'Posters'],
    pricingTable: [
      { productType: 'T-Shirts', printType: 'DTF', price1to10: 15, price11to50: 12, price51to200: 9 },
      { productType: 'T-Shirts', printType: 'DTG', price1to10: 18, price11to50: 14, price51to200: 11 },
      { productType: 'Hoodies', printType: 'DTF', price1to10: 35, price11to50: 28, price51to200: 22 },
      { productType: 'Mugs', printType: 'Sublimation', price1to10: 12, price11to50: 9, price51to200: 7 },
    ],
    rushFee: 25,
    turnaroundDays: 3,
    onboardingComplete: true,
  },
];

const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Classic Cotton Tee', category: 'T-Shirts', basePrice: 12, supportedPrintTypes: ['DTF', 'DTG', 'Screen Print'], sizes: SIZES, colors: COLORS, turnaround: '2-3 Days', image: '👕' },
  { id: 'prod-2', name: 'Premium Hoodie', category: 'Hoodies', basePrice: 28, supportedPrintTypes: ['DTF', 'DTG', 'Embroidery'], sizes: SIZES.slice(1, 5), colors: ['Black', 'Gray', 'Navy'], turnaround: '2-3 Days', image: '🧥' },
  { id: 'prod-3', name: 'Ceramic Mug 11oz', category: 'Mugs', basePrice: 8, supportedPrintTypes: ['Sublimation', 'UV Print'], sizes: ['11oz', '15oz'], colors: ['White'], turnaround: '24 Hours', image: '☕' },
  { id: 'prod-4', name: 'Die-Cut Sticker', category: 'Stickers', basePrice: 2, supportedPrintTypes: ['Vinyl', 'UV Print'], sizes: ['2"', '3"', '4"', '5"'], colors: ['Full Color'], turnaround: 'Same Day', image: '🏷️' },
  { id: 'prod-5', name: 'Glossy Poster', category: 'Posters', basePrice: 15, supportedPrintTypes: ['UV Print', 'Sublimation'], sizes: ['12x18"', '18x24"', '24x36"'], colors: ['Full Color'], turnaround: '24 Hours', image: '🖼️' },
  { id: 'prod-6', name: 'Snapback Cap', category: 'Caps', basePrice: 18, supportedPrintTypes: ['Embroidery', 'DTF'], sizes: ['One Size', 'Adjustable'], colors: ['Black', 'White', 'Navy'], turnaround: '2-3 Days', image: '🧢' },
  { id: 'prod-7', name: 'Business Cards 100pk', category: 'Business Cards', basePrice: 25, supportedPrintTypes: ['UV Print'], sizes: ['Standard', 'Square'], colors: ['Full Color'], turnaround: 'Same Day', image: '📇' },
  { id: 'prod-8', name: 'Athletic Performance Tee', category: 'T-Shirts', basePrice: 16, supportedPrintTypes: ['DTF', 'Sublimation'], sizes: SIZES, colors: ['White', 'Black', 'Blue'], turnaround: '2-3 Days', image: '👕' },
  { id: 'prod-9', name: 'Zip-Up Hoodie', category: 'Hoodies', basePrice: 35, supportedPrintTypes: ['DTF', 'Embroidery'], sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Gray'], turnaround: '5-7 Days', image: '🧥' },
  { id: 'prod-10', name: 'Travel Mug 16oz', category: 'Mugs', basePrice: 14, supportedPrintTypes: ['Sublimation'], sizes: ['16oz'], colors: ['White', 'Black'], turnaround: '24 Hours', image: '🥤' },
  { id: 'prod-11', name: 'Vinyl Sticker Sheet', category: 'Stickers', basePrice: 8, supportedPrintTypes: ['Vinyl'], sizes: ['A4', 'A5'], colors: ['Full Color'], turnaround: 'Same Day', image: '📋' },
  { id: 'prod-12', name: 'Canvas Print', category: 'Posters', basePrice: 45, supportedPrintTypes: ['UV Print'], sizes: ['16x20"', '20x24"', '24x30"'], colors: ['Full Color'], turnaround: '5-7 Days', image: '🎨' },
];

const initialOrders: Order[] = [
  {
    id: 'order-1',
    vendorId: 'vendor-1',
    customerName: 'John Smith',
    customerPhone: '+1 555-0101',
    customerEmail: 'john@example.com',
    items: [{ productId: 'prod-1', productName: 'Classic Cotton Tee', quantity: 25, size: 'L', color: 'Black', printType: 'DTF', placement: 'Front', unitPrice: 12 }],
    notes: 'Please use matte finish, center aligned',
    fileUrl: 'design-001.png',
    status: 'new',
    timestamps: [{ status: 'new', time: new Date().toISOString() }],
    totalPrice: 300,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    vendorId: 'vendor-1',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 555-0102',
    customerEmail: 'sarah@example.com',
    items: [{ productId: 'prod-2', productName: 'Premium Hoodie', quantity: 10, size: 'M', color: 'Gray', printType: 'DTG', placement: 'Back', unitPrice: 28 }],
    notes: 'Rush order - need by Friday',
    fileUrl: 'design-002.png',
    status: 'accepted',
    timestamps: [{ status: 'new', time: new Date(Date.now() - 86400000).toISOString() }, { status: 'accepted', time: new Date().toISOString() }],
    totalPrice: 280,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'order-3',
    vendorId: 'vendor-1',
    customerName: 'Mike Chen',
    customerPhone: '+1 555-0103',
    customerEmail: 'mike@example.com',
    items: [{ productId: 'prod-3', productName: 'Ceramic Mug 11oz', quantity: 50, size: '11oz', color: 'White', printType: 'Sublimation', placement: 'Front', unitPrice: 8 }],
    notes: 'Company logo mugs for office',
    fileUrl: 'design-003.png',
    status: 'printing',
    timestamps: [
      { status: 'new', time: new Date(Date.now() - 172800000).toISOString() },
      { status: 'accepted', time: new Date(Date.now() - 86400000).toISOString() },
      { status: 'printing', time: new Date().toISOString() },
    ],
    totalPrice: 400,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'order-4',
    vendorId: 'vendor-1',
    customerName: 'Emily Davis',
    customerPhone: '+1 555-0104',
    customerEmail: 'emily@example.com',
    items: [{ productId: 'prod-4', productName: 'Die-Cut Sticker', quantity: 200, size: '3"', color: 'Full Color', printType: 'Vinyl', placement: 'Front', unitPrice: 2 }],
    notes: 'Event stickers - please use glossy vinyl',
    fileUrl: 'design-004.png',
    status: 'ready',
    timestamps: [
      { status: 'new', time: new Date(Date.now() - 259200000).toISOString() },
      { status: 'accepted', time: new Date(Date.now() - 172800000).toISOString() },
      { status: 'printing', time: new Date(Date.now() - 86400000).toISOString() },
      { status: 'ready', time: new Date().toISOString() },
    ],
    totalPrice: 400,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'order-5',
    vendorId: 'vendor-1',
    customerName: 'Alex Wilson',
    customerPhone: '+1 555-0105',
    customerEmail: 'alex@example.com',
    items: [{ productId: 'prod-5', productName: 'Glossy Poster', quantity: 5, size: '24x36"', color: 'Full Color', printType: 'UV Print', placement: 'Front', unitPrice: 15 }],
    notes: 'Art prints for gallery',
    fileUrl: 'design-005.png',
    status: 'completed',
    timestamps: [
      { status: 'new', time: new Date(Date.now() - 432000000).toISOString() },
      { status: 'accepted', time: new Date(Date.now() - 345600000).toISOString() },
      { status: 'printing', time: new Date(Date.now() - 259200000).toISOString() },
      { status: 'ready', time: new Date(Date.now() - 172800000).toISOString() },
      { status: 'completed', time: new Date(Date.now() - 86400000).toISOString() },
    ],
    totalPrice: 75,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'order-6',
    vendorId: 'vendor-1',
    customerName: 'Lisa Brown',
    customerPhone: '+1 555-0106',
    customerEmail: 'lisa@example.com',
    items: [{ productId: 'prod-6', productName: 'Snapback Cap', quantity: 15, size: 'One Size', color: 'Navy', printType: 'Embroidery', placement: 'Front', unitPrice: 18 }],
    notes: 'Team caps with embroidered logo',
    fileUrl: 'design-006.png',
    status: 'new',
    timestamps: [{ status: 'new', time: new Date().toISOString() }],
    totalPrice: 270,
    createdAt: new Date().toISOString(),
  },
];

const initialPosts: Post[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    username: 'creativestudio',
    userAvatar: '🎨',
    content: 'Just finished this amazing custom merch for our summer collection! Love how the colors pop 🔥',
    media: [],
    likes: 156,
    comments: 23,
    reposts: 12,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    podAttachment: {
      productId: 'prod-1',
      productName: 'Classic Cotton Tee',
      printType: 'DTF',
      designPreview: '🌴',
      price: 12,
    },
  },
  {
    id: 'post-2',
    userId: 'user-2',
    username: 'startupgrind',
    userAvatar: '🚀',
    content: 'Building in public is the best way to grow. Our new company swag just arrived and the team loves it!',
    media: [],
    likes: 89,
    comments: 15,
    reposts: 8,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'post-3',
    userId: 'user-3',
    username: 'designdaily',
    userAvatar: '✏️',
    content: 'Typography tip: Always consider the print medium. What looks great on screen might need adjustments for DTG printing.',
    media: [],
    likes: 234,
    comments: 45,
    reposts: 67,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'post-4',
    userId: 'user-4',
    username: 'merchmaster',
    userAvatar: '👕',
    content: 'New hoodie drop! Limited edition with custom embroidery. Only 50 pieces available.',
    media: [],
    likes: 412,
    comments: 89,
    reposts: 34,
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    podAttachment: {
      productId: 'prod-2',
      productName: 'Premium Hoodie',
      printType: 'Embroidery',
      designPreview: '⭐',
      price: 28,
    },
  },
  {
    id: 'post-5',
    userId: 'user-5',
    username: 'coffeehouse',
    userAvatar: '☕',
    content: 'Custom mugs for our café just arrived! The sublimation quality is incredible. Now taking orders for custom designs.',
    media: [],
    likes: 178,
    comments: 32,
    reposts: 14,
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    podAttachment: {
      productId: 'prod-3',
      productName: 'Ceramic Mug 11oz',
      printType: 'Sublimation',
      designPreview: '☕',
      price: 8,
    },
  },
  {
    id: 'post-6',
    userId: 'user-6',
    username: 'eventpro',
    userAvatar: '🎪',
    content: 'Event season is here! Just ordered 500 custom stickers for the conference. Same-day turnaround is a game changer.',
    media: [],
    likes: 67,
    comments: 11,
    reposts: 5,
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'post-7',
    userId: 'user-7',
    username: 'artgallery',
    userAvatar: '🖼️',
    content: 'Our latest exhibition features limited edition canvas prints. Each piece tells a unique story.',
    media: [],
    likes: 298,
    comments: 56,
    reposts: 23,
    timestamp: new Date(Date.now() - 57600000).toISOString(),
  },
  {
    id: 'post-8',
    userId: 'user-8',
    username: 'teamspirit',
    userAvatar: '🏆',
    content: 'Championship caps are ready! Custom embroidered with our team logo. The quality is outstanding!',
    media: [],
    likes: 145,
    comments: 28,
    reposts: 9,
    timestamp: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: 'post-9',
    userId: 'user-9',
    username: 'brandbuilder',
    userAvatar: '🏢',
    content: 'Just refreshed all our business cards with the new brand identity. UV printing gives such a premium feel!',
    media: [],
    likes: 82,
    comments: 17,
    reposts: 6,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'post-10',
    userId: 'user-10',
    username: 'fashionforward',
    userAvatar: '👗',
    content: 'Launching our athleisure line next week! Performance tees with custom sublimation designs.',
    media: [],
    likes: 567,
    comments: 123,
    reposts: 78,
    timestamp: new Date(Date.now() - 100800000).toISOString(),
  },
];

// Storage keys
const STORAGE_KEYS = {
  vendors: 'ruxstar_vendors',
  products: 'ruxstar_products',
  orders: 'ruxstar_orders',
  posts: 'ruxstar_posts',
  appMode: 'ruxstar_mode',
  currentVendor: 'ruxstar_current_vendor',
};

// Initialize mock data
export function initializeMockData() {
  if (!localStorage.getItem(STORAGE_KEYS.vendors)) {
    localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(initialVendors));
  }
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(initialOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.posts)) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(initialPosts));
  }
}

// Reset all data
export function resetMockData() {
  localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(initialVendors));
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(initialProducts));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(initialOrders));
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(initialPosts));
  localStorage.removeItem(STORAGE_KEYS.currentVendor);
  localStorage.setItem(STORAGE_KEYS.appMode, 'pod');
}

// CRUD operations
export function getVendors(): Vendor[] {
  const data = localStorage.getItem(STORAGE_KEYS.vendors);
  return data ? JSON.parse(data) : [];
}

export function saveVendors(vendors: Vendor[]) {
  localStorage.setItem(STORAGE_KEYS.vendors, JSON.stringify(vendors));
}

export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEYS.products);
  return data ? JSON.parse(data) : [];
}

export function getOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.orders);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

export function getPosts(): Post[] {
  const data = localStorage.getItem(STORAGE_KEYS.posts);
  return data ? JSON.parse(data) : [];
}

export function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

export function getAppMode(): 'social' | 'pod' {
  return (localStorage.getItem(STORAGE_KEYS.appMode) as 'social' | 'pod') || 'pod';
}

export function setAppMode(mode: 'social' | 'pod') {
  localStorage.setItem(STORAGE_KEYS.appMode, mode);
}

export function getCurrentVendor(): Vendor | null {
  const data = localStorage.getItem(STORAGE_KEYS.currentVendor);
  return data ? JSON.parse(data) : null;
}

export function setCurrentVendor(vendor: Vendor | null) {
  if (vendor) {
    localStorage.setItem(STORAGE_KEYS.currentVendor, JSON.stringify(vendor));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentVendor);
  }
}
