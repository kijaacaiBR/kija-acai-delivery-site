
import React from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Truck, Shield, CreditCard } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Kija Açaí</h3>
                <p className="text-gray-400 text-sm">Açaí artesanal de verdade</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Somos apaixonados por açaí! Trabalhamos com ingredientes 100% naturais 
              para levar até você o verdadeiro sabor do Norte do Brasil.
            </p>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-kija-purple transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-kija-purple transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-kija-gold" />
                <div>
                  <p className="text-gray-300">Rua do Açaí, 123</p>
                  <p className="text-gray-400 text-sm">Centro - São Paulo, SP</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-kija-gold" />
                <div>
                  <p className="text-gray-300">(11) 99999-9999</p>
                  <p className="text-gray-400 text-sm">WhatsApp</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-kija-gold" />
                <div>
                  <p className="text-gray-300">contato@kijaacai.com</p>
                  <p className="text-gray-400 text-sm">Suporte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-bold mb-6">Funcionamento</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-kija-gold" />
                <div>
                  <p className="text-gray-300">Segunda à Sexta</p>
                  <p className="text-gray-400 text-sm">09:00 - 22:00</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-kija-gold" />
                <div>
                  <p className="text-gray-300">Fins de Semana</p>
                  <p className="text-gray-400 text-sm">10:00 - 23:00</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-kija-gold font-semibold text-sm">🚚 Delivery 24/7</p>
                <p className="text-gray-400 text-xs">Entrega disponível a qualquer hora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Entrega Rápida</h5>
                <p className="text-gray-400 text-sm">20-30 minutos em média</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">100% Seguro</h5>
                <p className="text-gray-400 text-sm">Pagamento protegido</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-kija-gold to-kija-gold-light rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Pague como Quiser</h5>
                <p className="text-gray-400 text-sm">Cartão, PIX ou dinheiro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Kija Açaí. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
