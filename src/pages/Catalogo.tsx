import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';
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

interface Category {
  id: string;
  name: string;
}

const Catalogo = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        
        supabase
          .from('categories')
          .select('id, name')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Transform database products to match ProductCard interface
  const transformedProducts = filteredProducts.map(product => ({
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Cardápio Completo - Kija Açaí"
          description="Confira todo o nosso cardápio de açaí artesanal, smoothies, vitaminas e sobremesas."
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Cardápio Completo - Kija Açaí"
        description="Confira todo o nosso cardápio de açaí artesanal, smoothies, vitaminas e sobremesas. Produtos frescos e saborosos para você."
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Cardápio <span className="gradient-text">Completo</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra todos os nossos sabores únicos e ingredientes selecionados
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {transformedProducts.length} produto(s) encontrado(s)
            </span>
            {selectedCategory !== 'all' && (
              <Badge variant="secondary">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {transformedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termo de busca
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            {transformedProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`animate-fade-in ${
                  viewMode === 'list' ? 'w-full' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <ProductCard 
                  {...product} 
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State for No Products in Database */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="p-8 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Cardápio em Construção
              </h3>
              <p className="text-yellow-700 mb-4">
                Nossos produtos estão sendo adicionados. Volte em breve!
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Voltar ao Início
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;