-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE promotion_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  gallery_urls TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  type promotion_type NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_neighborhood TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_zipcode TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  promotion_code TEXT,
  payment_method TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  customizations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for website visitors)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);

-- Create policies for admin access (authenticated users for now - will refine with roles later)
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage testimonials" ON public.testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage promotions" ON public.promotions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage site settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for customer orders (customers can create orders)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_popular ON public.products(is_popular);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_promotions_code ON public.promotions(code);
CREATE INDEX idx_promotions_is_active ON public.promotions(is_active);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);

-- Create storage policies
CREATE POLICY "Product images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');
CREATE POLICY "Category images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload banner images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update banner images" ON storage.objects FOR UPDATE USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete banner images" ON storage.objects FOR DELETE USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'category-images' AND auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.categories (name, description, is_active, sort_order) VALUES
('Açaí', 'Açaí tradicional e especiais', true, 1),
('Smoothies', 'Smoothies com açaí e frutas', true, 2),
('Vitaminas', 'Vitaminas nutritivas com açaí', true, 3),
('Sobremesas', 'Sobremesas geladas e especiais', true, 4);

INSERT INTO public.site_settings (key, value, type, description) VALUES
('site_title', 'Kija Açaí', 'text', 'Título do site'),
('site_description', 'O melhor açaí artesanal da cidade', 'text', 'Descrição do site'),
('delivery_fee', '5.00', 'number', 'Taxa de entrega padrão'),
('free_delivery_minimum', '25.00', 'number', 'Valor mínimo para frete grátis'),
('opening_hours', 'Segunda à Domingo: 10h às 22h', 'text', 'Horário de funcionamento'),
('phone', '(11) 99999-9999', 'text', 'Telefone de contato'),
('whatsapp', '5511999999999', 'text', 'WhatsApp para contato'),
('instagram', '@kijaacai', 'text', 'Instagram'),
('facebook', 'kijaacai', 'text', 'Facebook');

INSERT INTO public.testimonials (customer_name, rating, comment, is_featured, is_active) VALUES
('Maria Silva', 5, 'O melhor açaí que já experimentei! Cremoso e saboroso, entrega sempre rápida.', true, true),
('João Santos', 5, 'Adoro o açaí com granola deles. Sempre fresco e com ingredientes de qualidade.', true, true),
('Ana Costa', 4, 'Muito bom! O sabor é único e o atendimento é excelente. Recomendo!', true, true);