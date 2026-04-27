import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Package, Heart, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignIn = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const { signIn, signInWithGoogle, resetPassword, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setFormError('');
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
        <div className="relative bg-gradient-to-b from-spotify-light-gray to-spotify-gray shadow-2xl w-full max-w-sm rounded-xl border border-spotify-card-hover/30">

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
            <h2 className="text-lg font-bold text-white">Welcome Back</h2>
            <p className="text-xs text-spotify-text-subdued mt-1">Sign in to your account</p>
          </div>

          {/* Compact Benefits Bar */}
          <div className="bg-primary/10 px-4 py-2 flex items-center justify-center gap-5 border-b border-spotify-card-hover/20">
            <div className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-spotify-text">Track Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-spotify-text">Save Favorites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-spotify-text">Earn Rewards</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4">
            {/* Error message */}
            {(formError || error) && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{formError || error}</p>
              </div>
            )}

            {/* Success message for password reset */}
            {resetEmailSent && (
              <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-green-400 text-xs">Password reset email sent! Check your inbox.</p>
              </div>
            )}

            {!showForgotPassword ? (
              <>
                {/* Sign In Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2.5 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2.5 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                      placeholder="Password"
                      required
                    />
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3 h-3 rounded border-spotify-card-hover bg-spotify-card/50 checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[10px] text-spotify-text-subdued">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[10px] text-primary hover:text-primary-hover transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold py-2.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-spotify-card-hover/30"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-3 bg-gradient-to-b from-spotify-light-gray to-spotify-gray text-spotify-text-subdued">OR</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
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

                {/* Sign up link */}
                <p className="text-center mt-3 text-spotify-text-subdued text-xs">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToSignUp}
                    className="text-primary hover:text-primary-hover font-semibold transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Password Reset Form */}
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <p className="text-xs text-spotify-text-subdued mb-3">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-spotify-text-subdued pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-spotify-card/50 backdrop-blur text-white pl-8 pr-2.5 py-2.5 rounded-md focus:ring-1 focus:ring-primary/50 outline-none text-xs placeholder-spotify-text-subdued/70 border border-spotify-card-hover/30"
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-bold py-2.5 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </button>

                  {/* Back to Sign In */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setFormError('');
                    }}
                    className="w-full text-center text-xs text-spotify-text-subdued hover:text-white transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;