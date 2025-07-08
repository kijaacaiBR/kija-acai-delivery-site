import React from 'react';
import { Star, Quote } from 'lucide-react';
const Testimonials: React.FC = () => {
  const testimonials = [{
    id: 1,
    name: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'O melhor açaí que já experimentei! Chegou rapidinho e ainda veio geladinho. Super recomendo!',
    location: 'São Paulo, SP',
    date: '2 dias atrás'
  }, {
    id: 2,
    name: 'João Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Açaí de qualidade excepcional! O sabor é autêntico e as porções são generosas. Virei cliente fiel!',
    location: 'Rio de Janeiro, RJ',
    date: '5 dias atrás'
  }, {
    id: 3,
    name: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Entrega super rápida e o açaí estava perfeito! Os complementos são fresquinhos e o atendimento é nota 10.',
    location: 'Belo Horizonte, MG',
    date: '1 semana atrás'
  }];
  return <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-soft mb-4">
            <Star className="w-5 h-5 text-kija-gold fill-current" />
            <span className="text-sm font-medium text-gray-700">4.9/5 em mais de 2.500 avaliações</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes
            <span className="gradient-text"> dizem</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Histórias reais de pessoas que já experimentaram nosso açaí e se apaixonaram pelo sabor.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => <div key={testimonial.id} className="animate-fade-in" style={{
          animationDelay: `${index * 200}ms`
        }}>
              
            </div>)}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center animate-fade-in">
            <div className="text-3xl font-bold gradient-text mb-2">2.500+</div>
            <p className="text-gray-600">Avaliações</p>
          </div>
          <div className="text-center animate-fade-in" style={{
          animationDelay: '100ms'
        }}>
            <div className="text-3xl font-bold gradient-text mb-2">4.9★</div>
            <p className="text-gray-600">Nota média</p>
          </div>
          <div className="text-center animate-fade-in" style={{
          animationDelay: '200ms'
        }}>
            <div className="text-3xl font-bold gradient-text mb-2">15k+</div>
            <p className="text-gray-600">Clientes felizes</p>
          </div>
          <div className="text-center animate-fade-in" style={{
          animationDelay: '300ms'
        }}>
            <div className="text-3xl font-bold gradient-text mb-2">98%</div>
            <p className="text-gray-600">Recomendam</p>
          </div>
        </div>
      </div>
    </section>;
};
export default Testimonials;