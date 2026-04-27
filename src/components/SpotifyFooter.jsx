import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const SpotifyFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Jobs', href: '/careers' },
      { name: 'For the Record', href: '/blog' },
    ],
    Communities: [
      { name: 'For Artists', href: '/artists' },
      { name: 'Developers', href: '/developers' },
      { name: 'Advertising', href: '/advertising' },
      { name: 'Investors', href: '/investors' },
      { name: 'Vendors', href: '/vendors' },
    ],
    Useful: [
      { name: 'Support', href: '/support' },
      { name: 'Web Player', href: '/player' },
      { name: 'Free Mobile App', href: '/mobile' },
    ],
    Shop: [
      { name: 'All Products', href: '/shop' },
      { name: 'Wholesale', href: '/wholesale' },
      { name: 'Contact', href: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Youtube className="h-5 w-5" />, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-spotify-black pt-12 pb-8 mb-16 md:mb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-6 lg:gap-12">
          {/* Logo */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-8">
              <MediaPlaceholder kind="image" />
            </Link>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-spotify-text-subdued mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-base text-white hover:text-spotify-green transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="mt-12 flex items-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-light-gray text-white transition-all hover:bg-spotify-lighter-gray"
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-spotify-light-gray pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap gap-4 text-xs text-spotify-text-subdued">
              <Link to="/legal" className="hover:text-white transition-colors">Legal</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Center</Link>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              <Link to="/about-ads" className="hover:text-white transition-colors">About Ads</Link>
              <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
            <p className="text-xs text-spotify-text-subdued">
              © {currentYear} Brand
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SpotifyFooter;