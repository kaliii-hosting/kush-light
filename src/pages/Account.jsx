import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

const Account = () => {
  const { user, updateUserProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [editMode, setEditMode] = useState({
    displayName: false,
    email: false,
    password: false
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUserProfile({
        displayName: formData.displayName
      });
      showMessage('success', 'Display name updated successfully!');
      setEditMode({ ...editMode, displayName: false });
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword) {
      showMessage('error', 'Please enter your current password to update email');
      return;
    }

    setLoading(true);
    
    try {
      // Re-authenticate user before email update
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, formData.email);
      
      showMessage('success', 'Email updated successfully! Please verify your new email.');
      setEditMode({ ...editMode, email: false });
      setFormData({ ...formData, currentPassword: '' });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Incorrect password');
      } else if (error.code === 'auth/email-already-in-use') {
        showMessage('error', 'Email is already in use');
      } else {
        showMessage('error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    if (!formData.currentPassword) {
      showMessage('error', 'Please enter your current password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Re-authenticate user before password update
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Change password
      await changePassword(formData.newPassword);
      
      showMessage('success', 'Password updated successfully!');
      setFormData({ 
        ...formData, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      });
      setEditMode({ ...editMode, password: false });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect');
      } else {
        showMessage('error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-spotify-text-subdued">You need to be logged in to access your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-spotify-text-subdued">Manage your account information</p>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Display Name Section */}
          <div className="bg-spotify-light-gray rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Display Name
              </h2>
              {!editMode.displayName && (
                <button
                  onClick={() => setEditMode({ ...editMode, displayName: true })}
                  className="text-primary hover:text-primary-hover text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            
            {editMode.displayName ? (
              <form onSubmit={handleUpdateDisplayName} className="space-y-4">
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                  placeholder="Enter your display name"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ ...editMode, displayName: false });
                      setFormData({ ...formData, displayName: user.displayName || '' });
                    }}
                    className="bg-spotify-gray hover:bg-spotify-card-hover text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-white">{formData.displayName || 'Not set'}</p>
            )}
          </div>

          {/* Email Section */}
          <div className="bg-spotify-light-gray rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Address
              </h2>
              {!editMode.email && (
                <button
                  onClick={() => setEditMode({ ...editMode, email: true })}
                  className="text-primary hover:text-primary-hover text-sm font-medium"
                >
                  Change
                </button>
              )}
            </div>
            
            {editMode.email ? (
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                  placeholder="Enter new email address"
                  required
                />
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-text-subdued" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                    placeholder="Enter current password to confirm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-text-subdued hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ ...editMode, email: false });
                      setFormData({ ...formData, email: user.email || '', currentPassword: '' });
                    }}
                    className="bg-spotify-gray hover:bg-spotify-card-hover text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-white">{formData.email}</p>
            )}
          </div>

          {/* Password Section */}
          <div className="bg-spotify-light-gray rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </h2>
              {!editMode.password && (
                <button
                  onClick={() => setEditMode({ ...editMode, password: true })}
                  className="text-primary hover:text-primary-hover text-sm font-medium"
                >
                  Change
                </button>
              )}
            </div>
            
            {editMode.password ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-text-subdued" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                    placeholder="Current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-text-subdued hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-text-subdued" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                    placeholder="New password (min 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-text-subdued hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-spotify-text-subdued" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-spotify-gray border border-spotify-card-hover rounded-lg text-white placeholder-spotify-text-subdued focus:outline-none focus:border-primary"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-text-subdued hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode({ ...editMode, password: false });
                      setFormData({ 
                        ...formData, 
                        currentPassword: '', 
                        newPassword: '', 
                        confirmPassword: '' 
                      });
                    }}
                    className="bg-spotify-gray hover:bg-spotify-card-hover text-white font-bold py-2 px-6 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-spotify-text-subdued">••••••••</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;