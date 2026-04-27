import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { Users, Search, Circle, Shield, User as UserIcon, Mail, Calendar, Clock, ChevronDown, Briefcase, Plus, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Add user form state
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Edit user form state
  const [editUserData, setEditUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: ''
  });

  // Load users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
        setError('');
      },
      (error) => {
        console.error('Error loading users:', error);
        if (error.code === 'permission-denied') {
          setError(`PERMISSION DENIED - Update your Firestore rules to allow public read for users:

Go to Firebase Console > Firestore Database > Rules

Change the users rule to:
match /users/{userId} {
  allow read: if true;  // Allow public read
  // ... keep other rules
}

Then click PUBLISH.`);
        } else {
          setError('Failed to load users: ' + error.message);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus === 'online') {
      filtered = filtered.filter(user => user.isOnline);
    } else if (filterStatus === 'offline') {
      filtered = filtered.filter(user => !user.isOnline);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filterRole, filterStatus, users]);

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(`Failed to update user role: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newUserData.password !== newUserData.confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (newUserData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setAddUserLoading(true);
    
    try {
      // Use Cloud Function to create user with role
      const createUserFunction = httpsCallable(functions, 'createUserWithRole');
      const result = await createUserFunction({
        email: newUserData.email,
        password: newUserData.password,
        displayName: newUserData.fullName,
        role: 'customer'
      });
      
      if (result.data.success) {
        setSuccess('User created successfully');
        setTimeout(() => setSuccess(''), 3000);
        
        // Reset form
        setNewUserData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setShowAddUserForm(false);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Cloud Function errors
      if (error.code === 'functions/unauthenticated') {
        setError('You must be logged in to create users.');
      } else if (error.code === 'functions/permission-denied') {
        setError('You must be an admin to create users.');
      } else if (error.code === 'functions/already-exists') {
        setError(`This email is already registered. If you need to recreate this user:
1. Use the delete button to remove the existing user
2. Then create the user again`);
        setTimeout(() => setError(''), 10000);
      } else if (error.code === 'functions/invalid-argument') {
        setError(error.message || 'Invalid user data provided.');
      } else {
        setError(`Failed to create user: ${error.message}`);
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setAddUserLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      fullName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      licenseNumber: user.licenseNumber || ''
    });
    setShowEditForm(true);
    setShowAddUserForm(false);
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    setAddUserLoading(true);

    try {
      // Update user in Firestore
      await updateDoc(doc(db, 'users', editingUser.id), {
        displayName: editUserData.fullName,
        email: editUserData.email,
        phone: editUserData.phone,
        address: editUserData.address,
        licenseNumber: editUserData.licenseNumber,
        updatedAt: new Date().toISOString()
      });

      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(''), 3000);

      // Reset form
      setEditingUser(null);
      setEditUserData({ fullName: '', email: '', phone: '', address: '', licenseNumber: '' });
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(`Failed to update user: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setAddUserLoading(false);
    }
  };

  // Handle delete user (soft delete - mark as inactive)
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.displayName || user.email}?\n\nThis will mark the user as deleted and prevent them from signing in.`)) {
      return;
    }

    setDeleteLoading(true);

    try {
      // Update user in Firestore to mark as deleted
      await updateDoc(doc(db, 'users', user.id), {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: 'admin'
      });

      setSuccess('User marked as deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle restore user
  const handleRestoreUser = async (user) => {
    if (!window.confirm(`Are you sure you want to restore ${user.displayName || user.email}?\n\nThis will allow the user to sign in again.`)) {
      return;
    }

    setDeleteLoading(true);

    try {
      // Update user in Firestore to remove deleted status
      await updateDoc(doc(db, 'users', user.id), {
        isDeleted: false,
        restoredAt: new Date().toISOString(),
        restoredBy: 'admin'
      });

      setSuccess('User restored successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error restoring user:', error);
      setError(`Failed to restore user: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const stats = {
    total: users.length,
    online: users.filter(u => u.isOnline).length,
    admins: users.filter(u => u.role === 'admin').length,
    customers: users.filter(u => u.role === 'customer').length,
    salesReps: users.filter(u => u.role === 'sales').length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">User Management</h1>
        <p className="text-gray-400 text-sm">Monitor and manage user accounts</p>
      </div>

      {/* Stats Cards - Compact Square Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
          {/* Total Users */}
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.total === 0 ? 'opacity-50' : ''}`}>
            <Users className={`w-8 h-8 mb-2 ${stats.total > 0 ? 'text-orange-400' : 'text-gray-500'}`} />
            <p className={`text-2xl font-bold ${stats.total > 0 ? 'text-orange-400' : 'text-gray-500'}`}>{stats.total}</p>
            <p className="text-gray-400 text-xs">Total</p>
          </div>

          {/* Online Now */}
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.online === 0 ? 'opacity-50' : ''}`}>
            <Circle className={`w-8 h-8 mb-2 ${stats.online > 0 ? 'text-green-400 fill-current' : 'text-gray-500'}`} />
            <p className={`text-2xl font-bold ${stats.online > 0 ? 'text-green-400' : 'text-gray-500'}`}>{stats.online}</p>
            <p className="text-gray-400 text-xs">Online</p>
          </div>

          {/* Admins */}
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.admins === 0 ? 'opacity-50' : ''}`}>
            <Shield className={`w-8 h-8 mb-2 ${stats.admins > 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
            <p className={`text-2xl font-bold ${stats.admins > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>{stats.admins}</p>
            <p className="text-gray-400 text-xs">Admins</p>
          </div>

          {/* Customers */}
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.customers === 0 ? 'opacity-50' : ''}`}>
            <UserIcon className={`w-8 h-8 mb-2 ${stats.customers > 0 ? 'text-blue-400' : 'text-gray-500'}`} />
            <p className={`text-2xl font-bold ${stats.customers > 0 ? 'text-blue-400' : 'text-gray-500'}`}>{stats.customers}</p>
            <p className="text-gray-400 text-xs">Customers</p>
          </div>

          {/* Sales Reps */}
          <div className={`bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50 ${stats.salesReps === 0 ? 'opacity-50' : ''}`}>
            <Briefcase className={`w-8 h-8 mb-2 ${stats.salesReps > 0 ? 'text-emerald-400' : 'text-gray-500'}`} />
            <p className={`text-2xl font-bold ${stats.salesReps > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>{stats.salesReps}</p>
            <p className="text-gray-400 text-xs">Sales</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
          <div className="text-red-400 font-bold mb-2">❌ ERROR:</div>
          <pre className="text-red-300 text-xs whitespace-pre-wrap overflow-x-auto">
            {error}
          </pre>
        </div>
      )}

      {/* Add User Form Dropdown */}
      {showAddUserForm && (
        <div className="mb-8 bg-spotify-light-gray rounded-xl p-6 border border-spotify-card-hover">
          <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter user's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green pr-10"
                  placeholder="Enter password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={newUserData.confirmPassword}
                  onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green pr-10"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={addUserLoading}
                className="flex-1 bg-spotify-green hover:bg-spotify-green-hover text-black py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addUserLoading ? 'Creating User...' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddUserForm(false);
                  setNewUserData({ fullName: '', email: '', password: '', confirmPassword: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form Dropdown */}
      {showEditForm && editingUser && (
        <div className="mb-8 bg-spotify-light-gray rounded-xl p-6 border border-spotify-card-hover">
          <h2 className="text-xl font-bold text-white mb-6">Edit User</h2>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editUserData.fullName}
                onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter user's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={editUserData.phone}
                onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={editUserData.address}
                onChange={(e) => setEditUserData({ ...editUserData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter address (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={editUserData.licenseNumber}
                onChange={(e) => setEditUserData({ ...editUserData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                placeholder="Enter license number (optional)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={addUserLoading}
                className="flex-1 bg-spotify-green hover:bg-spotify-green-hover text-black py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addUserLoading ? 'Updating User...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                  setEditUserData({ fullName: '', email: '', phone: '', address: '', licenseNumber: '' });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter - Matching Wholesale Page Style */}
      <div className="bg-card p-4 rounded-lg mb-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="customer">Customers</option>
              <option value="sales">Sales Reps</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Add User Button */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className={`h-4 w-4 transition-transform ${showAddUserForm ? 'rotate-45' : ''}`} />
              <span className="hidden sm:inline">{showAddUserForm ? 'Cancel' : 'Add User'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table - Matching Wholesale Page Style */}
      <div className="bg-card rounded-lg overflow-hidden border border-gray-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">License</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-dark/50 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-spotify-gray rounded-full overflow-hidden flex-shrink-0">
                          {user.photoURL ? (
                            <MediaPlaceholder kind="image" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`text-white font-semibold ${user.isDeleted ? 'line-through opacity-50' : ''}`}>
                            {user.displayName || 'Anonymous'}
                          </p>
                          <p className={`text-gray-400 text-sm flex items-center gap-1 ${user.isDeleted ? 'line-through opacity-50' : ''}`}>
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                          {user.isDeleted && (
                            <p className="text-red-400 text-xs mt-1">Deleted</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <p className={`text-gray-400 text-sm ${user.isDeleted ? 'line-through opacity-50' : ''}`}>
                        {user.phone || '-'}
                      </p>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4">
                      <p className={`text-gray-400 text-sm ${user.isDeleted ? 'line-through opacity-50' : ''} max-w-xs`}>
                        {user.address ? (
                          <span className="whitespace-pre-wrap break-words">
                            {user.address.split(',').map((part, index) => (
                              <span key={index}>
                                {part.trim()}
                                {index < user.address.split(',').length - 1 && <br />}
                              </span>
                            ))}
                          </span>
                        ) : (
                          '-'
                        )}
                      </p>
                    </td>

                    {/* License Number */}
                    <td className="px-6 py-4">
                      <p className={`text-gray-400 text-sm ${user.isDeleted ? 'line-through opacity-50' : ''}`}>
                        {user.licenseNumber || '-'}
                      </p>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role || 'customer'}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        disabled={user.isDeleted}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-dark border border-border text-white focus:outline-none focus:border-primary ${
                          user.isDeleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'
                        }`}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="sales">Sales Rep</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Circle className={`h-3 w-3 ${user.isOnline ? 'text-green-500 fill-current' : 'text-gray-500'}`} />
                        <span className={`text-sm ${user.isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {!user.isDeleted && (
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {user.isDeleted ? (
                          <button
                            onClick={() => handleRestoreUser(user)}
                            className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 hover:text-green-300 rounded-lg transition-colors"
                            title="Restore user"
                          >
                            <UserIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;