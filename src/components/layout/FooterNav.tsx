// src/components/layout/FooterNav.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../../constants/navItems'; // THIS IS REQUIRED

const FooterNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow md:hidden">
      <div className="flex justify-around py-2">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center text-xs ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default FooterNav;
