import PasswordLogin from '../PasswordLogin';

const AdminLogin = ({ onSuccess }) => {
  const handleSuccess = () => {
    // Just use PIN verification, no Firebase authentication needed
    if (onSuccess) {
      onSuccess();
    }
  };

  return <PasswordLogin type="admin" onSuccess={handleSuccess} />;
};

export default AdminLogin;