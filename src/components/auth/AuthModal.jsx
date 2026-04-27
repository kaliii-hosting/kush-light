import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, defaultTab = 'signin' }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword, error } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    licenseNumber: ''
  });

  // Reset form when switching tabs
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      address: '',
      licenseNumber: ''
    });
    setFormError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [activeTab]);

  // Update tab when defaultTab prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError(''); // Clear error when user types
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name, {
        phone: formData.phone,
        address: formData.address,
        licenseNumber: formData.licenseNumber
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setFormError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setFormError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setFormError('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email);
      setFormError('');
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setFormError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* Main Container */}
          <div className="relative bg-[#0a0a0a] rounded-xl p-6 shadow-2xl border border-[#cb6015]">

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-800/50 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
            </button>

            {/* Logo */}
            <div className="text-center mb-4">
              <MediaPlaceholder kind="image" />
            </div>

            {/* Tab Switcher */}
            <div className="flex mb-4 relative">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'signin'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                SIGN UP
              </button>

              {/* Active Tab Indicator */}
              <div
                className="absolute bottom-0 h-0.5 bg-[#cb6015] transition-all duration-300"
                style={{
                  width: '50%',
                  left: activeTab === 'signin' ? '0' : '50%'
                }}
              />
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-red-400 text-xs text-center">{formError}</p>
              </div>
            )}

            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                {/* Email Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#cb6015] focus:outline-none transition-colors"
                    placeholder="you@universe.com"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 pr-16 text-sm text-white placeholder-gray-600 focus:border-[#cb6015] focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-[#1a1a1a] border border-gray-800 rounded checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg transition-all uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'SIGNING IN...' : 'LAUNCH SIGN IN'}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-2.5">
                {/* Name Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors text-sm"
                    placeholder="you@universe.com"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 pr-16 text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 pr-16 text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition-colors text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                    >
                      {showConfirmPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Optional Fields */}
                <details className="group">
                  <summary className="cursor-pointer text-[10px] text-gray-400 hover:text-white transition-colors list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform text-xs">▶</span>
                    Optional Information
                  </summary>
                  <div className="mt-2 space-y-2">
                    {/* Phone */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5 text-white placeholder-gray-600 focus:border-[#cb6015] focus:outline-none transition-colors text-xs"
                      placeholder="Phone Number"
                    />

                    {/* License */}
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5 text-white placeholder-gray-600 focus:border-[#cb6015] focus:outline-none transition-colors text-xs"
                      placeholder="License Number"
                    />

                    {/* Address */}
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-1.5 text-white placeholder-gray-600 focus:border-[#cb6015] focus:outline-none transition-colors text-xs"
                      placeholder="Delivery Address"
                    />
                  </div>
                </details>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-200 text-black font-medium py-3 rounded-lg transition-all uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-[#0a0a0a] text-gray-500 uppercase tracking-wider">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-white text-xs">Google</span>
              </button>
            </div>

            {/* Footer Link */}
            <p className="text-center mt-4 text-[10px] text-gray-500">
              {activeTab === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setActiveTab('signup')}
                    className="text-white hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setActiveTab('signin')}
                    className="text-white hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;