
import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

const FeaturedProducts: React.FC = () => {
  const featuredProducts = [
    {
      id: '1',
      name: 'Açaí Tradicional 500ml',
      description: 'Açaí puro batido na hora com xarope de guaraná. O clássico que você ama!',
      price: 15.90,
      originalPrice: 18.90,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
      category: 'Açaí',
      isPopular: true,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Smoothie Tropical Mix',
      description: 'Açaí com manga, banana e leite de coco. Uma explosão de sabores tropicais!',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop&crop=center',
      category: 'Smoothie',
      isPopular: true,
      rating: 4.8
    },
    {
      id: '3',
      name: 'Açaí Power 750ml',
      description: 'Açaí com granola, banana, morango e mel. Perfeito para quem treina!',
      price: 22.90,
      originalPrice: 25.90,
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop&crop=center',
      category: 'Açaí',
      rating: 4.7
    },
    {
      id: '4',
      name: 'Vitamina de Açaí',
      description: 'Açaí batido com leite, banana e aveia. Nutritivo e delicioso!',
      price: 16.90,
      image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop&crop=center',
      category: 'Vitamina',
      rating: 4.6
    }
  ];

  return (
    <section className="py-16 bg-white" id="cardapio">
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
          {featuredProducts.map((product, index) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="btn-kija group">
            Ver cardápio completo
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Special Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-kija-purple via-kija-purple-light to-kija-gold rounded-3xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v20h40V20H20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
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
    </section>
  );
};

export default FeaturedProducts;
