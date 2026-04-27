import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, Phone, MapPin, CreditCard, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignUp = ({ isOpen, onClose, onSwitchToSignIn }) => {
  const { signUp, signInWithGoogle, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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

    if (!agreed) {
      setFormError('Please agree to the terms and conditions');
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
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60]" onClick={onClose} />

      {/* Compact Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="relative bg-gradient-to-b from-spotify-light-gray to-spotify-gray shadow-2xl w-full max-w-md rounded-xl border border-spotify-card-hover/30">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X className="w-4 h-4 text-spotify-text-subdued hover:text-white" />
          </button>

          {/* Header with Logo */}
          <div className="pt-6 pb-3 text-center border-b border-spotify-card-hover/20">
            <MediaPlaceholder kind="image" />
            <h2 className="text-lg font-bold text-white">Create Account</h2>
            <p className="text-xs text-spotify-text-subdued mt-1">Join the premium Sample community</p>
          </div>

          {/* Compact Benefits Bar */}
          <div className="bg-primary/10 px-4 py-2 flex items-center justify-center gap-6 border-b border-spotify-card-hover/20">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-primary/30 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-[10px] text-spotify-text">Premium Products</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-primary/30 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-[10px] text-spotify-text">Member Benefits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-primary/30 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-[10px] text-spotify-text">Fast Delivery</span>
            </div>
          </div>

          {/* Compact Form */}
          <div className="p-4">
            {/* Error message */}
            {(formError || error) && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Two Column Layout for Required Fields */}
              <div className="grid grid-cols-2 gap-2">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                    placeholder="Full Name *"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                    placeholder="Email Address *"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                    placeholder="Password *"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                    placeholder="Confirm Password *"
                    required
                  />
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="pt-1">
                <p className="text-[10px] text-spotify-text-subdued mb-2 font-medium">Optional Information</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-spotify-card/30 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/50 border border-spotify-card-hover/20"
                      placeholder="Phone Number"
                    />
                  </div>

                  {/* License */}
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full bg-spotify-card/30 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/50 border border-spotify-card-hover/20"
                      placeholder="License Number"
                    />
                  </div>
                </div>

                {/* Address - Full width */}
                <div className="relative mt-2">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-spotify-card/30 backdrop-blur text-white pl-8 pr-2.5 py-2 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/50 border border-spotify-card-hover/20"
                    placeholder="Delivery Address"
                  />
                </div>
              </div>

              {/* Compact Terms */}
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-spotify-card-hover bg-spotify-card/50 checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  required
                />
                <label className="text-[10px] text-spotify-text-subdued cursor-pointer select-none">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">Terms</a>
                  {' & '}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold py-2.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-spotify-card-hover/30"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-3 bg-gradient-to-b from-spotify-light-gray to-spotify-gray text-spotify-text-subdued">OR</span>
                </div>
              </div>

              {/* Google Sign Up - Compact */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 rounded-md transition-all disabled:opacity-50 text-xs"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Sign in link - Compact */}
            <p className="text-center mt-3 text-spotify-text-subdued text-xs">
              Already have an account?{' '}
              <button
                onClick={onSwitchToSignIn}
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;