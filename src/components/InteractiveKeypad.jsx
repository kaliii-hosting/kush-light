import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ShoppingBag, Package } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import LazyVideo from './LazyVideo';
import './InteractiveKeypad.css';

const InteractiveKeypad = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [pressedKeys, setPressedKeys] = useState({
    video: false,
    product: false,
    shop: false
  });
  
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [displayContent, setDisplayContent] = useState('video');

  const clickAudioRef = useRef(null);

  // Sample videos - you can replace these with actual video URLs
  const videos = [
    {
      id: 1,
      title: "Premium Sample Collection",
      url: "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01//background%20real.mp4",
      description: "Explore our finest selection"
    },
    {
      id: 2,
      title: "Behind the Scenes",
      url: "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01//background%20real.mp4",
      description: "See how we grow and process"
    },
    {
      id: 3,
      title: "Customer Stories",
      url: "https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01//background%20real.mp4",
      description: "Hear from our community"
    }
  ];

  useEffect(() => {
    // Initialize audio
    clickAudioRef.current = new Audio('https://cdn.freesound.org/previews/378/378085_6260145-lq.mp3');
    clickAudioRef.current.volume = 0.3;
  }, []);

  const handleKeyPress = (keyId) => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    setPressedKeys(prev => ({ ...prev, [keyId]: true }));
  };

  const handleKeyRelease = (keyId) => {
    setPressedKeys(prev => ({ ...prev, [keyId]: false }));
  };

  const handleVideoClick = () => {
    handleKeyPress('video');
    setDisplayContent('video');
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const handleProductClick = () => {
    handleKeyPress('product');
    setDisplayContent('product');
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const handleShopClick = () => {
    handleKeyPress('shop');
    navigate('/shop');
  };

  return (
    <div className="keypad-main">
      <div className="keypad-wrapper">
        {/* Keypad Section with Original 3D Design */}
        <div className="keypad-section">
          <div className="keypad keypad-front-facing">
            <div className="keypad__base">
              <MediaPlaceholder kind="image" />
            </div>
            <button 
              id="one" 
              className="key keypad__single keypad__single--left"
              data-pressed={pressedKeys.video}
              onPointerDown={() => handleKeyPress('video')}
              onPointerUp={() => handleKeyRelease('video')}
              onPointerLeave={() => handleKeyRelease('video')}
              onClick={handleVideoClick}
            >
              <span className="key__mask">
                <span className="key__content">
                  <span className="key__text">next video</span>
                  <MediaPlaceholder kind="image" />
                </span>
              </span>
            </button>
            <button 
              id="two" 
              className="key keypad__single"
              data-pressed={pressedKeys.product}
              onPointerDown={() => handleKeyPress('product')}
              onPointerUp={() => handleKeyRelease('product')}
              onPointerLeave={() => handleKeyRelease('product')}
              onClick={handleProductClick}
            >
              <span className="key__mask">
                <span className="key__content">
                  <span className="key__text">next product</span>
                  <MediaPlaceholder kind="image" />
                </span>
              </span>
            </button>
            <button 
              id="three" 
              className="key keypad__double"
              data-pressed={pressedKeys.shop}
              onPointerDown={() => handleKeyPress('shop')}
              onPointerUp={() => handleKeyRelease('shop')}
              onPointerLeave={() => handleKeyRelease('shop')}
              onClick={handleShopClick}
            >
              <span className="key__mask">
                <span className="key__content">
                  <span className="key__text">shop</span>
                  <MediaPlaceholder kind="image" />
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="display-section">
          {displayContent === 'video' && (
            <div className="display-content">
              <LazyVideo
                key={currentVideoIndex}
                src={videos[currentVideoIndex].url}
                className="display-video"
                autoPlay
                loop
                muted
                threshold={0.1}
                rootMargin="50px"
              />
              <div className="display-overlay">
                <h3 className="display-title">{videos[currentVideoIndex].title}</h3>
                <p className="display-description">{videos[currentVideoIndex].description}</p>
              </div>
            </div>
          )}
          
          {displayContent === 'product' && products.length > 0 && (
            <div className="display-content product-display">
              <div className="product-showcase">
                <div className="product-image-wrapper">
                  {products[currentProductIndex]?.imageUrl && (
                    <MediaPlaceholder kind="image" />
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{products[currentProductIndex]?.name}</h3>
                  <p className="product-price">${products[currentProductIndex]?.price}</p>
                  <p className="product-description">{products[currentProductIndex]?.description || 'Premium quality Sample product'}</p>
                  <button 
                    onClick={() => navigate('/shop')}
                    className="product-cta"
                  >
                    View in Shop
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveKeypad;