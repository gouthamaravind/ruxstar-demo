-- Add new columns to products table for comprehensive attributes
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variant_type text,
ADD COLUMN IF NOT EXISTS materials text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gsm text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS finish text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lamination text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS print_sides text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS turnaround_options jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS addons jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS quantity_slabs jsonb DEFAULT '[]';

-- Create index for better filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_variant_type ON public.products(variant_type);