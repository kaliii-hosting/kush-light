import PasswordLogin from '../components/PasswordLogin';

const WholesaleLogin = ({ onSuccess }) => {
  return <PasswordLogin type="wholesale" onSuccess={onSuccess} />;
};

export default WholesaleLogin;