import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import React, { useEffect } from 'react';
import './DockNavigation.css';

const DockNavigation = ({ activeSection, setActiveSection, onLogout }) => {
  // Navigation items with custom Supabase icon URLs
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Home',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/home%20icon.png?v=2'
    },
    { 
      id: 'products', 
      label: 'Wholesale',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/wholesale%20icon.png?v=2'
    },
    { 
      id: 'wholesale', 
      label: 'Invoices',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/Invoices.png?v=2'
    },
    { 
      id: 'blog', 
      label: 'Blog',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/blog%20icon.png?v=2'
    },
    { 
      id: 'logos', 
      label: 'Logo',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/logos%20icon.png?v=2'
    },
    { 
      id: 'passwords', 
      label: 'Passwords',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/Passwords%20icon.png?v=2'
    },
    { 
      id: 'footer', 
      label: 'Footer',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/Footer%20icon.png?v=2'
    },
    { 
      id: 'music', 
      label: 'Music',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/music%20icon.png?v=2'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/messages%20icon.png?v=2'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/analytics.png'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/users%20icon.png?v=2'
    },
    { 
      id: 'storage', 
      label: 'Storage',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/Storage%20icon.png?v=2'
    },
    { 
      id: 'logout', 
      label: 'Logout',
      icon: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Admin%20Dashboard%20Icons/Logout%20icon.png?v=2',
      isLogout: true
    },
  ];

  useEffect(() => {
    // Exact clone of the original nav behavior
    const navItems = document.querySelectorAll('.nav-item');
    
    // Helper function to add/remove a class to a sibling at a given offset
    const toggleSiblingClass = (items, index, offset, className, add) => {
      const sibling = items[index + offset];
      if (sibling) {
        sibling.classList.toggle(className, add);
      }
    };

    // Event listeners to toggle classes on hover
    const mouseEnterHandlers = [];
    const mouseLeaveHandlers = [];
    
    navItems.forEach((item, index) => {
      const mouseEnterHandler = () => {
        item.classList.add('hover'); // Add .hover to current item
        // Toggle classes for siblings
        toggleSiblingClass(navItems, index, -1, 'sibling-close', true); // Previous sibling
        toggleSiblingClass(navItems, index, 1, 'sibling-close', true);  // Next sibling
        toggleSiblingClass(navItems, index, -2, 'sibling-far', true);   // Previous-previous sibling
        toggleSiblingClass(navItems, index, 2, 'sibling-far', true);    // Next-next sibling
      };
      
      const mouseLeaveHandler = () => {
        item.classList.remove('hover'); // Remove .hover from current item
        // Toggle classes for siblings
        toggleSiblingClass(navItems, index, -1, 'sibling-close', false); // Previous sibling
        toggleSiblingClass(navItems, index, 1, 'sibling-close', false);  // Next sibling
        toggleSiblingClass(navItems, index, -2, 'sibling-far', false);   // Previous-previous sibling
        toggleSiblingClass(navItems, index, 2, 'sibling-far', false);    // Next-next sibling
      };
      
      mouseEnterHandlers.push(mouseEnterHandler);
      mouseLeaveHandlers.push(mouseLeaveHandler);
      
      item.addEventListener('mouseenter', mouseEnterHandler);
      item.addEventListener('mouseleave', mouseLeaveHandler);
    });

    // Cleanup
    return () => {
      navItems.forEach((item, index) => {
        item.removeEventListener('mouseenter', mouseEnterHandlers[index]);
        item.removeEventListener('mouseleave', mouseLeaveHandlers[index]);
      });
    };
  }, []);

  const handleItemClick = (item) => {
    if (item.isLogout) {
      onLogout();
    } else {
      setActiveSection(item.id);
    }
  };

  return (
    <div className="nav-wrap">
      <nav className="nav-bar">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                type="button"
                className="nav-item__link"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleItemClick(item);
                }}
              >
                <MediaPlaceholder kind="image" />
              </button>
              <div className="nav-item__tooltip">
                <div>{item.label}</div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DockNavigation;