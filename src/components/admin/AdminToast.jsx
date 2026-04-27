import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const AdminToast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const styles = {
    success: {
      bg: 'bg-green-600',
      text: 'text-white',
      icon: 'text-white'
    },
    error: {
      bg: 'bg-red-600',
      text: 'text-white',
      icon: 'text-white'
    },
    warning: {
      bg: 'bg-yellow-600',
      text: 'text-white',
      icon: 'text-white'
    },
    info: {
      bg: 'bg-blue-600',
      text: 'text-white',
      icon: 'text-white'
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none px-4 w-full max-w-md">
      <div
        className={`
          ${currentStyle.bg} ${currentStyle.text}
          rounded-lg shadow-2xl pointer-events-auto
          animate-slide-down-fade-in
          flex items-center gap-3 px-4 py-3
          min-h-[56px]
        `}
        role="alert"
      >
        {/* Icon */}
        <div className={currentStyle.icon}>
          {icons[type]}
        </div>

        {/* Message */}
        <div className="flex-1 font-medium text-sm md:text-base">
          {message}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-down-fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down-fade-in {
          animation: slide-down-fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminToast;
