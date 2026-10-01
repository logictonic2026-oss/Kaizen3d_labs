import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import CartDrawer from './components/CartDrawer'
import ScrollToTop from './components/ScrollToTop'

// Public Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import Collection from './pages/Collection'
import ProductDetails from './pages/ProductDetails'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import TrackOrder from './pages/TrackOrder'
import CustomBulk from './pages/CustomBulk'
import About from './pages/About'
import DesignEnquiry from './pages/DesignEnquiry'

// Legal Pages (required for Razorpay & Indian compliance)
import TermsAndConditions from './pages/TermsAndConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import ContactUs from './pages/ContactUs'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import ProtectedRoute from './components/admin/ProtectedRoute'

// ── App Shell — conditionally shows public layout vs admin layout ─────────────
function AppShell() {
  const location = useLocation()
  const isAdmin  = location.pathname.startsWith('/admin')

  return (
    <>
      {/* Grid background only on public pages */}
      {!isAdmin && <div className="bg-grid" aria-hidden="true" />}

      {/* Public layout overlays */}
      {!isAdmin && (
        <>
          <CartDrawer />
          <Navbar />
        </>
      )}

      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections/all" element={<Navigate to="/shop" replace />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/custom-bulk" element={<CustomBulk />} />
        <Route path="/about" element={<About />} />
        <Route path="/design-enquiry" element={<DesignEnquiry />} />

        {/* ── Legal Pages (Razorpay & Indian compliance) ── */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/shipping" element={<ShippingPolicy />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* ── Admin Routes (no public Navbar/Footer) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/products/new" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/:id" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
      </Routes>

      {/* Footer only on public pages */}
      {!isAdmin && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
