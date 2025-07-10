import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_popular: boolean | null;
  rating: number | null;
  category_id: string | null;
  categories?: {
    name: string;
  };
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('is_popular', true)
        .order('sort_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform database products to match ProductCard interface
  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    image: product.image_url || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
    category: product.categories?.name || 'Açaí',
    isPopular: product.is_popular || false,
    rating: product.rating ? Number(product.rating) : 4.8
  }));

  // Use only real products from database
  const displayProducts = transformedProducts;
  return <section className="py-16 bg-white" id="cardapio">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-yellow-50 px-4 py-2 rounded-full mb-4">
            <Flame className="w-5 h-5 text-kija-gold" />
            <span className="text-sm font-medium text-gray-700">Mais pedidos</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nossos
            <span className="gradient-text"> favoritos</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Os produtos mais amados pelos nossos clientes. Feitos com carinho e ingredientes selecionados.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            displayProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{
                animationDelay: `${index * 150}ms`
              }}>
                <ProductCard {...product} />
              </div>
            ))
          )}
        </div>

        {/* Message when no products in database */}
        {!loading && displayProducts.length === 0 && (
          <div className="text-center mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">
              <strong>Administrador:</strong> Nenhum produto popular encontrado. 
              Acesse o <a href="/admin/products" className="underline">painel administrativo</a> para adicionar produtos e marcar como populares.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button className="btn-kija group" onClick={() => window.location.href = '/catalogo'}>
            Ver cardápio completo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Special Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-kija-purple via-kija-purple-light to-kija-gold rounded-3xl p-8 text-white text-center relative overflow-hidden">
          
          
          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              🎉 Oferta especial para primeiros pedidos!
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Ganhe 20% OFF no seu primeiro pedido acima de R$ 30,00
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="secondary" className="bg-white text-kija-purple font-bold hover:bg-gray-100">
                Usar cupom: PRIMEIRO20
              </Button>
              <span className="text-sm opacity-75">
                *Válido apenas para novos clientes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturedProducts;