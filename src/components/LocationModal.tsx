
import React, { useState } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: string) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onLocationSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const cities = [
    { name: 'São Paulo', distance: '2.1 km' },
    { name: 'Rio de Janeiro', distance: '1.8 km' },
    { name: 'Belo Horizonte', distance: '3.2 km' },
    { name: 'Salvador', distance: '1.4 km' },
    { name: 'Brasília', distance: '2.7 km' },
    { name: 'Curitiba', distance: '3.8 km' },
    { name: 'Recife', distance: '2.3 km' },
    { name: 'Porto Alegre', distance: '1.9 km' },
  ];

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setTimeout(() => {
      onLocationSelected(cityName);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 m-4 max-w-md w-full shadow-kija-lg animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-kija-purple to-kija-purple-light rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Onde você está?</h2>
              <p className="text-gray-600">Encontre a loja mais próxima</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Digite sua cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-2 border-gray-200 focus:border-kija-purple rounded-xl"
          />
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredCities.map((city) => (
            <div
              key={city.name}
              onClick={() => handleCitySelect(city.name)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                selectedCity === city.name
                  ? 'border-kija-purple bg-purple-50'
                  : 'border-gray-200 hover:border-kija-purple-light hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-kija-purple" />
                  <span className="font-semibold text-gray-900">{city.name}</span>
                </div>
                <span className="text-sm text-kija-gold font-medium">
                  📍 {city.distance}
                </span>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                Loja mais próxima encontrada
              </p>
            </div>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Nenhuma cidade encontrada</p>
            <p className="text-sm text-gray-500 mt-1">Tente pesquisar por outra cidade</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-yellow-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-kija-purple to-kija-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏪</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sempre próximo de você!</p>
              <p className="text-sm text-gray-600">Todas as nossas lojas ficam até 3,8km de distância</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
