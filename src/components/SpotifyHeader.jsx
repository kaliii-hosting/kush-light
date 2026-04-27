import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const SpotifyHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Wholesale', href: '/wholesale' },
    { name: 'Lab', href: '/lab-results' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-spotify-black' : 'bg-spotify-black/95'
    }`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <MediaPlaceholder kind="image" />
            </Link>

            {/* Desktop Navigation - Left aligned like Spotify */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-base font-bold transition-colors hover:text-spotify-green ${
                    location.pathname === item.href 
                      ? 'text-spotify-green' 
                      : 'text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <div className="h-8 w-px bg-white/20" />
            <Link
              to="/admin"
              className="text-base font-bold text-spotify-text-subdued transition-colors hover:text-white hover:scale-105"
            >
              Admin
            </Link>
            <a
              href="https://weedmaps.com/brands/brand-brand"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-white rounded-full px-4 py-2 transition-all hover:scale-105 hover:shadow-lg"
            >
              <MediaPlaceholder kind="image" />
            </a>
            <Link
              to="/shop"
              className="rounded-full bg-spotify-green px-8 py-3 text-base font-bold text-black transition-all hover:bg-spotify-green-hover hover:scale-105"
            >
              Shop Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-spotify-light-gray"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-spotify-black">
          <div className="space-y-1 px-4 pb-6 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block rounded-md px-3 py-3 text-xl font-bold transition-colors ${
                  location.pathname === item.href
                    ? 'text-spotify-green'
                    : 'text-white hover:text-spotify-green'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="my-4 h-px bg-white/20" />
            <Link
              to="/admin"
              className="block rounded-md px-3 py-3 text-xl font-bold text-spotify-text-subdued hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
            <a
              href="https://weedmaps.com/brands/brand-brand"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center bg-white rounded-full px-6 py-3 transition-all hover:shadow-lg"
              onClick={() => setIsOpen(false)}
            >
              <MediaPlaceholder kind="image" />
            </a>
            <Link
              to="/shop"
              className="mt-4 block rounded-full bg-spotify-green px-8 py-4 text-center text-xl font-bold text-black hover:bg-spotify-green-hover"
              onClick={() => setIsOpen(false)}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SpotifyHeader;