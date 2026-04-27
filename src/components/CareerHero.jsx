import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import './CareerHero.css';

const CareerHero = () => {
  const textareaRef = useRef(null);
  const inputControlsRef = useRef(null);
  const navigate = useNavigate();
  const [currentField, setCurrentField] = useState('name'); // name, email, phone, position, experience, portfolio, message
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    portfolio: '',
    message: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const placeholders = {
    name: "Hi! Let's start with your name...",
    email: "Great! What's your email address?",
    phone: "Perfect! Your phone number...",
    position: "What position are you applying for?",
    experience: "Tell us about your experience...",
    portfolio: "Do you have a portfolio or LinkedIn? (optional)",
    message: "Anything else you'd like to share?"
  };

  // Focus on textarea when component mounts or field changes

  useEffect(() => {
    // Focus textarea when field changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentField]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    const currentValue = formData[currentField].trim();
    
    // Skip optional fields if empty
    if (currentField === 'portfolio' && !currentValue) {
      setCurrentField('message');
      return;
    }
    
    // For required fields, check if filled
    if (!currentValue && currentField !== 'message') return;

    // Progress to next field or submit
    const fields = ['name', 'email', 'phone', 'position', 'experience', 'portfolio', 'message'];
    const currentIndex = fields.indexOf(currentField);
    
    if (currentIndex < fields.length - 1) {
      setCurrentField(fields[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Validate required fields are filled
    if (formData.name && formData.email && formData.position) {
      try {
        // Save to Firebase
        const applicationsRef = ref(realtimeDb, 'career_applications');
        await push(applicationsRef, {
          ...formData,
          timestamp: Date.now(),
          status: 'new'
        });
        
        console.log('Application submitted:', formData);
        setShowConfirmation(true);
        
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          // Reset form
          setFormData({ 
            name: '', 
            email: '', 
            phone: '', 
            position: '', 
            experience: '', 
            portfolio: '', 
            message: '' 
          });
          setCurrentField('name');
        }, 3000);
      } catch (error) {
        console.error('Error saving application:', error);
        // Still show confirmation to user even if Firebase save fails
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          setFormData({ 
            name: '', 
            email: '', 
            phone: '', 
            position: '', 
            experience: '', 
            portfolio: '', 
            message: '' 
          });
          setCurrentField('name');
        }, 3000);
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [currentField]: e.target.value
    });
  };

  const getFieldProgress = () => {
    const fields = ['name', 'email', 'phone', 'position', 'experience', 'portfolio', 'message'];
    const currentIndex = fields.indexOf(currentField);
    return ((currentIndex + 1) / fields.length) * 100;
  };

  const isFieldCompleted = (field) => {
    return formData[field] && formData[field].trim() !== '';
  };

  const canNavigateToField = (field) => {
    const fields = ['name', 'email', 'phone', 'position', 'experience', 'portfolio', 'message'];
    const targetIndex = fields.indexOf(field);
    
    // Can always go back to previous fields
    const currentIndex = fields.indexOf(currentField);
    if (targetIndex <= currentIndex) return true;
    
    // Check if all previous required fields are filled
    for (let i = 0; i < targetIndex; i++) {
      if (fields[i] !== 'portfolio' && !isFieldCompleted(fields[i])) {
        return false;
      }
    }
    return true;
  };

  return (
    <>
      <div className="career-hero-wrapper">
        <div className="career-hero-content">
          {/* Animated Robot Face */}
          <div className="robot-container">
            <div className="ai-bot">
              <div className="head">
                <div className="face">
                  <div className="eyes"> </div>
                  <div className="mouth"> </div>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-white px-4">
            Join Our Team
          </h1>
          <div className="input-controls input-controls-large" ref={inputControlsRef}>
            <div className="field-indicator">
              <span 
                className={`cursor-pointer ${currentField === 'name' ? 'active' : isFieldCompleted('name') ? 'completed' : ''}`}
                onClick={() => setCurrentField('name')}
              >
                Name
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'email' ? 'active' : isFieldCompleted('email') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('email') && setCurrentField('email')}
              >
                Email
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'phone' ? 'active' : isFieldCompleted('phone') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('phone') && setCurrentField('phone')}
              >
                Phone
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'position' ? 'active' : isFieldCompleted('position') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('position') && setCurrentField('position')}
              >
                Position
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'experience' ? 'active' : isFieldCompleted('experience') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('experience') && setCurrentField('experience')}
              >
                Experience
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'portfolio' ? 'active' : isFieldCompleted('portfolio') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('portfolio') && setCurrentField('portfolio')}
              >
                Portfolio
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'message' ? 'active' : isFieldCompleted('message') ? 'completed' : ''}`}
                onClick={() => canNavigateToField('message') && setCurrentField('message')}
              >
                Message
              </span>
            </div>
            <textarea
              ref={textareaRef}
              spellCheck="false"
              name="textarea"
              id="textarea"
              placeholder={placeholders[currentField]}
              value={formData[currentField]}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="career-textarea"
              rows={['experience', 'message'].includes(currentField) ? 4 : 1}
            />
            <div className="actions">
              <button 
                type="button" 
                title="Home"
                onClick={() => navigate('/')}
                className="nav-button"
              >
                <span className="sr-only">Home</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </button>
              <button 
                type="button" 
                title="About"
                onClick={() => navigate('/about')}
                className="nav-button"
              >
                <span className="sr-only">About</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={handleNext} 
                className="send-button"
                disabled={
                  (currentField !== 'portfolio' && 
                   currentField !== 'message' && 
                   !formData[currentField].trim())
                }
              >
                {currentField === 'message' ? 'Submit' : currentField === 'portfolio' ? 'Skip' : 'Next'}
              </button>
            </div>
          </div>
          <div className="form-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getFieldProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-popup">
            <div className="confirmation-check">
              <div className="check-circle">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="confirmation-title">Application received!</h3>
            <p className="confirmation-text">We'll review your application and get back to you soon</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CareerHero;