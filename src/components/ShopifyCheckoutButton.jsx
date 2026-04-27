import React, { useState } from 'react';
import { useCart } from '../context/ShopifyCartContext';
import { ShoppingCart, Loader2 } from 'lucide-react';

const ShopifyCheckoutButton = ({ 
  className = '', 
  variant = 'primary',
  fullWidth = false,
  showIcon = true,
  text = 'Checkout'
}) => {
  const { handleCheckout, cartCount, cartTotal, loading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (cartCount === 0) return;
    
    setIsProcessing(true);
    try {
      await handleCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const baseClasses = 'font-semibold rounded-full transition-all flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-white hover:bg-gray-100 text-black',
    outline: 'border-2 border-white hover:bg-white hover:text-black text-white'
  };

  const sizeClasses = fullWidth ? 'w-full py-4' : 'px-8 py-3';

  const isDisabled = cartCount === 0 || loading || isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}
        ${className}
      `}
    >
      {isProcessing || loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="h-5 w-5" />}
          <span>{text}</span>
          {cartTotal && <span className="font-normal">(${cartTotal})</span>}
        </>
      )}
    </button>
  );
};

export default ShopifyCheckoutButton;