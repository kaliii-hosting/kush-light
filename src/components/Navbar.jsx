import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-huly-bg/80 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-[1312px] mx-auto px-5 lg:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <MediaPlaceholder kind="image" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#resources" className="text-white/80 hover:text-white text-[15px] font-medium transition-colors">
              Resources
            </a>
            <a href="#community" className="text-white/80 hover:text-white text-[15px] font-medium transition-colors">
              Community
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white text-[15px] font-medium transition-colors">
              Pricing
            </a>
            <div className="flex items-center space-x-4 ml-8">
              <a href="#signin" className="text-white text-[15px] font-medium">
                Sign In
              </a>
              <a 
                href="#try-free" 
                className="bg-huly-blue hover:bg-huly-blue/90 text-white px-6 py-2.5 rounded-full text-[15px] font-medium transition-all hover:shadow-[0_0_20px_rgba(71,139,235,0.5)]"
              >
                Try it Free
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-huly-bg/95 backdrop-blur-md border-t border-huly-border">
          <div className="px-5 py-6 space-y-4">
            {/* Mobile Menu Logo */}
            <div className="pb-4 border-b border-huly-border mb-4">
              <MediaPlaceholder kind="image" />
            </div>
            <a href="#resources" className="block text-white/80 text-[15px] font-medium">
              Resources
            </a>
            <a href="#community" className="block text-white/80 text-[15px] font-medium">
              Community
            </a>
            <a href="#pricing" className="block text-white/80 text-[15px] font-medium">
              Pricing
            </a>
            <div className="pt-4 space-y-3">
              <a href="#signin" className="block text-white text-[15px] font-medium">
                Sign In
              </a>
              <a href="#try-free" className="block bg-huly-blue text-white text-center px-6 py-2.5 rounded-full text-[15px] font-medium">
                Try it Free
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;