-- Update RLS policies to remove auth restriction for admin operations
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

-- Create storage policies for public access (temporary for testing)
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can view product images" ON storage.objects;
CREATE POLICY "Admin can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images');

-- Same for category and banner images
DROP POLICY IF EXISTS "Admin can upload category images" ON storage.objects;
CREATE POLICY "Admin can upload category images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admin can view category images" ON storage.objects;
CREATE POLICY "Admin can view category images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admin can update category images" ON storage.objects;
CREATE POLICY "Admin can update category images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'category-images')
  WITH CHECK (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admin can delete category images" ON storage.objects;
CREATE POLICY "Admin can delete category images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'category-images');

DROP POLICY IF EXISTS "Admin can upload banner images" ON storage.objects;
CREATE POLICY "Admin can upload banner images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Admin can view banner images" ON storage.objects;
CREATE POLICY "Admin can view banner images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Admin can update banner images" ON storage.objects;
CREATE POLICY "Admin can update banner images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'banner-images')
  WITH CHECK (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Admin can delete banner images" ON storage.objects;
CREATE POLICY "Admin can delete banner images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'banner-images');