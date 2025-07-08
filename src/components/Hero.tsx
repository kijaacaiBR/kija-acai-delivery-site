
import React from 'react';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft mb-6">
              <Star className="w-4 h-4 text-kija-gold fill-current" />
              <span className="text-sm font-medium text-gray-700">Açaí artesanal de verdade</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              O melhor 
              <span className="gradient-text block">açaí da cidade</span>
              chegou até você! 🍇
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Açaí 100% natural, sem conservantes e feito na hora. 
              Experimente o sabor autêntico do Norte em cada colherada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="btn-kija group">
                Peça já o seu
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="border-2 border-kija-purple text-kija-purple hover:bg-kija-purple hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                Ver cardápio
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">20-30min</p>
                  <p className="text-sm text-gray-600">Entrega rápida</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-kija-gold to-kija-gold-light rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Grátis</p>
                  <p className="text-sm text-gray-600">Acima de R$ 25</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-600">Avaliação</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-float">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop&crop=center"
                alt="Açaí bowl com frutas frescas"
                className="w-full h-[500px] object-cover rounded-3xl shadow-kija-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kija-purple/20 to-transparent rounded-3xl"></div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-2xl shadow-kija animate-bounce-gentle">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🍇</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">100%</p>
                    <p className="text-sm text-gray-600">Natural</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-gold animate-pulse-soft">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-kija-gold to-kija-gold-light rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚡</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Energia</p>
                    <p className="text-sm text-gray-600">Pura</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-to-r from-kija-purple/10 to-kija-gold/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
