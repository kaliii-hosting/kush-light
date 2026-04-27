import { useState, useEffect } from 'react';
import { ref, set, onValue, push, remove } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import {
  X, Save, Trash2, Eye, Pencil, FlaskConical, Plus, FileText, ExternalLink
} from 'lucide-react';
import AdminToast from './AdminToast';
import GradientLoader from './GradientLoader';
import LeverSwitch from './LeverSwitch';

// Default lab results data
const DEFAULT_LAB_RESULTS = [
  { id: '1', name: 'Tangie', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20TANGIE%20.pdf', status: 'verified' },
  { id: '2', name: 'Ice Cream Cake', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20ICE%20CREAM%20CAKE%20.pdf', status: 'verified' },
  { id: '3', name: 'Super Lemon Haze', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20SUPER%20LEMON%20HAZE%20.pdf', status: 'verified' },
  { id: '4', name: 'Watermelon Zlushie', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20WATERMELON%20ZLUSHIE.pdf', status: 'verified' },
  { id: '5', name: 'Strawberry Diesel', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20STRAWBERRY%20DIESEL.pdf', status: 'verified' },
  { id: '6', name: 'Lychee Dream', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20LYCHEE%20DREAM.pdf', status: 'verified' },
  { id: '7', name: 'Orange Jack', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20ORANGE%20JACK.pdf', status: 'verified' },
  { id: '8', name: 'Guava Gelato', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20GUAVA%20GELATO.pdf', status: 'verified' },
  { id: '9', name: 'Super Blue Dream', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20SUPER%20BLUE%20DREAM.pdf', status: 'verified' },
  { id: '10', name: 'Do Si Dos', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20DO%20SI%20DOS.pdf', status: 'verified' },
  { id: '11', name: 'Skywalker OG', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20SKYWALKER%20OG.pdf', status: 'verified' },
  { id: '12', name: 'Blueberry Brand', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20BLUEBERRY%20KUSH.pdf', status: 'verified' },
  { id: '13', name: 'King Louis', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20KING%20LOUIS.pdf', status: 'verified' },
  { id: '14', name: 'Godzilla Glue', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20GOZILLA%20GLUE.pdf', status: 'verified' },
  { id: '15', name: 'Pineapple Express', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20PINEAPPLE%20EXPRESS.pdf', status: 'verified' },
  { id: '16', name: 'Mango Brand', type: 'Brand Gold Distillate Pod 1G', category: 'pod', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20POD%201G%20-%20MANGO%20KUSH.pdf', status: 'verified' },
  { id: '17', name: 'Dragon Brand', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20DRAGON%20KUSH.pdf', status: 'verified' },
  { id: '18', name: 'Watermelon Zlushie', type: 'Brand Gold Distillate Pod 1G', category: 'pod', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20POD%201G%20-%20WATERMELON%20ZLUSHIE%20.pdf', status: 'verified' },
  { id: '19', name: 'Super Blue Dream', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20SUPER%20BLUE%20DREAM%20.pdf', status: 'verified' },
  { id: '20', name: 'Grape Limeade', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20GRAPE%20LIMEADE.pdf', status: 'verified' },
  { id: '21', name: 'Tropical Runtz', type: 'Sample Material Diamonds 1G', category: 'diamonds', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/LIVE%20RESIN%20DIAMONDS%201G%20-%20TROPICAL%20RUNTZ.pdf', status: 'verified' },
  { id: '22', name: 'Pink Starburst', type: 'Brand Gold Distillate Pod 1G', category: 'pod', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20POD%201G%20-%20PINK%20STARBURST.pdf', status: 'verified' },
  { id: '23', name: 'Green Crack', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20GREEN%20CRACK.pdf', status: 'verified' },
  { id: '24', name: 'Gelato', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20GELATO.pdf', status: 'verified' },
  { id: '25', name: 'Peach Rings', type: 'Brand Gold Distillate Pod 1G', category: 'pod', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20POD%201G%20-%20PEACH%20RINGS.pdf', status: 'verified' },
  { id: '26', name: 'Vader OG', type: 'Brand Gold Distillate Cartridge 1G', category: 'cartridge', url: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Lab%20Results/BRAND+GOLD%20DISTILLATE%20CARTRIDGE%201G%20-%20VADER%20OG.pdf', status: 'verified' },
];

const LabsEditor = () => {
  const [showForm, setShowForm] = useState(false);
  const [labResults, setLabResults] = useState([]);
  const [editingResult, setEditingResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: 'cartridge',
    url: '',
    status: 'verified'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState(null);

  // Load lab results from Firebase
  useEffect(() => {
    const labsRef = ref(realtimeDb, 'lab_results');
    const unsubscribe = onValue(labsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.results) {
          const resultsArray = Object.entries(data.results).map(([key, value]) => ({
            ...value,
            id: key
          }));
          setLabResults(resultsArray);
        }
        setIsActive(data.isActive !== false);
      } else {
        // Initialize with default data if nothing exists
        initializeDefaults();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize with default data
  const initializeDefaults = async () => {
    try {
      const labsRef = ref(realtimeDb, 'lab_results');
      const resultsObj = {};
      DEFAULT_LAB_RESULTS.forEach(result => {
        resultsObj[result.id] = result;
      });
      await set(labsRef, {
        results: resultsObj,
        isActive: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error initializing lab results:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Start editing a result
  const startEditing = (result) => {
    setEditingResult(result);
    setFormData({
      name: result.name,
      type: result.type,
      category: result.category,
      url: result.url,
      status: result.status || 'verified'
    });
    setShowForm(true);
  };

  // Start adding new result
  const startAdding = () => {
    setEditingResult(null);
    setFormData({
      name: '',
      type: '',
      category: 'cartridge',
      url: '',
      status: 'verified'
    });
    setShowForm(true);
  };

  // Save lab result
  const handleSave = async () => {
    if (!formData.name || !formData.type || !formData.url) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingResult) {
        // Update existing
        const resultRef = ref(realtimeDb, `lab_results/results/${editingResult.id}`);
        await set(resultRef, {
          ...formData,
          id: editingResult.id
        });
        setToast({ message: 'Lab result updated successfully!', type: 'success' });
      } else {
        // Add new
        const resultsRef = ref(realtimeDb, 'lab_results/results');
        const newRef = push(resultsRef);
        await set(newRef, {
          ...formData,
          id: newRef.key
        });
        setToast({ message: 'Lab result added successfully!', type: 'success' });
      }

      // Update timestamp
      const timestampRef = ref(realtimeDb, 'lab_results/updatedAt');
      await set(timestampRef, new Date().toISOString());

      setShowForm(false);
      setEditingResult(null);
    } catch (error) {
      console.error('Error saving lab result:', error);
      setToast({ message: 'Failed to save lab result', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete lab result
  const handleDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this lab result?')) return;

    try {
      const resultRef = ref(realtimeDb, `lab_results/results/${resultId}`);
      await remove(resultRef);
      setToast({ message: 'Lab result deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting lab result:', error);
      setToast({ message: 'Failed to delete lab result', type: 'error' });
    }
  };

  // Toggle activation
  const toggleActivation = async (newState) => {
    const active = typeof newState === 'boolean' ? newState : !isActive;
    try {
      const activeRef = ref(realtimeDb, 'lab_results/isActive');
      await set(activeRef, active);
      setIsActive(active);
      setToast({
        message: `Lab results ${active ? 'activated' : 'deactivated'} successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error toggling activation:', error);
      setToast({ message: 'Failed to toggle activation', type: 'error' });
    }
  };

  // Truncate URL for display
  const truncateUrl = (url, maxLength = 40) => {
    if (!url) return 'Not set';
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'diamonds': return 'bg-purple-500/20 text-purple-400';
      case 'pod': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-orange-500/20 text-orange-400';
    }
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <AdminToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-[#0f0f0f] rounded-lg overflow-hidden">
        {/* Banner Header - Identical to PopupManager */}
        <div className="bg-[#1a1a1a] border-b border-gray-800">
          {/* Top Row - Title and Actions */}
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#272727] rounded-lg">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Labs Editor</h2>
                <p className="text-sm text-gray-400">
                  {labResults.length} lab results | Status: {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Add New Button */}
              <button
                onClick={startAdding}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">{showForm ? 'Close' : 'Manage'}</span>
              </button>

              {/* Activation Toggle */}
              <div className="flex-1 sm:flex-none flex items-center justify-center">
                <LeverSwitch
                  id="labs-lever"
                  isChecked={isActive}
                  onChange={toggleActivation}
                />
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          {!showForm && (
            <div className="bg-[#0f0f0f] border-t border-gray-800">
              <div className="px-4 sm:px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Total Results</span>
                    <span className="text-white font-semibold text-xl">{labResults.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Cartridges</span>
                    <span className="text-white font-semibold text-xl">{labResults.filter(r => r.category === 'cartridge').length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Diamonds</span>
                    <span className="text-white font-semibold text-xl">{labResults.filter(r => r.category === 'diamonds').length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Pods</span>
                    <span className="text-white font-semibold text-xl">{labResults.filter(r => r.category === 'pod').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit/Add Form - ProductForm style */}
        {showForm && (
          <div className="bg-card rounded-lg overflow-hidden border border-gray-700 mt-4 mx-4 sm:mx-6 mb-4">
            {/* Table Header */}
            <div className="bg-gray-dark">
              <div className="grid grid-cols-12 gap-4 px-4 py-3">
                <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Product Name</div>
                <div className="col-span-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Type</div>
                <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Category</div>
                <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</div>
                <div className="col-span-2 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</div>
              </div>
            </div>

            {/* Form Row for Adding/Editing */}
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-4 py-4 items-center bg-gray-dark/30">
                <div className="col-span-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Product name *"
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="e.g., Brand Gold Distillate 1G *"
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="cartridge">Cartridge</option>
                    <option value="diamonds">Diamonds</option>
                    <option value="pod">Pod</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors disabled:bg-gray-600"
                  >
                    <Save className="w-3 h-3" />
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setEditingResult(null); }}
                    className="px-3 py-2 bg-gray-dark border border-border rounded-lg text-white hover:bg-gray-700 text-xs transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* PDF URL Row */}
              <div className="px-4 py-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <label className="block text-xs font-medium text-gray-400 mb-1">PDF URL *</label>
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/lab-result.pdf"
                      className="w-full px-3 py-2 text-sm bg-gray-dark border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Existing Results Table */}
              <div className="max-h-[300px] overflow-y-auto">
                {labResults.map((result) => (
                  <div
                    key={result.id}
                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-dark/30 transition-colors ${editingResult?.id === result.id ? 'bg-primary/10' : ''}`}
                  >
                    <div className="col-span-3">
                      <span className="text-sm text-white font-medium">{result.name}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-xs text-gray-400">{result.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(result.category)}`}>
                        {result.category}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${result.status === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {result.status || 'verified'}
                      </span>
                    </div>
                    <div className="col-span-2 flex gap-1">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-gray-dark border border-border rounded hover:bg-gray-700 transition-colors"
                        title="View PDF"
                      >
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                      <button
                        onClick={() => startEditing(result)}
                        className="p-1.5 bg-blue-600/20 border border-blue-600/50 rounded hover:bg-blue-600/30 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3 h-3 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(result.id)}
                        className="p-1.5 bg-red-600/20 border border-red-600/50 rounded hover:bg-red-600/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LabsEditor;
