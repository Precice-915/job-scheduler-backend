import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet as DropletPlus, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <DropletPlus className="h-16 w-16 text-blue-600" />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-xl text-gray-600">Page not found</p>
      <p className="mt-2 text-gray-500 max-w-md text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button icon={<Home size={16} />}>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
