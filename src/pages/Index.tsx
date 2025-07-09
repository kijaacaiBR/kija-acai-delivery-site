
import React, { useState, useEffect } from 'react';
import LocationModal from '@/components/LocationModal';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

const Index = () => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    // Check if user has already selected location
    const savedLocation = localStorage.getItem('kijaLocation');
    if (!savedLocation) {
      // Show location modal after a short delay for better UX
      setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
    } else {
      setCurrentLocation(savedLocation);
    }
  }, []);

  const handleLocationSelected = (location: string) => {
    setCurrentLocation(location);
    localStorage.setItem('kijaLocation', location);
    console.log(`Localização selecionada: ${location}`);
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Kija Açaí - Delivery de Açaí Artesanal"
        description="O melhor açaí artesanal da cidade. Peça já o seu e receba em casa! Açaí natural, vitaminas, smoothies e sobremesas saudáveis."
        keywords="açaí delivery, açaí artesanal, açaí natural, vitaminas, smoothies, sobremesas saudáveis, delivery saudável"
      />
      
      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={handleLocationSelected}
      />

      {/* Header */}
      <Header
        cartItemsCount={cartItemsCount}
        currentLocation={currentLocation}
        onLocationClick={handleLocationClick}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Categories */}
        <Categories />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Testimonials */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
