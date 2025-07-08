import React, { useState } from 'react';
import { Menu, ShoppingCart, User, Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface HeaderProps {
  cartItemsCount?: number;
  currentLocation?: string;
  onLocationClick?: () => void;
}
const Header: React.FC<HeaderProps> = ({
  cartItemsCount = 0,
  currentLocation = 'São Paulo',
  onLocationClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Kija Açaí</h1>
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-kija-purple transition-colors" onClick={onLocationClick}>
                    <MapPin className="w-3 h-3 text-kija-gold" />
                    <span className="text-xs text-gray-600">{currentLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-kija-purple transition-colors font-medium">
                Início
              </a>
              <a href="#cardapio" className="text-gray-700 hover:text-kija-purple transition-colors font-medium">
                Cardápio
              </a>
              <a href="#promocoes" className="text-gray-700 hover:text-kija-purple transition-colors font-medium">
                Promoções
              </a>
              <a href="#sobre" className="text-gray-700 hover:text-kija-purple transition-colors font-medium">
                Sobre
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Admin Button - Desktop */}
              

              {/* Search */}
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 hover:bg-purple-50" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5 text-gray-600" />
              </Button>

              {/* User */}
              

              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative w-10 h-10 p-0 hover:bg-purple-50">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartItemsCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-kija-gold text-white text-xs rounded-full flex items-center justify-center animate-bounce-gentle">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && <div className="fixed inset-0 z-50 lg:hidden">
          <div className="bg-black/50 backdrop-blur-sm absolute inset-0" onClick={() => setIsMenuOpen(false)} />
          <div className="bg-white w-80 h-full shadow-kija-lg animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <h2 className="text-xl font-bold gradient-text">Kija Açaí</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="space-y-4">
                <a href="#" className="block py-3 px-4 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-kija-purple transition-all font-medium">
                  Início
                </a>
                <a href="#cardapio" className="block py-3 px-4 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-kija-purple transition-all font-medium">
                  Cardápio
                </a>
                <a href="#promocoes" className="block py-3 px-4 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-kija-purple transition-all font-medium">
                  Promoções
                </a>
                <a href="#sobre" className="block py-3 px-4 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-kija-purple transition-all font-medium">
                  Sobre
                </a>
                <button onClick={() => window.location.href = '/auth'} className="block w-full text-left py-3 px-4 rounded-lg bg-kija-purple text-white hover:bg-kija-purple-light transition-all font-medium">
                  Painel Admin
                </button>
              </nav>

              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-kija-purple" />
                  <div>
                    <p className="font-semibold text-gray-900">Entregamos em:</p>
                    <p className="text-sm text-gray-600">{currentLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Search Modal */}
      {isSearchOpen && <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-md w-full shadow-kija-lg animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Buscar produtos</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Digite o que você procura..." className="pl-10 h-12 border-2 border-gray-200 focus:border-kija-purple rounded-xl" autoFocus />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Produtos populares:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Açaí 500ml', 'Vitamina', 'Smoothie', 'Tapioca'].map(item => <span key={item} className="px-3 py-1 bg-purple-50 text-kija-purple rounded-full text-xs cursor-pointer hover:bg-purple-100 transition-colors">
                    {item}
                  </span>)}
              </div>
            </div>
          </div>
        </div>}
    </>;
};
export default Header;