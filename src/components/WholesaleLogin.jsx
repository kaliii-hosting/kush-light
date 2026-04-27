import { useState, useEffect, useRef } from 'react';
import { Package, AlertCircle, Delete } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const WholesaleLogin = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [wholesalePin, setWholesalePin] = useState('1973'); // Default PIN
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch wholesale PIN from Firebase
    const fetchWholesalePin = async () => {
      try {
        const passwordsRef = ref(realtimeDb, 'settings/passwords/wholesalePin');
        const snapshot = await get(passwordsRef);
        if (snapshot.exists()) {
          setWholesalePin(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching wholesale PIN:', error);
        // Use default PIN on error
      }
    };
    
    fetchWholesalePin();
    
    // Focus on invisible input for keyboard support
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleNumberClick = (num) => {
    if (pin.length < wholesalePin.length) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      // Auto-submit when PIN length matches wholesalePin length
      if (newPin.length === wholesalePin.length) {
        if (newPin === wholesalePin) {
          // Set wholesale session
          sessionStorage.setItem('wholesaleAuthenticated', 'true');
          navigate('/wholesale');
        } else {
          setError('Incorrect PIN');
          setTimeout(() => {
            setPin('');
            setError('');
          }, 1500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleKeyPress = (e) => {
    // Handle number keys
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleNumberClick(e.key);
    }
    // Handle backspace/delete
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleDelete();
    }
    // Handle escape to clear
    else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Hidden input for keyboard support */}
      <input
        ref={inputRef}
        type="text"
        value={pin}
        onChange={() => {}} // Controlled by handleKeyPress
        onKeyDown={handleKeyPress}
        className="absolute opacity-0 pointer-events-none"
        maxLength={wholesalePin.length}
        autoFocus
      />
      
      <div className="max-w-sm w-full">
        <div className="bg-spotify-light-gray rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white">Wholesale Access</h2>
            <p className="text-gray-400 mt-2">Enter PIN to continue</p>
            <p className="text-gray-500 text-xs mt-1">Use keyboard or click numbers</p>
          </div>

          {/* PIN Display */}
          <div className="mb-8">
            <div className="flex justify-center gap-3">
              {Array.from({ length: wholesalePin.length }, (_, index) => (
                <div
                  key={index}
                  className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center ${
                    pin.length > index
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  {pin.length > index && (
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            
            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold py-4 rounded-lg transition-all transform active:scale-95"
              >
                {num}
              </button>
            ))}
            
            <button
              onClick={handleClear}
              className="bg-gray-700 hover:bg-gray-600 text-gray-400 py-4 rounded-lg transition-all transform active:scale-95"
            >
              Clear
            </button>
            
            <button
              onClick={() => handleNumberClick('0')}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold py-4 rounded-lg transition-all transform active:scale-95"
            >
              0
            </button>
            
            <button
              onClick={handleDelete}
              className="bg-gray-700 hover:bg-gray-600 text-gray-400 py-4 rounded-lg transition-all transform active:scale-95 flex items-center justify-center"
            >
              <Delete size={20} />
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Brand Wholesale Partner Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleLogin;