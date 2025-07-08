-- Insert sample products
INSERT INTO public.products (category_id, name, description, ingredients, price, original_price, image_url, is_popular, rating) VALUES
(
  (SELECT id FROM public.categories WHERE name = 'Açaí' LIMIT 1),
  'Açaí Tradicional 500ml',
  'Açaí puro batido na hora com xarope de guaraná. O clássico que você ama!',
  'Açaí puro, xarope de guaraná',
  15.90,
  18.90,
  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
  true,
  4.9
),
(
  (SELECT id FROM public.categories WHERE name = 'Smoothies' LIMIT 1),
  'Smoothie Tropical Mix',
  'Açaí com manga, banana e leite de coco. Uma explosão de sabores tropicais!',
  'Açaí, manga, banana, leite de coco',
  18.90,
  NULL,
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop&crop=center',
  true,
  4.8
),
(
  (SELECT id FROM public.categories WHERE name = 'Açaí' LIMIT 1),
  'Açaí Power 750ml',
  'Açaí com granola, banana, morango e mel. Perfeito para quem treina!',
  'Açaí, granola, banana, morango, mel',
  22.90,
  25.90,
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop&crop=center',
  false,
  4.7
),
(
  (SELECT id FROM public.categories WHERE name = 'Vitaminas' LIMIT 1),
  'Vitamina de Açaí',
  'Açaí batido com leite, banana e aveia. Nutritivo e delicioso!',
  'Açaí, leite, banana, aveia',
  16.90,
  NULL,
  'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop&crop=center',
  false,
  4.6
),
(
  (SELECT id FROM public.categories WHERE name = 'Sobremesas' LIMIT 1),
  'Açaí Gelato 300ml',
  'Sobremesa gelada com açaí, frutas vermelhas e calda especial.',
  'Açaí, frutas vermelhas, calda especial',
  14.90,
  NULL,
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop&crop=center',
  true,
  4.8
),
(
  (SELECT id FROM public.categories WHERE name = 'Smoothies' LIMIT 1),
  'Green Smoothie Açaí',
  'Açaí com espinafre, abacaxi e hortelã. Refrescante e saudável!',
  'Açaí, espinafre, abacaxi, hortelã',
  17.90,
  NULL,
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop&crop=center',
  false,
  4.5
);

-- Insert sample banners
INSERT INTO public.banners (title, subtitle, image_url, is_active, sort_order) VALUES
('Bem-vindos ao Kija Açaí!', 'O melhor açaí artesanal da cidade chegou até você', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=400&fit=crop&crop=center', true, 1),
('Promoção Especial', 'Ganhe 20% OFF no seu primeiro pedido acima de R$ 30', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop&crop=center', true, 2),
('Novos Sabores', 'Experimente nossos smoothies tropicais!', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop&crop=center', true, 3);

-- Insert sample promotions
INSERT INTO public.promotions (title, description, code, type, value, min_order_value, start_date, end_date, is_active) VALUES
('Desconto Primeira Compra', 'Ganhe 20% de desconto no seu primeiro pedido', 'PRIMEIRO20', 'percentage', 20.00, 30.00, NOW(), NOW() + INTERVAL '30 days', true),
('Frete Grátis', 'Frete grátis em pedidos acima de R$ 50', 'FRETEGRATIS', 'free_shipping', 0.00, 50.00, NOW(), NOW() + INTERVAL '15 days', true),
('Super Desconto', 'R$ 10 OFF em pedidos acima de R$ 40', 'SAVE10', 'fixed_amount', 10.00, 40.00, NOW(), NOW() + INTERVAL '7 days', true);