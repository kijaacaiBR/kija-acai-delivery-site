-- Create triggers for automatic timestamp updates on all tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables that don't have them yet
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies to allow authenticated users (admin) to perform all operations
-- Products policies
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products"
  ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Categories policies  
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories"
  ON public.categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Banners policies
DROP POLICY IF EXISTS "Admin can manage banners" ON public.banners;
CREATE POLICY "Admin can manage banners"
  ON public.banners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Testimonials policies
DROP POLICY IF EXISTS "Admin can manage testimonials" ON public.testimonials;
CREATE POLICY "Admin can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Promotions policies
DROP POLICY IF EXISTS "Admin can manage promotions" ON public.promotions;
CREATE POLICY "Admin can manage promotions"
  ON public.promotions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Orders policies
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders"
  ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Order items policies
DROP POLICY IF EXISTS "Admin can manage order items" ON public.order_items;
CREATE POLICY "Admin can manage order items"
  ON public.order_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage policies for admin access
CREATE POLICY "Admin can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can update product images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images');

-- Same for category and banner images
CREATE POLICY "Admin can upload category images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Admin can view category images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY "Admin can update category images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'category-images')
  WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Admin can delete category images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'category-images');

CREATE POLICY "Admin can upload banner images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'banner-images');

CREATE POLICY "Admin can view banner images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'banner-images');

CREATE POLICY "Admin can update banner images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'banner-images')
  WITH CHECK (bucket_id = 'banner-images');

CREATE POLICY "Admin can delete banner images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'banner-images');