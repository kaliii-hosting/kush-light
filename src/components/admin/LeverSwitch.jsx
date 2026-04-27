import { useState, useEffect } from 'react';
import './LeverSwitch.css';

const LeverSwitch = ({ isChecked, onChange, id = 'lever' }) => {
  const [isPristine, setIsPristine] = useState(true);

  const handleChange = (e) => {
    setIsPristine(false);
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="lever-container">
      <input
        type="checkbox"
        name={id}
        className={`lever ${isPristine ? 'pristine' : ''}`}
        id={id}
        checked={isChecked}
        onChange={handleChange}
        role="switch"
        aria-label={id}
        aria-checked={isChecked}
      />
      <label htmlFor={id}><span>On</span></label>
      <label htmlFor={id}><span>Off</span></label>
    </div>
  );
};

export default LeverSwitch;
