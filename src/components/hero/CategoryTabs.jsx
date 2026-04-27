import { Cannabis, Cookie, Sparkles, Package, Battery, Cigarette, Droplet, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { 
      id: 'flower', 
      name: 'Flower', 
      icon: Sample,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-50'
    },
    { 
      id: 'preroll', 
      name: 'Prerolls', 
      icon: Cigarette,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-50'
    },
    { 
      id: 'infused-preroll', 
      name: 'Infused', 
      icon: Sparkles,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-50'
    },
    { 
      id: 'cartridge', 
      name: 'Cartridges', 
      icon: Battery,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-50'
    },
    { 
      id: 'disposable', 
      name: 'Disposables', 
      icon: Package,
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-50'
    },
    { 
      id: 'concentrate', 
      name: 'Concentrate', 
      icon: Droplet,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-50'
    },
    { 
      id: 'edible', 
      name: 'Edible', 
      icon: Cookie,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-50'
    },
    { 
      id: 'merch', 
      name: 'Merch', 
      icon: ShoppingBag,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-50'
    }
  ]

  return (
    <div className="flex gap-1 p-1 overflow-x-auto scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = activeCategory === category.id
        
        return (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              relative px-5 py-2 rounded-full font-medium transition-all duration-200
              ${isActive 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <Icon 
                size={16} 
                className={isActive ? 'text-black' : 'text-gray-400'} 
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default CategoryTabs