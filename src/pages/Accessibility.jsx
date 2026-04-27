import MediaPlaceholder from '@/components/MediaPlaceholder.jsx'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Accessibility.css';

const Accessibility = () => {
  const navigate = useNavigate();
  
  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handleKeyClick = (route) => {
    navigate(route);
  };

  return (
    <div className="accessibility-page">
      <main>
        <div className="keypad-container">
          <div className="keypad">
          <div className="keypad__base">
            <MediaPlaceholder kind="image" />
          </div>
          <button 
            id="one" 
            className="key keypad__single keypad__single--left"
            onClick={() => handleKeyClick('/admin')}
          >
            <span className="key__mask">
              <span className="key__content">
                <span className="key__text">A</span>
                <MediaPlaceholder kind="image" />
              </span>
            </span>
          </button>
          <button 
            id="two" 
            className="key keypad__single"
            onClick={() => handleKeyClick('/wholesale')}
          >
            <span className="key__mask">
              <span className="key__content">
                <span className="key__text">W</span>
                <MediaPlaceholder kind="image" />
              </span>
            </span>
          </button>
          <button 
            id="three" 
            className="key keypad__double"
            onClick={() => handleKeyClick('/sales')}
          >
            <span className="key__mask">
              <span className="key__content">
                <span className="key__text">Sales Reps</span>
                <MediaPlaceholder kind="image" />
              </span>
            </span>
          </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Accessibility;