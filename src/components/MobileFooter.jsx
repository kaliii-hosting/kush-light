import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Users, Phone } from 'lucide-react';

const MobileFooter = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Wholesale', href: '/wholesale', icon: Users },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all ${
                isActive 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileFooter;