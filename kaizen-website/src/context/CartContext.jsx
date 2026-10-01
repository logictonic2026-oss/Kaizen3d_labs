import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false)

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true) // Auto-open cart when adding
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        if (newQ < 1) return item // Handle removal elsewhere or prevent 0
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const clearCart = () => setCartItems([])

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (Number(item.price) * item.quantity)
  }, 0)

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isTrackOrderOpen,
      setIsTrackOrderOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}
