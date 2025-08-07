import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../../store";
import { useAuth } from "../../contexts/AuthContext";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotals,
    isLoading,
  } = useCart();

  const { subtotal, shipping, total, totalItems } = getCartTotals();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store current cart and redirect to login
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      // Navigate to checkout
      navigate('/checkout');
    }
    onClose(); // Close cart drawer
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleUpdateQuantity = (itemIndex, newQuantity) => {
    updateQuantity(itemIndex, newQuantity);
  };

  const handleRemoveItem = (itemIndex) => {
    removeFromCart(itemIndex);
  };

  // Mobile: Use Drawer (bottom)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[85vh] bg-black/95 backdrop-blur-xl border-purple-500/30 border-t-2 shadow-2xl shadow-purple-500/20">
          {/* Mobile Handle */}
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-purple-500/50" />

          <DrawerHeader className="border-b border-purple-500/20 pb-4 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-xl shadow-lg shadow-purple-500/30">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    Shopping Cart
                    {totalItems > 0 && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/20">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </Badge>
                    )}
                  </DrawerTitle>
                  <DrawerDescription className="text-purple-200/80 mt-1">
                    {cartItems.length === 0
                      ? "Your cart is empty"
                      : `Total: $${total.toFixed(2)}`}
                  </DrawerDescription>
                </div>
              </div>
            </div>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/60 to-purple-900/20">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <ShoppingBag className="w-20 h-20 text-purple-400/60 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-purple-100 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-purple-300/70">
                    Discover amazing DYNEX products and add them to your cart
                  </p>
                </div>
                <DrawerClose asChild>
                  <Button className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold shadow-lg shadow-purple-500/30 border border-purple-400/20">
                    Start Shopping
                  </Button>
                </DrawerClose>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}-${index}`}
                  className={`group bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20 
                    hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20
                    hover:bg-black/70`}
                >
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300 border border-purple-500/20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate mb-1 group-hover:text-purple-200 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-800/40 text-purple-200 border border-purple-500/30"
                        >
                          {item.color}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-800/40 text-purple-200 border border-purple-500/30"
                        >
                          Size {item.size}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold text-lg">
                            ${item.price}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-purple-400/70 text-sm line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-purple-800/40 hover:bg-purple-700/60 text-purple-200 hover:text-white rounded-full border border-purple-500/30 hover:border-purple-400/50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-purple-800/40 hover:bg-purple-700/60 text-purple-200 hover:text-white rounded-full border border-purple-500/30 hover:border-purple-400/50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="w-8 h-8 text-purple-400/70 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200 self-start border border-purple-500/20 hover:border-red-500/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <DrawerFooter className="border-t border-purple-500/30 bg-black/80 backdrop-blur-xl">
              {/* Summary */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-purple-100">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-purple-100">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-400 font-bold">Free ✨</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {shipping === 0 ? (
                  <div className="text-green-400 text-sm bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center backdrop-blur-sm">
                    🎉 You've unlocked free shipping!
                  </div>
                ) : (
                  <div className="text-yellow-400 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 text-center backdrop-blur-sm">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </div>
                )}

                <Separator className="bg-purple-500/30" />

                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/40 border border-purple-400/20"
                  size="lg"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login & Checkout'}
                </Button>

                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full text-purple-200 hover:text-white hover:bg-purple-800/30 py-3 rounded-xl transition-all duration-200 border border-purple-500/20 hover:border-purple-400/40"
                  >
                    Continue Shopping
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Sheet (right side)
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-black/95 backdrop-blur-xl border-purple-500/30 border-l-2 p-0 flex flex-col shadow-2xl shadow-purple-500/20"
      >
        <SheetHeader className="border-b border-purple-500/20 pb-4 p-6 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-xl shadow-lg shadow-purple-500/30">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  Shopping Cart
                  {totalItems > 0 && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/20">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription className="text-purple-200/80 mt-1">
                  {cartItems.length === 0
                    ? "Your cart is empty"
                    : `Total: $${total.toFixed(2)}`}
                </SheetDescription>
              </div>
            </div>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-300 hover:text-white hover:bg-purple-800/40 border border-purple-500/20 hover:border-purple-400/40"
              >
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20 backdrop-blur-sm">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center border-2 border-purple-500/30 shadow-lg shadow-purple-500/20">
                  <ShoppingBag className="w-16 h-16 text-purple-300" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                    <Minus className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Your cart is empty
                </h3>
                <p className="text-purple-200/70 max-w-xs">
                  Discover amazing DYNEX products and add them to your cart
                </p>
              </div>
              <SheetClose asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 shadow-lg shadow-purple-500/30 border border-purple-400/20">
                  Start Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}-${index}`}
                  className={`group bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 
                    hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20`}
                >
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300 border border-purple-500/20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate mb-1 group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className="text-xs bg-purple-800/40 text-purple-200 border border-purple-500/30">
                          {item.color}
                        </Badge>
                        <Badge className="text-xs bg-purple-800/40 text-purple-200 border border-purple-500/30">
                          Size {item.size}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Price */}
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold text-lg">
                            ${item.price}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-purple-300/60 text-sm line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-purple-800/40 hover:bg-purple-700/60 text-purple-200 hover:text-white rounded-full border border-purple-500/30"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-purple-800/40 hover:bg-purple-700/60 text-purple-200 hover:text-white rounded-full border border-purple-500/30"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="w-8 h-8 text-purple-300/60 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200 self-start border border-purple-500/20 hover:border-red-400/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-purple-500/30 bg-black/80 backdrop-blur-xl p-6">
            {/* Summary */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-purple-200/80">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-purple-200/80">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {shipping === 0 ? (
                    <span className="text-green-400 font-bold">Free ✨</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {shipping === 0 ? (
                <div className="text-green-400 text-sm bg-green-500/20 border border-green-500/30 rounded-lg p-2 text-center backdrop-blur-sm">
                  🎉 You've unlocked free shipping!
                </div>
              ) : (
                <div className="text-yellow-400 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2 text-center backdrop-blur-sm">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                </div>
              )}

              <Separator className="bg-purple-500/30" />

              <div className="flex justify-between text-white font-bold text-xl">
                <span>Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 border border-purple-400/20"
                size="lg"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login & Checkout'}
              </Button>

              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="w-full text-purple-300 hover:text-white hover:bg-purple-800/40 py-3 rounded-xl transition-all duration-200 border border-purple-500/20 hover:border-purple-400/40"
                >
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
