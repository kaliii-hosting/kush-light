import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import gsap from 'gsap';

const PasswordLogin = ({ type = 'wholesale', onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [correctPassword, setCorrectPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const eyeRef = useRef(null);
  const toggleRef = useRef(null);
  const proxyRef = useRef(null);
  const blinkTlRef = useRef(null);
  const resetRef = useRef(null);

  // Load password - simplified to use hardcoded value for now
  useEffect(() => {
    // Hardcode the admin password
    if (type === 'admin') {
      setCorrectPassword('2112');
      console.log('Admin password set to: 2112');
    } else {
      setCorrectPassword('0000');
      console.log('Wholesale password set to: 0000');
    }

    // Optional: Still try to load from Firebase but don't override if it fails
    const loadPassword = async () => {
      try {
        const passwordPath = type === 'admin' ? 'settings/adminPin' : 'settings/wholesalePin';
        console.log(`Attempting to load ${type} password from Firebase path:`, passwordPath);
        const passwordRef = ref(realtimeDb, passwordPath);
        const passwordSnapshot = await get(passwordRef);
        if (passwordSnapshot.exists()) {
          const firebasePassword = passwordSnapshot.val();
          console.log(`${type} password found in Firebase:`, firebasePassword);
          // Only use Firebase password if it exists and is not empty
          if (firebasePassword && firebasePassword.trim() !== '') {
            setCorrectPassword(firebasePassword);
            console.log(`Using Firebase password for ${type}:`, firebasePassword);
          }
        } else {
          console.log(`No password found in Firebase for ${type}, keeping default`);
        }
      } catch (error) {
        console.error('Firebase error (using hardcoded password):', error);
        // Ensure the password is set correctly even if Firebase fails
        if (type === 'admin') {
          setCorrectPassword('2112');
        }
      }
    };

    // Try loading from Firebase but don't wait for it
    loadPassword();
  }, [type]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Eye animations
  useEffect(() => {
    if (!eyeRef.current) return;

    const BLINK_SPEED = 0.075;
    
    const blink = () => {
      const delay = gsap.utils.random(2, 8);
      const duration = BLINK_SPEED;
      const repeat = Math.random() > 0.5 ? 3 : 1;
      
      blinkTlRef.current = gsap.timeline({
        delay,
        onComplete: () => blink(),
        repeat,
        yoyo: true,
      })
      .to('.lid--upper', {
        scaleY: 0,
        duration,
      })
      .to('.eye', {
        scaleY: 0.1,
        duration,
      }, 0);
    };

    blink();

    // Eye tracking
    const moveEye = ({ clientX, clientY }) => {
      if (!eyeRef.current) return;
      
      if (resetRef.current) resetRef.current.kill();
      
      const bounds = eyeRef.current.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 100;
      const normalizedDistance = Math.min(distance / maxDistance, 1);
      const moveX = (deltaX / distance) * normalizedDistance * 30;
      const moveY = (deltaY / distance) * normalizedDistance * 30;

      gsap.set('.eye', {
        xPercent: gsap.utils.clamp(-30, 30, moveX),
        yPercent: gsap.utils.clamp(-30, 30, moveY)
      });

      resetRef.current = gsap.delayedCall(2, () => {
        gsap.to('.eye', { xPercent: 0, yPercent: 0, duration: 0.2 });
      });
    };

    window.addEventListener('pointermove', moveEye);

    return () => {
      window.removeEventListener('pointermove', moveEye);
      if (blinkTlRef.current) blinkTlRef.current.kill();
      if (resetRef.current) resetRef.current.kill();
    };
  }, []);

  const handleTogglePassword = () => {
    if (busy) return;
    setBusy(true);
    setShowPassword(!showPassword);

    const TOGGLE_SPEED = 0.125;
    const ENCRYPT_SPEED = 0.5;

    if (!showPassword) {
      // Show password
      if (blinkTlRef.current) blinkTlRef.current.kill();
      
      gsap.timeline({
        onComplete: () => setBusy(false)
      })
      .to('.lid--upper', { scaleY: 0, duration: TOGGLE_SPEED })
      .to('.eye', { scaleY: 0.1, duration: TOGGLE_SPEED }, 0);
    } else {
      // Hide password
      gsap.timeline({
        onComplete: () => {
          setBusy(false);
          // Restart blinking
          const blink = () => {
            const delay = gsap.utils.random(2, 8);
            const duration = 0.075;
            const repeat = Math.random() > 0.5 ? 3 : 1;
            
            blinkTlRef.current = gsap.timeline({
              delay,
              onComplete: () => blink(),
              repeat,
              yoyo: true,
            })
            .to('.lid--upper', { scaleY: 0, duration })
            .to('.eye', { scaleY: 0.1, duration }, 0);
          };
          blink();
        }
      })
      .to('.lid--upper', { scaleY: 1, duration: TOGGLE_SPEED })
      .to('.eye', { scaleY: 1, duration: TOGGLE_SPEED }, 0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password comparison:', {
      entered: password,
      expected: correctPassword,
      matches: password === correctPassword,
      type: type
    });

    // Accept 2112 for admin regardless of Firebase
    if (type === 'admin' && password === '2112') {
      console.log('Admin access granted');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/dashboard');
      }
      return;
    }

    if (password === correctPassword) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(type === 'admin' ? '/admin/dashboard' : '/wholesale');
      }
    } else {
      console.log('Password incorrect!');
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(#CB6015 1px, transparent 1px),
            linear-gradient(90deg, #CB6015 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="form-group relative">
          <label htmlFor="password" className="absolute -top-8 left-0 text-gray-400 text-sm tracking-wider">
            {type === 'admin' ? 'Admin Password' : 'Wholesale Password'}
          </label>
          <input
            ref={inputRef}
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`
              font-mono text-2xl px-6 py-4 pr-16 tracking-wider rounded-lg
              text-white border-2 bg-white/10 backdrop-blur-sm outline-none
              transition-all duration-200 min-w-[320px]
              ${error ? 'border-red-500 animate-shake' : 'border-gray-600 focus:border-primary'}
            `}
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full aspect-square rounded-lg border-0 bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white cursor-pointer outline-none focus:ring-2 focus:ring-primary"
            aria-pressed={showPassword}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3/4 mx-auto">
              <defs>
                <mask id="eye-open">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                </mask>
                <mask id="eye-closed">
                  <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12V20H12H1V12Z" fill="#D9D9D9" />
                </mask>
              </defs>
              <path className="lid lid--upper" d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path className="lid lid--lower" d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <g mask="url(#eye-open)">
                <g className="eye" ref={eyeRef}>
                  <circle cy="12" cx="12" r="4" fill="currentColor" />
                  <circle cy="11" cx="13" r="1" fill="white" />
                </g>
              </g>
            </svg>
            <span className="sr-only">Toggle password visibility</span>
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-center mt-4 text-sm">
            Incorrect password. Please try again.
          </p>
        )}
        
        <button
          type="submit"
          className="w-full mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
        >
          {type === 'admin' ? 'Access Admin' : 'Access Wholesale'}
        </button>
      </form>

      <style jsx="true">{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
};

export default PasswordLogin;