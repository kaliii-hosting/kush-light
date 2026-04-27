import { useState } from 'react'
import './GlowingButton.css'

const GlowingButton = ({ children, onClick, className = '', ...props }) => {
  const [isActive, setIsActive] = useState(false)

  const handleClick = (e) => {
    setIsActive(true)
    setTimeout(() => setIsActive(false), 1200)
    if (onClick) onClick(e)
  }

  return (
    <button
      className={`glowing-button ${isActive ? 'active' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      <span className="text">{children}</span>
      <span className="shimmer"></span>
    </button>
  )
}

export default GlowingButton