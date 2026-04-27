import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import gsap from 'gsap';

const SalesLogin = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const eyeRef = useRef(null);
  const blinkTlRef = useRef(null);
  const resetRef = useRef(null);

  // Focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Eye movement tracking
  useEffect(() => {
    const moveEye = (e) => {
      if (!eyeRef.current || showPassword) return;

      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      const distance = Math.min(30, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) * 0.1);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      gsap.to('.eye', { xPercent: x, yPercent: y, duration: 0.3 });

      if (resetRef.current) resetRef.current.kill();

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
  }, [showPassword]);

  // Eye blinking animation
  useEffect(() => {
    const blink = () => {
      if (showPassword) return;
      
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

    return () => {
      if (blinkTlRef.current) blinkTlRef.current.kill();
    };
  }, [showPassword]);

  const handleTogglePassword = () => {
    if (busy) return;
    setBusy(true);
    setShowPassword(!showPassword);

    const TOGGLE_SPEED = 0.125;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    
    setBusy(true);
    setError(false);
    setErrorMessage('');
    
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await auth.signOut();
        setError(true);
        setErrorMessage('User profile not found. Please contact support.');
        setBusy(false);
        return;
      }
      
      const userData = userDoc.data();
      
      // Check if user is deleted
      if (userData.isDeleted) {
        await auth.signOut();
        setError(true);
        setErrorMessage('This account has been disabled. Please contact support.');
        setBusy(false);
        return;
      }
      
      // Check if user is a sales rep
      if (userData.role !== 'sales') {
        await auth.signOut();
        setError(true);
        setErrorMessage('Access denied. Only sales representatives can access this page.');
        setBusy(false);
        return;
      }
      
      // Success - sales rep logged in
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/sales', { replace: true });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError(true);
      
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please try again later.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
      
      setBusy(false);
      setTimeout(() => {
        setError(false);
        setErrorMessage('');
      }, 3000);
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

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Sales Portal</h2>
        
        {/* Email Field */}
        <div className="form-group mb-6">
          <label htmlFor="email" className="block text-gray-400 text-sm tracking-wider mb-2">
            Email Address
          </label>
          <input
            ref={emailInputRef}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`
              font-mono text-lg sm:text-xl px-4 sm:px-6 py-3 sm:py-4 tracking-wider rounded-lg w-full
              text-white border-2 bg-white/10 backdrop-blur-sm outline-none
              transition-all duration-200
              ${error ? 'border-red-500 animate-shake' : 'border-gray-600 focus:border-[#CB6015]'}
            `}
            placeholder="Enter email"
          />
        </div>

        {/* Password Field */}
        <div className="form-group relative mb-6">
          <label htmlFor="password" className="block text-gray-400 text-sm tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordInputRef}
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`
                font-mono text-lg sm:text-xl px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 tracking-wider rounded-lg w-full
                text-white border-2 bg-white/10 backdrop-blur-sm outline-none
                transition-all duration-200
                ${error ? 'border-red-500 animate-shake' : 'border-gray-600 focus:border-[#CB6015]'}
              `}
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-0 top-0 h-full w-12 sm:w-14 flex items-center justify-center rounded-r-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white cursor-pointer outline-none"
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
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
        </div>
        
        {error && errorMessage && (
          <p className="text-red-500 text-center mt-4 text-sm">
            {errorMessage}
          </p>
        )}
        
        <button
          type="submit"
          disabled={busy}
          className="w-full mt-6 px-4 py-3 bg-[#CB6015] hover:bg-[#B8601B] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
        >
          Access Sales Portal
        </button>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </button>
        </div>
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

export default SalesLogin;