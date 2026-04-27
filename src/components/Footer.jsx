import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Youtube, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: 'Shop', href: '/shop' },
      { name: 'Wholesale', href: '/wholesale' },
      { name: 'About', href: '/about' },
    ],
    Resources: [
      { name: 'Blog', href: '/blog' },
      { name: 'Docs', href: '/docs' },
      { name: 'Contact', href: '/contact' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/brand", label: "GitHub" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com/brand", label: "Twitter" },
    { icon: <MessageCircle className="w-5 h-5" />, href: "https://discord.gg/brand", label: "Discord" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com/company/brand", label: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "https://youtube.com/@brand", label: "YouTube" }
  ];

  return (
    <footer className="bg-black border-t border-white/10 mb-16 md:mb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          {/* Mobile Logo - Centered and Bigger */}
          <div className="block md:hidden mb-8">
            <Link to="/" className="flex justify-center mb-4">
              <MediaPlaceholder kind="image" />
            </Link>
            <p className="text-sm text-gray-400 text-center mb-6">
              Premium Sample products delivered with quality and care.
            </p>
            {/* Social links - centered on mobile */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile - All columns in one row */}
          <div className="grid grid-cols-3 gap-4 md:hidden">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-white mb-3">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Desktop Layout - Keep original */}
          <div className="hidden md:grid md:grid-cols-4 lg:gap-12 gap-8">
            {/* Logo and description */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center mb-4">
                <MediaPlaceholder kind="image" />
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                Premium Sample products delivered with quality and care.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Brand. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;