import React from 'react';
import { ArrowRight } from 'lucide-react';
const Categories: React.FC = () => {
  const categories = [{
    id: 'acai',
    name: 'Açaí',
    description: 'Açaí puro e natural',
    icon: '🍇',
    color: 'from-purple-500 to-purple-600',
    count: 12
  }, {
    id: 'smoothies',
    name: 'Smoothies',
    description: 'Misturas refrescantes',
    icon: '🥤',
    color: 'from-pink-500 to-rose-500',
    count: 8
  }, {
    id: 'vitaminas',
    name: 'Vitaminas',
    description: 'Nutritivas e saborosas',
    icon: '🥛',
    color: 'from-green-500 to-emerald-500',
    count: 6
  }, {
    id: 'tapiocas',
    name: 'Tapiocas',
    description: 'Doces e salgadas',
    icon: '🫓',
    color: 'from-yellow-500 to-orange-500',
    count: 10
  }, {
    id: 'sobremesas',
    name: 'Sobremesas',
    description: 'Para adoçar seu dia',
    icon: '🍨',
    color: 'from-indigo-500 to-purple-500',
    count: 5
  }, {
    id: 'combos',
    name: 'Combos',
    description: 'Economia garantida',
    icon: '🎯',
    color: 'from-red-500 to-pink-500',
    count: 7
  }];
  return;
};
export default Categories;