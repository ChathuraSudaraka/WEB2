import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('dynex_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    localStorage.removeItem('dynex_cart');
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem('dynex_cart', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  isLoading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { productData, selectedColor = '', selectedSize = '', quantity = 1 } = action.payload;
      
      // Create unique item key
      const itemKey = `${productData.id}-${selectedColor}-${selectedSize}`;
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => item.itemKey === itemKey);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const newQuantity = state.items[existingItemIndex].quantity + quantity;
        
        // Check stock availability
        if (newQuantity > productData.stockQuantity) {
          state.error = `Only ${productData.stockQuantity} items available in stock`;
          return;
        }
        
        state.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Check stock availability for new item
        if (quantity > productData.stockQuantity) {
          state.error = `Only ${productData.stockQuantity} items available in stock`;
          return;
        }
        
        // Add new item
        const newItem = {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || productData.price,
          image: productData.image,
          color: selectedColor,
          size: selectedSize,
          quantity: quantity,
          stockQuantity: productData.stockQuantity,
          itemKey: itemKey,
          addedAt: new Date().toISOString()
        };
        
        state.items.push(newItem);
      }
      
      // Clear any previous errors
      state.error = null;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemIndex, newQuantity } = action.payload;
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        state.items.splice(itemIndex, 1);
      } else {
        const item = state.items[itemIndex];
        
        // Check stock availability
        if (newQuantity > item.stockQuantity) {
          state.error = `Only ${item.stockQuantity} items available in stock`;
          return;
        }
        
        state.items[itemIndex].quantity = newQuantity;
        state.error = null;
      }
      
      saveCartToStorage(state.items);
    },
    
    // Remove item from cart
    removeFromCart: (state, action) => {
      const itemIndex = action.payload;
      const removedItem = state.items[itemIndex];
      
      state.items.splice(itemIndex, 1);
      saveCartToStorage(state.items);
    },
    
    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.error = null;
      localStorage.removeItem('dynex_cart');
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Load user cart (when user logs in)
    loadUserCart: (state, action) => {
      const { userId, userCartItems = [] } = action.payload;
      
      try {
        // Merge with existing cart
        const existingItems = [...state.items];
        
        userCartItems.forEach(userItem => {
          const existingIndex = existingItems.findIndex(item => item.itemKey === userItem.itemKey);
          if (existingIndex >= 0) {
            // Update quantity (take the higher value)
            existingItems[existingIndex].quantity = Math.max(
              existingItems[existingIndex].quantity,
              userItem.quantity
            );
          } else {
            existingItems.push(userItem);
          }
        });
        
        state.items = existingItems;
        saveCartToStorage(state.items);
        
        // Also save user-specific cart
        const cartData = {
          userId,
          items: state.items,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`dynex_cart_${userId}`, JSON.stringify(cartData));
        
      } catch (error) {
        console.error('Redux: Error loading user cart:', error);
        state.error = 'Failed to load user cart';
      }
    }
  }
});

// Export actions
export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setLoading,
  clearError,
  loadUserCart
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;

export const selectCartItemCount = (state) => {
  return state.cart.items.reduce((total, item) => total + item.quantity, 0);
};

export const selectCartTotals = (state) => {
  const items = state.cart.items;
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 10; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
    totalItems
  };
};

export const selectIsInCart = (state, productId, color = '', size = '') => {
  const itemKey = `${productId}-${color}-${size}`;
  return state.cart.items.some(item => item.itemKey === itemKey);
};

export const selectCartItem = (state, productId, color = '', size = '') => {
  const itemKey = `${productId}-${color}-${size}`;
  return state.cart.items.find(item => item.itemKey === itemKey);
};

export const selectCheckoutData = (state) => {
  const totals = selectCartTotals(state);
  
  return {
    items: state.cart.items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      image: item.image
    })),
    summary: totals,
    timestamp: new Date().toISOString()
  };
};

export default cartSlice.reducer;
