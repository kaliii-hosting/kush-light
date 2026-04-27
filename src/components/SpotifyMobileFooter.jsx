import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';

const SpotifyMobileFooter = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: Search },
    { name: 'Cart', href: '/cart', icon: ShoppingBag },
    { name: 'Admin', href: '/admin', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-black via-spotify-black to-transparent z-50">
      <nav className="bg-spotify-black border-t border-spotify-light-gray">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-3 transition-all ${
                  isActive 
                    ? 'text-spotify-green' 
                    : 'text-spotify-text-subdued'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SpotifyMobileFooter;