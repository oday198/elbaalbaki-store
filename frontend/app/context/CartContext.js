'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://elbaalbaki-backend.onrender.com';
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shippingSettings, setShippingSettings] = useState({
    shippingFee: 0,
    freeShippingThreshold: 0,
    shippingEnabled: true
  });

  // Generate or get user ID from localStorage
  useEffect(() => {
    const getUserId = () => {
      let id = localStorage.getItem('userId');
      if (!id) {
        id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', id);
      }
      return id;
    };
    
    const id = getUserId();
    setUserId(id);
  }, []);

  // Fetch shipping settings
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/shipping-settings`);

        setShippingSettings(response.data);
      } catch (error) {
        console.error('Error fetching shipping settings:', error);
      }
    };
    
    fetchShippingSettings();
  }, []);

  // Load cart from backend when userId is set
  useEffect(() => {
    if (!userId) return;
    
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/cart/${userId}`);
        // Ensure we have the cart items array
        const cartItems = response.data.items || [];
        
        // Transform items to ensure consistent structure
        const transformedItems = cartItems.map(item => ({
          _id: item._id || item.productId,
          productId: item.productId || item._id,
          name: item.name || 'Product',
          price: item.price || 0,
          image: item.image || '',
          quantity: item.quantity || 1
        }));
        
        setCart(transformedItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, [userId]);

  // Helper function to get item ID consistently
  const getItemId = (item) => {
    return item.productId || item._id;
  };

  // Helper function to find item in cart
  const findCartItem = (cartArray, itemId) => {
    return cartArray.find(item => 
      getItemId(item) === itemId || 
      item.productId === itemId || 
      item._id === itemId
    );
  };

  const addToCart = async (product) => {
    try {
      const productId = product._id || product.productId;
      
      await axios.post(`${API_URL}/api/cart/${userId}`, {
        productId: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
      
      // Update local state
      setCart(prevCart => {
        const existingItem = findCartItem(prevCart, productId);
        
        if (existingItem) {
          return prevCart.map(item =>
            getItemId(item) === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        return [...prevCart, { 
          _id: productId,
          productId: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1 
        }];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${userId}/${itemId}`);
      
      setCart(prevCart => {
        const newCart = prevCart.filter(item => 
          getItemId(item) !== itemId && 
          item.productId !== itemId && 
          item._id !== itemId
        );
        return newCart;
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    // Ensure quantity is a number
    const quantity = Number(newQuantity);
    
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      const itemInCart = findCartItem(cart, itemId);
      
      if (!itemInCart) {
        console.error('Item not found in cart:', itemId);
        return;
      }
      
      await axios.post(`${API_URL}/api/cart/${userId}`, {
        productId: itemId,
        name: itemInCart.name,
        price: itemInCart.price,
        image: itemInCart.image,
        quantity: quantity
      });
      
      setCart(prevCart =>
        prevCart.map(item =>
          (getItemId(item) === itemId || item.productId === itemId || item._id === itemId)
            ? { ...item, quantity: quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/api/cart/${userId}`);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getShippingFee = () => {
    if (!shippingSettings.shippingEnabled) {
      return 0;
    }
    
    const subtotal = getSubtotal();
    
    // If there's a free shipping threshold and subtotal exceeds it
    if (shippingSettings.freeShippingThreshold > 0 && subtotal >= shippingSettings.freeShippingThreshold) {
      return 0;
    }
    
    // Otherwise return the configured shipping fee
    return shippingSettings.shippingFee || 0;
  };

  const getTotalPrice = () => {
    return getSubtotal() + getShippingFee();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
  };

  // Get cart item by ID
  const getCartItem = (itemId) => {
    return findCartItem(cart, itemId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      shippingSettings,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getShippingFee,
      getTotalPrice,
      getTotalItems,
      getCartItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}