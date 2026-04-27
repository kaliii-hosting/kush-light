import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const AdminHeader = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [];

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-black/80 backdrop-blur-lg border-b border-white/5'
    }`}>
      <nav className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <MediaPlaceholder kind="image" />
            </Link>
          </div>

          {/* Desktop and Mobile CTA Buttons */}
          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown - visible on all screen sizes */}
            <NotificationDropdown />
          </div>
        </div>
      </nav>

    </header>
  );
};

export default AdminHeader;