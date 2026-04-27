import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const NotificationToast = ({ show, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setShowCheckmark(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setShowCheckmark(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const toastContent = (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="bg-black/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-white/10 min-w-[280px] max-w-[90vw] md:max-w-[400px]">
        <div className="flex flex-col items-center">
          {/* Animated Checkmark */}
          <div className="mb-4">
            <svg
              className="w-16 h-16"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#1db954"
                strokeWidth="2"
                fill="none"
                className={`${
                  showCheckmark ? 'animate-circle-draw' : ''
                }`}
                style={{
                  strokeDasharray: '188.5',
                  strokeDashoffset: showCheckmark ? '0' : '188.5',
                  transition: 'stroke-dashoffset 0.5s ease-in-out'
                }}
              />
              <path
                d="M18 32 L26 40 L46 20"
                stroke="#1db954"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${
                  showCheckmark ? 'animate-checkmark-draw' : ''
                }`}
                style={{
                  strokeDasharray: '48',
                  strokeDashoffset: showCheckmark ? '0' : '48',
                  transition: 'stroke-dashoffset 0.3s ease-in-out 0.3s'
                }}
              />
            </svg>
          </div>
          
          {/* Message */}
          <h3 className="text-white text-lg font-semibold text-center">
            {message || 'Subscribed!'}
          </h3>
          <p className="text-gray-400 text-sm mt-1 text-center">
            Thank you for subscribing to our newsletter
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
};

export default NotificationToast;