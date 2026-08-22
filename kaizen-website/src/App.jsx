import React from 'react'
import './index.css'
import CursorEffects from './components/CursorEffects'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Philosophy from './components/Philosophy'
import Shop from './components/Shop'
import SmartQuote from './components/SmartQuote'
import Capabilities from './components/Capabilities'
import Values from './components/Values'
import Workflow from './components/Workflow'
import Industries from './components/Industries'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'
import CheckoutPage from './components/CheckoutPage'

export default function App() {
  return (
    <CartProvider>
      {/* Precision grid background */}
      <div className="bg-grid" aria-hidden="true" />

      {/* Global Overlays */}
      <CursorEffects />
      <CartDrawer />
      <CheckoutPage />

      {/* Navigation */}
      <Navbar />

      <main>
        {/* 1. Hero */}
        <Hero />

        {/* 2. Philosophy / Brand Story */}
        <Philosophy />

        {/* 3. B2C Shop / Products */}
        <Shop />

        {/* 4. Smart Quote Form */}
        <SmartQuote />

        {/* 5. Core Capabilities */}
        <Capabilities />

        {/* 6. Values */}
        <Values />

        {/* 7. Workflow */}
        <Workflow />

        {/* 8. Industries */}
        <Industries />

      </main>

      {/* 9. Footer / CTA */}
      <Footer />
    </CartProvider>
  )
}
