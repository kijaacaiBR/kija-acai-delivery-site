
import React from 'react';
import { Plus, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  isPopular?: boolean;
  category?: string;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  originalPrice,
  image,
  rating = 4.8,
  isPopular = false,
  category = '',
  className = ''
}) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className={`card-kija overflow-hidden group ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isPopular && (
            <span className="bg-gradient-to-r from-kija-gold to-kija-gold-light text-white text-xs font-bold px-3 py-1 rounded-full shadow-gold">
              🔥 Popular
            </span>
          )}
          {discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 hover:fill-current transition-colors" />
        </Button>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          {category && (
            <span className="text-xs font-medium text-kija-purple bg-purple-50 px-2 py-1 rounded-full">
              {category}
            </span>
          )}
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-kija-gold fill-current" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-kija-purple transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                R$ {originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="bg-gradient-to-r from-kija-purple to-kija-purple-light text-white font-semibold px-4 py-2 rounded-full shadow-kija hover:shadow-kija-lg transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <Plus className="w-4 h-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Quick Add Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-kija-purple/90 to-kija-purple-light/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
        <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <Plus className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Adicionar ao carrinho</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
