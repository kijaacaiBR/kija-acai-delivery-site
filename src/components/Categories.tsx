
import React from 'react';
import { ArrowRight } from 'lucide-react';

const Categories: React.FC = () => {
  const categories = [
    {
      id: 'acai',
      name: 'Açaí',
      description: 'Açaí puro e natural',
      icon: '🍇',
      color: 'from-purple-500 to-purple-600',
      count: 12
    },
    {
      id: 'smoothies',
      name: 'Smoothies',
      description: 'Misturas refrescantes',
      icon: '🥤',
      color: 'from-pink-500 to-rose-500',
      count: 8
    },
    {
      id: 'vitaminas',
      name: 'Vitaminas',
      description: 'Nutritivas e saborosas',
      icon: '🥛',
      color: 'from-green-500 to-emerald-500',
      count: 6
    },
    {
      id: 'tapiocas',
      name: 'Tapiocas',
      description: 'Doces e salgadas',
      icon: '🫓',
      color: 'from-yellow-500 to-orange-500',
      count: 10
    },
    {
      id: 'sobremesas',
      name: 'Sobremesas',
      description: 'Para adoçar seu dia',
      icon: '🍨',
      color: 'from-indigo-500 to-purple-500',
      count: 5
    },
    {
      id: 'combos',
      name: 'Combos',
      description: 'Economia garantida',
      icon: '🎯',
      color: 'from-red-500 to-pink-500',
      count: 7
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore nossas
            <span className="gradient-text"> categorias</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra sabores únicos em cada categoria. Do açaí tradicional às nossas criações especiais.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl p-6 text-center shadow-soft hover:shadow-kija transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-kija-purple transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>
                
                {/* Count */}
                <div className="flex items-center justify-center space-x-2 text-kija-purple">
                  <span className="text-sm font-medium">{category.count} produtos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-white rounded-full shadow-soft px-6 py-3 border border-gray-100">
            <span className="text-gray-600 mr-3">Não encontrou o que procura?</span>
            <button className="text-kija-purple font-semibold hover:text-kija-purple-dark transition-colors">
              Fale conosco
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
