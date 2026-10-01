import React from 'react';
import Hero from '../components/Hero';
import HomeCategories from '../components/HomeCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import BuyingConfidence from '../components/BuyingConfidence';

export default function Home() {
  return (
    <div className='min-h-screen text-white'>
      <Hero />
      <HomeCategories />
      <FeaturedProducts />
      <BuyingConfidence />
    </div>
  );
}