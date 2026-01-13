-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  address TEXT,
  capabilities TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  rush_fee NUMERIC DEFAULT 25,
  turnaround_days INTEGER DEFAULT 3,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor pricing table
CREATE TABLE public.vendor_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  product_type TEXT NOT NULL,
  print_type TEXT NOT NULL,
  price_1_to_10 NUMERIC DEFAULT 0,
  price_11_to_50 NUMERIC DEFAULT 0,
  price_51_to_200 NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  supported_print_types TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  turnaround TEXT DEFAULT '2-3 Days',
  image TEXT DEFAULT '👕',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  notes TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'printing', 'ready', 'completed')),
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  print_type TEXT,
  placement TEXT DEFAULT 'Front',
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order timeline table
CREATE TABLE public.order_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table for social feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  username TEXT NOT NULL DEFAULT 'anonymous',
  user_avatar TEXT DEFAULT '👤',
  content TEXT NOT NULL,
  media TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  pod_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  pod_print_type TEXT,
  pod_design_preview TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Posts: Public read, authenticated write
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update post likes" ON public.posts FOR UPDATE USING (true);

-- Vendors: Public read for catalog, owner manages own vendor
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Anyone can create vendors" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can update own profile" ON public.vendors FOR UPDATE USING (true);

-- Vendor pricing: Public read
CREATE POLICY "Anyone can view vendor pricing" ON public.vendor_pricing FOR SELECT USING (true);
CREATE POLICY "Anyone can manage vendor pricing" ON public.vendor_pricing FOR ALL USING (true);

-- Orders: Vendors see their orders, customers can create
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

-- Order items: Same as orders
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Order timeline: Public read, system creates
CREATE POLICY "Anyone can view order timeline" ON public.order_timeline FOR SELECT USING (true);
CREATE POLICY "Anyone can create order timeline" ON public.order_timeline FOR INSERT WITH CHECK (true);

-- Insert seed products (with INR prices)
INSERT INTO public.products (name, category, base_price, supported_print_types, sizes, colors, turnaround, image) VALUES
  ('Classic Cotton Tee', 'T-Shirts', 299, ARRAY['DTF', 'DTG', 'Screen Print'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'], '2-3 Days', '👕'),
  ('Premium Hoodie', 'Hoodies', 899, ARRAY['DTF', 'DTG', 'Embroidery'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Gray', 'Navy'], '2-3 Days', '🧥'),
  ('Ceramic Mug 11oz', 'Mugs', 249, ARRAY['Sublimation', 'UV Print'], ARRAY['11oz', '15oz'], ARRAY['White'], '24 Hours', '☕'),
  ('Die-Cut Sticker', 'Stickers', 49, ARRAY['Vinyl', 'UV Print'], ARRAY['2"', '3"', '4"', '5"'], ARRAY['Full Color'], 'Same Day', '🏷️'),
  ('Glossy Poster', 'Posters', 399, ARRAY['UV Print', 'Sublimation'], ARRAY['12x18"', '18x24"', '24x36"'], ARRAY['Full Color'], '24 Hours', '🖼️'),
  ('Snapback Cap', 'Caps', 499, ARRAY['Embroidery', 'DTF'], ARRAY['One Size', 'Adjustable'], ARRAY['Black', 'White', 'Navy'], '2-3 Days', '🧢'),
  ('Business Cards 100pk', 'Business Cards', 599, ARRAY['UV Print'], ARRAY['Standard', 'Square'], ARRAY['Full Color'], 'Same Day', '📇'),
  ('Athletic Performance Tee', 'T-Shirts', 449, ARRAY['DTF', 'Sublimation'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Black', 'Blue'], '2-3 Days', '👕'),
  ('Zip-Up Hoodie', 'Hoodies', 1199, ARRAY['DTF', 'Embroidery'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Black', 'Gray'], '5-7 Days', '🧥'),
  ('Travel Mug 16oz', 'Mugs', 399, ARRAY['Sublimation'], ARRAY['16oz'], ARRAY['White', 'Black'], '24 Hours', '🥤'),
  ('Vinyl Sticker Sheet', 'Stickers', 199, ARRAY['Vinyl'], ARRAY['A4', 'A5'], ARRAY['Full Color'], 'Same Day', '📋'),
  ('Canvas Print', 'Posters', 1499, ARRAY['UV Print'], ARRAY['16x20"', '20x24"', '24x30"'], ARRAY['Full Color'], '5-7 Days', '🎨');

-- Insert demo vendor
INSERT INTO public.vendors (name, email, city, address, capabilities, categories, rush_fee, turnaround_days, onboarding_complete) VALUES
  ('PrintMaster Pro', 'demo@vendor.com', 'Mumbai', '123 Print Street, Mumbai 400001', ARRAY['DTF', 'DTG', 'Screen Print', 'Sublimation'], ARRAY['T-Shirts', 'Hoodies', 'Mugs', 'Posters'], 500, 3, true);

-- Insert sample posts with INR prices
INSERT INTO public.posts (username, user_avatar, content, likes, comments, reposts, pod_product_id, pod_print_type, pod_design_preview) 
SELECT 'creativestudio', '🎨', 'Just finished this amazing custom merch for our summer collection! Love how the colors pop 🔥', 156, 23, 12, id, 'DTF', '🌴'
FROM public.products WHERE name = 'Classic Cotton Tee' LIMIT 1;

INSERT INTO public.posts (username, user_avatar, content, likes, comments, reposts) VALUES
  ('startupgrind', '🚀', 'Building in public is the best way to grow. Our new company swag just arrived and the team loves it!', 89, 15, 8),
  ('designdaily', '✏️', 'Typography tip: Always consider the print medium. What looks great on screen might need adjustments for DTG printing.', 234, 45, 67);

INSERT INTO public.posts (username, user_avatar, content, likes, comments, reposts, pod_product_id, pod_print_type, pod_design_preview) 
SELECT 'merchmaster', '👕', 'New hoodie drop! Limited edition with custom embroidery. Only 50 pieces available.', 412, 89, 34, id, 'Embroidery', '⭐'
FROM public.products WHERE name = 'Premium Hoodie' LIMIT 1;

INSERT INTO public.posts (username, user_avatar, content, likes, comments, reposts, pod_product_id, pod_print_type, pod_design_preview) 
SELECT 'coffeehouse', '☕', 'Custom mugs for our café just arrived! The sublimation quality is incredible. Now taking orders for custom designs.', 178, 32, 14, id, 'Sublimation', '☕'
FROM public.products WHERE name = 'Ceramic Mug 11oz' LIMIT 1;

INSERT INTO public.posts (username, user_avatar, content, likes, comments, reposts) VALUES
  ('eventpro', '🎪', 'Event season is here! Just ordered 500 custom stickers for the conference. Same-day turnaround is a game changer.', 67, 11, 5),
  ('artgallery', '🖼️', 'Our latest exhibition features limited edition canvas prints. Each piece tells a unique story.', 298, 56, 23),
  ('teamspirit', '🏆', 'Championship caps are ready! Custom embroidered with our team logo. The quality is outstanding!', 145, 28, 9),
  ('brandbuilder', '🏢', 'Just refreshed all our business cards with the new brand identity. UV printing gives such a premium feel!', 82, 17, 6),
  ('fashionforward', '👗', 'Launching our athleisure line next week! Performance tees with custom sublimation designs.', 567, 123, 78);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();