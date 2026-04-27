import { AlertCircle } from 'lucide-react';

const Underage = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Access Denied
        </h1>
        
        <p className="text-spotify-text-subdued mb-8">
          You must be 21 years or older to access this website.
        </p>
        
        <p className="text-sm text-spotify-text-subdued">
          Please come back when you meet the age requirement.
        </p>
      </div>
    </div>
  );
};

export default Underage;