import { useSelector, useDispatch } from 'react-redux';
import { 
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  setLoading,
  clearError,
  loadUserCart,
  selectCartItems,
  selectCartLoading,
  selectCartError,
  selectCartItemCount,
  selectCartTotals,
  selectIsInCart,
  selectCartItem,
  selectCheckoutData
} from './cartSlice';
import { useToast } from '../contexts/ToastContext';

// Custom hook for cart operations
export const useCart = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Selectors
  const cartItems = useSelector(selectCartItems);
  const isLoading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const cartItemCount = useSelector(selectCartItemCount);
  const cartTotals = useSelector(selectCartTotals);
  
  // Actions
  const addToCart = async (productData, selectedColor = '', selectedSize = '', quantity = 1) => {
    try {
      dispatch(setLoading(true));
      
      // Dispatch the add to cart action
      const action = addToCartAction({
        productData,
        selectedColor,
        selectedSize,
        quantity
      });
      
      dispatch(action);
      
      // Check if there was an error
      const currentError = error;
      if (currentError) {
        toast?.error(currentError);
        dispatch(clearError());
        return { success: false, message: currentError };
      }
      
      // Show success message
      const itemName = selectedColor && selectedSize 
        ? `${selectedColor} ${selectedSize} ${productData.name}`
        : productData.name;
      
      toast?.success(`${itemName} added to cart!`);
      
      return { success: true, message: 'Item added to cart successfully!' };
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast?.error('Failed to add item to cart');
      return { success: false, message: 'Failed to add item to cart' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateQuantity = (itemIndex, newQuantity) => {
    dispatch(updateQuantityAction({ itemIndex, newQuantity }));
    
    // Check for error after dispatch
    if (error) {
      toast?.error(error);
      dispatch(clearError());
    }
  };

  const removeFromCart = (itemIndex) => {
    const itemToRemove = cartItems[itemIndex];
    dispatch(removeFromCartAction(itemIndex));
    
    if (itemToRemove && toast) {
      toast.success(`${itemToRemove.name} removed from cart`);
    }
  };

  const clearCart = () => {
    dispatch(clearCartAction());
    toast?.success('Cart cleared successfully');
  };

  const getCartTotals = () => {
    return cartTotals;
  };

  const getCartItemCount = () => {
    return cartItemCount;
  };

  const isInCart = (productId, color = '', size = '') => {
    const itemKey = `${productId}-${color}-${size}`;
    return cartItems.some(item => item.itemKey === itemKey);
  };

  const getCartItem = (productId, color = '', size = '') => {
    const itemKey = `${productId}-${color}-${size}`;
    return cartItems.find(item => item.itemKey === itemKey);
  };

  const prepareCheckout = () => {
    return {
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: item.image
      })),
      summary: cartTotals,
      timestamp: new Date().toISOString()
    };
  };

  const syncCartWithUser = async (userId) => {
    try {
      // Load user-specific cart from localStorage
      const userCart = localStorage.getItem(`dynex_cart_${userId}`);
      if (userCart) {
        const parsedUserCart = JSON.parse(userCart);
        dispatch(loadUserCart({
          userId,
          userCartItems: parsedUserCart.items || []
        }));
      }
      return { success: true };
    } catch (error) {
      console.error('Error syncing cart with user:', error);
      return { success: false, error: error.message };
    }
  };

  const loadUserCartData = async (userId) => {
    return syncCartWithUser(userId);
  };

  return {
    // State
    cartItems,
    isLoading,
    error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    
    // Computed values
    getCartTotals,
    getCartItemCount,
    isInCart,
    getCartItem,
    prepareCheckout,
    
    // User-specific functions
    syncCartWithUser,
    loadUserCart: loadUserCartData,
    
    // Utility
    clearError: () => dispatch(clearError())
  };
};
