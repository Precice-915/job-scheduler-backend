import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img
            src="https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets/login.png"
            alt="Logo"
            className="h-20 w-20 object-contain"
          />
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading</h2>
        <p className="mt-2 text-gray-600">Please wait while we load your data...</p>
      </div>
    </div>
  );
};

export default LoadingPage;