import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Search, Filter, CheckCircle } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

// Default lab results (fallback)
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

const LabResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [labResults, setLabResults] = useState(DEFAULT_LAB_RESULTS);
  const [loading, setLoading] = useState(true);

  // Fetch lab results from Firebase
  useEffect(() => {
    const labsRef = ref(realtimeDb, 'lab_results');
    const unsubscribe = onValue(labsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Check if labs are active
        if (data.isActive === false) {
          // Labs are disabled - show empty results
          setLabResults([]);
        } else if (data.results) {
          // Labs are active - show results from Firebase
          const resultsArray = Object.entries(data.results).map(([key, value]) => ({
            ...value,
            id: key
          }));
          setLabResults(resultsArray);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter products based on search and category
  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || result.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent h-96"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-10 h-10 text-primary" />
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Lab Results
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Verified third-party lab testing results for all Brand products. 
              Your safety and transparency are our priority.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-6 py-3 rounded-full outline-none focus:bg-white/20 transition-all duration-200"
                />
              </div>

              {/* Category Filter - Centered on mobile */}
              <div className="flex gap-2 justify-center flex-wrap">
                {['all', 'cartridge', 'diamonds', 'pod'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full capitalize transition-all duration-200 text-sm md:text-base ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {category === 'all' ? 'All' : category === 'diamonds' ? 'Diamonds' : category === 'pod' ? 'Pods' : 'Cartridges'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-6 text-gray-400 font-medium">#</th>
                  <th className="text-left p-6 text-gray-400 font-medium">Product Name</th>
                  <th className="text-left p-6 text-gray-400 font-medium">Type</th>
                  <th className="text-center p-6 text-gray-400 font-medium">Status</th>
                  <th className="text-center p-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr 
                    key={result.id}
                    className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-6 text-gray-500">{index + 1}</td>
                    <td className="p-6">
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:text-primary transition-colors flex items-center gap-2 group"
                      >
                        {result.name}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="p-6 text-gray-400">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        result.category === 'diamonds' ? 'bg-purple-500/20 text-purple-400' :
                        result.category === 'pod' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {result.type}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-full transition-all duration-200 text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View PDF
                        </a>
                        <a
                          href={result.url}
                          download
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {filteredResults.map((result, index) => (
              <div 
                key={result.id}
                className="p-6 border-b border-gray-800/50 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 text-sm">#{index + 1}</span>
                      <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <a 
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {result.name}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      result.category === 'diamonds' ? 'bg-purple-500/20 text-purple-400' :
                      result.category === 'pod' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    View PDF
                  </a>
                  <a
                    href={result.url}
                    download
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredResults.length === 0 && (
            <div className="p-20 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No lab results found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Quality You Can Trust
            </h2>
            <p className="text-gray-300 mb-6">
              All Brand products undergo rigorous third-party laboratory testing to ensure purity, potency, and safety. 
              Our commitment to transparency means you can access detailed lab results for every product we offer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-gray-400">Tested Products</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">3rd Party</div>
                <div className="text-sm text-gray-400">Independent Labs</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl font-bold text-primary mb-2">Full Panel</div>
                <div className="text-sm text-gray-400">Comprehensive Testing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResults;