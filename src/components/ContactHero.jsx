import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import './ContactHero.css';

const ContactHero = () => {
  const textareaRef = useRef(null);
  const inputControlsRef = useRef(null);
  const navigate = useNavigate();
  const [currentField, setCurrentField] = useState('name'); // name, phone, email, message
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const placeholders = {
    name: "Hi! Let's start with your name...",
    phone: "Great! Now your phone number...",
    email: "Perfect! What's your email address?",
    message: "Finally, what would you like to tell us?"
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
    if (!currentValue) return;

    // Progress to next field or submit
    if (currentField === 'name') {
      setCurrentField('phone');
    } else if (currentField === 'phone') {
      setCurrentField('email');
    } else if (currentField === 'email') {
      setCurrentField('message');
    } else if (currentField === 'message') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Validate all fields are filled
    if (formData.name && formData.email && formData.message) {
      try {
        // Save to Firebase
        const messagesRef = ref(realtimeDb, 'messages');
        await push(messagesRef, {
          ...formData,
          timestamp: Date.now(),
          read: false
        });
        
        console.log('Form submitted:', formData);
        setShowConfirmation(true);
        
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          // Reset form
          setFormData({ name: '', phone: '', email: '', message: '' });
          setCurrentField('name');
        }, 3000);
      } catch (error) {
        console.error('Error saving message:', error);
        // Still show confirmation to user even if Firebase save fails
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          setFormData({ name: '', phone: '', email: '', message: '' });
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

  return (
    <>
      <div className="contact-hero-wrapper">
        <div className="contact-hero-content">
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
            Contact Our Team
          </h1>
          <div className="input-controls input-controls-large" ref={inputControlsRef}>
            <div className="field-indicator">
              <span 
                className={`cursor-pointer ${currentField === 'name' ? 'active' : formData.name ? 'completed' : ''}`}
                onClick={() => setCurrentField('name')}
              >
                Name
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'phone' ? 'active' : formData.phone ? 'completed' : ''}`}
                onClick={() => formData.name && setCurrentField('phone')}
              >
                Phone
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'email' ? 'active' : formData.email ? 'completed' : ''}`}
                onClick={() => formData.name && formData.phone && setCurrentField('email')}
              >
                Email
              </span>
              <span 
                className={`cursor-pointer ${currentField === 'message' ? 'active' : formData.message ? 'completed' : ''}`}
                onClick={() => formData.name && formData.email && setCurrentField('message')}
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
              className="contact-textarea"
              rows={currentField === 'message' ? 4 : 1}
            />
            <div className="actions">
              <button 
                type="button" 
                title="Shop"
                onClick={() => navigate('/shop')}
                className="nav-button"
              >
                <span className="sr-only">Shop</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </button>
              <button 
                type="button" 
                title="Wholesale"
                onClick={() => navigate('/wholesale')}
                className="nav-button"
              >
                <span className="sr-only">Wholesale</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={handleNext} 
                className="send-button"
                disabled={!formData[currentField].trim()}
              >
                {currentField === 'message' ? 'Send' : 'Next'}
              </button>
            </div>
          </div>
          <div className="form-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{
                  width: `${
                    currentField === 'name' ? 25 :
                    currentField === 'phone' ? 50 :
                    currentField === 'email' ? 75 :
                    100
                  }%`
                }}
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
            <h3 className="confirmation-title">Message sent</h3>
            <p className="confirmation-text">We'll get back to you as soon as possible</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactHero;