import './AdminLoadingSpinner.css';

// Simple iOS-style neon orange spinner
const AdminLoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={`admin-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="admin-ios-spinner">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="admin-spinner-blade" style={{ transform: `rotate(${i * 30}deg)` }} />
        ))}
      </div>
    </div>
  );
};

export default AdminLoadingSpinner;
