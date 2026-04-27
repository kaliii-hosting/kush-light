import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import { Lock, Eye, EyeOff, Check, X, Shield, Key, Save } from 'lucide-react';

const PasswordsManagement = () => {
  const [adminPin, setAdminPin] = useState('');
  const [wholesalePin, setWholesalePin] = useState('');
  const [currentAdminPin, setCurrentAdminPin] = useState('');
  const [currentWholesalePin, setCurrentWholesalePin] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmAdminPin, setConfirmAdminPin] = useState('');
  const [newWholesalePin, setNewWholesalePin] = useState('');
  const [confirmWholesalePin, setConfirmWholesalePin] = useState('');

  const [showCurrentAdminPin, setShowCurrentAdminPin] = useState(false);
  const [showNewAdminPin, setShowNewAdminPin] = useState(false);
  const [showConfirmAdminPin, setShowConfirmAdminPin] = useState(false);
  const [showCurrentWholesalePin, setShowCurrentWholesalePin] = useState(false);
  const [showNewWholesalePin, setShowNewWholesalePin] = useState(false);
  const [showConfirmWholesalePin, setShowConfirmWholesalePin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');
  const [wholesaleSuccess, setWholesaleSuccess] = useState('');
  const [wholesaleError, setWholesaleError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(false);
  const [editingWholesale, setEditingWholesale] = useState(false);

  // Load current PINs from Firebase on component mount
  useEffect(() => {
    const loadCurrentPins = async () => {
      try {
        // Load admin PIN
        const adminPinRef = ref(realtimeDb, 'settings/adminPin');
        const adminPinSnapshot = await get(adminPinRef);
        if (adminPinSnapshot.exists()) {
          setAdminPin(adminPinSnapshot.val());
        } else {
          // Set default admin PIN if not exists
          setAdminPin('2112');
          await set(adminPinRef, '2112');
        }

        // Load wholesale PIN
        const wholesalePinRef = ref(realtimeDb, 'settings/wholesalePin');
        const wholesalePinSnapshot = await get(wholesalePinRef);
        if (wholesalePinSnapshot.exists()) {
          setWholesalePin(wholesalePinSnapshot.val());
        } else {
          // Set default wholesale PIN if not exists
          setWholesalePin('0000');
          await set(wholesalePinRef, '0000');
        }
      } catch (error) {
        console.error('Error loading PINs:', error);
      }
    };

    loadCurrentPins();
  }, []);

  // Reset form and messages
  const resetAdminForm = () => {
    setCurrentAdminPin('');
    setNewAdminPin('');
    setConfirmAdminPin('');
    setAdminError('');
    setAdminSuccess('');
    setEditingAdmin(false);
  };

  const resetWholesaleForm = () => {
    setCurrentWholesalePin('');
    setNewWholesalePin('');
    setConfirmWholesalePin('');
    setWholesaleError('');
    setWholesaleSuccess('');
    setEditingWholesale(false);
  };

  // Validate PIN format (4 digits)
  const validatePin = (pin) => {
    return /^\d{4}$/.test(pin);
  };

  // Handle admin PIN change
  const handleAdminPinChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAdminError('');
    setAdminSuccess('');

    try {
      // Validate current PIN
      if (currentAdminPin !== adminPin) {
        setAdminError('Current PIN is incorrect');
        setLoading(false);
        return;
      }

      // Validate new PIN format
      if (!validatePin(newAdminPin)) {
        setAdminError('New PIN must be exactly 4 digits');
        setLoading(false);
        return;
      }

      // Validate PIN confirmation
      if (newAdminPin !== confirmAdminPin) {
        setAdminError('New PIN and confirmation do not match');
        setLoading(false);
        return;
      }

      // Save new admin PIN to Firebase
      const adminPinRef = ref(realtimeDb, 'settings/adminPin');
      await set(adminPinRef, newAdminPin);

      // Update local state
      setAdminPin(newAdminPin);
      setAdminSuccess('Admin PIN updated successfully!');
      resetAdminForm();

      // Hide success message after 3 seconds
      setTimeout(() => setAdminSuccess(''), 3000);

    } catch (error) {
      console.error('Error updating admin PIN:', error);
      setAdminError('Failed to update admin PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle wholesale PIN change
  const handleWholesalePinChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setWholesaleError('');
    setWholesaleSuccess('');

    try {
      // Validate current PIN
      if (currentWholesalePin !== wholesalePin) {
        setWholesaleError('Current PIN is incorrect');
        setLoading(false);
        return;
      }

      // Validate new PIN format
      if (!validatePin(newWholesalePin)) {
        setWholesaleError('New PIN must be exactly 4 digits');
        setLoading(false);
        return;
      }

      // Validate PIN confirmation
      if (newWholesalePin !== confirmWholesalePin) {
        setWholesaleError('New PIN and confirmation do not match');
        setLoading(false);
        return;
      }

      // Save new wholesale PIN to Firebase
      const wholesalePinRef = ref(realtimeDb, 'settings/wholesalePin');
      await set(wholesalePinRef, newWholesalePin);

      // Update local state
      setWholesalePin(newWholesalePin);
      setWholesaleSuccess('Wholesale PIN updated successfully!');
      resetWholesaleForm();

      // Hide success message after 3 seconds
      setTimeout(() => setWholesaleSuccess(''), 3000);

    } catch (error) {
      console.error('Error updating wholesale PIN:', error);
      setWholesaleError('Failed to update wholesale PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary pr-10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Password Management</h2>
            <p className="text-gray-400">Manage PIN passwords for admin and wholesale access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-dark border border-border rounded-lg">
          <p className="text-gray-400 text-sm font-medium">Total PINs</p>
          <p className="text-xl font-bold text-white">2</p>
        </div>
      </div>

      {/* PIN Cards in Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin PIN Card */}
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
          {/* Card Header */}
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Admin PIN</h3>
                <p className="text-xs text-gray-400">Dashboard access control</p>
              </div>
            </div>
            {!editingAdmin && (
              <button
                onClick={() => setEditingAdmin(true)}
                className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                Change PIN
              </button>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4">
            {/* Success/Error Messages */}
            {adminSuccess && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">{adminSuccess}</span>
              </div>
            )}

            {adminError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{adminError}</span>
              </div>
            )}

            {editingAdmin ? (
              <form onSubmit={handleAdminPinChange} className="space-y-4">
                {/* Current Admin PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Admin PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentAdminPin ? 'text' : 'password'}
                      value={currentAdminPin}
                      onChange={(e) => setCurrentAdminPin(e.target.value)}
                      className={inputClass}
                      placeholder="Enter current PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentAdminPin(!showCurrentAdminPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Admin PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Admin PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showNewAdminPin ? 'text' : 'password'}
                      value={newAdminPin}
                      onChange={(e) => setNewAdminPin(e.target.value)}
                      className={inputClass}
                      placeholder="Enter new 4-digit PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAdminPin(!showNewAdminPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Admin PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Admin PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmAdminPin ? 'text' : 'password'}
                      value={confirmAdminPin}
                      onChange={(e) => setConfirmAdminPin(e.target.value)}
                      className={inputClass}
                      placeholder="Confirm new PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmAdminPin(!showConfirmAdminPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={resetAdminForm}
                    className="flex-1 bg-gray-dark border border-border hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-dark rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current PIN</span>
                    <span className="text-lg font-mono text-white tracking-widest">••••</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Controls access to the admin dashboard
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wholesale PIN Card */}
        <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
          {/* Card Header */}
          <div className="bg-gray-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Wholesale PIN</h3>
                <p className="text-xs text-gray-400">Wholesale page access control</p>
              </div>
            </div>
            {!editingWholesale && (
              <button
                onClick={() => setEditingWholesale(true)}
                className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                Change PIN
              </button>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4">
            {/* Success/Error Messages */}
            {wholesaleSuccess && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">{wholesaleSuccess}</span>
              </div>
            )}

            {wholesaleError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">{wholesaleError}</span>
              </div>
            )}

            {editingWholesale ? (
              <form onSubmit={handleWholesalePinChange} className="space-y-4">
                {/* Current Wholesale PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Wholesale PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentWholesalePin ? 'text' : 'password'}
                      value={currentWholesalePin}
                      onChange={(e) => setCurrentWholesalePin(e.target.value)}
                      className={inputClass}
                      placeholder="Enter current PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentWholesalePin(!showCurrentWholesalePin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentWholesalePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Wholesale PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Wholesale PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showNewWholesalePin ? 'text' : 'password'}
                      value={newWholesalePin}
                      onChange={(e) => setNewWholesalePin(e.target.value)}
                      className={inputClass}
                      placeholder="Enter new 4-digit PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewWholesalePin(!showNewWholesalePin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewWholesalePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Wholesale PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Wholesale PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmWholesalePin ? 'text' : 'password'}
                      value={confirmWholesalePin}
                      onChange={(e) => setConfirmWholesalePin(e.target.value)}
                      className={inputClass}
                      placeholder="Confirm new PIN"
                      maxLength="4"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmWholesalePin(!showConfirmWholesalePin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmWholesalePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save PIN'}
                  </button>
                  <button
                    type="button"
                    onClick={resetWholesaleForm}
                    className="flex-1 bg-gray-dark border border-border hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-dark rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current PIN</span>
                    <span className="text-lg font-mono text-white tracking-widest">••••</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Controls access to the wholesale ordering page
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PasswordsManagement;
