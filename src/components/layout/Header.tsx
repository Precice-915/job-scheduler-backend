import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Bell, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitialsAvatar } from '../../lib/utils';

const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchQuery('');
    navigate(`/job-lookup?code=${encodeURIComponent(trimmed)}`, { replace: true });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(open => !open);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/jobs')) return 'Jobs';
    if (p.startsWith('/clients')) return 'Clients';
    if (p.startsWith('/technicians')) return 'Technicians';
    if (p.startsWith('/invoices')) return 'Invoices';
    if (p.startsWith('/schedule')) return 'Schedule';
    if (p.startsWith('/settings')) return 'Settings';
    if (p.startsWith('/job-lookup')) return 'Job Lookup';
    return 'Precise Leak Detection';
  };

  const logoUrl =
    'https://hccksbcfatkncqilccfq.supabase.co/storage/v1/object/public/site-assets/login.png';

  return (
    <header className="bg-white shadow z-20">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: logo + page title */}
        <div className="flex items-center space-x-3">
          <button onClick={toggleMobileMenu} className="text-gray-500 focus:outline-none">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img src={logoUrl} alt="Precise Leak Detection" className="h-8 w-auto" />
          <h1 className="sm:block text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        </div>

        {/* Center: search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search job code, client name, or address…"
              className="w-full bg-gray-100 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>

        {/* Right: actions */}
        <div className="flex items-center space-x-4">
          {location.pathname.startsWith('/jobs') && (
            <button
              onClick={() => {
                navigate('/jobs/new');
                setMobileMenuOpen(false);
              }}
              className="lg:flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New Job
            </button>
          )}

          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-red-600 underline"
          >
            Sign Out
          </button>

          {/* User Avatar now links to Settings */}
          <Link to="/settings" className="relative">
            <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
              <img
                className="h-8 w-8 rounded-full"
                src={
                  profile
                    ? getInitialsAvatar(profile.full_name, '1E40AF')
                    : getInitialsAvatar('User', '1E40AF')
                }
                alt="User"
              />
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="bg-white border-t shadow-md">
          {[
            ['Dashboard', '/'],
            ['Jobs', '/jobs'],
            ['Clients', '/clients'],
            ['Technicians', '/technicians'],
            ['Invoices', '/invoices'],
            ['Schedule', '/schedule'],
            ['Reports', '/reports/payments'],
            ['Settings', '/settings'],
          ].map(([label, href]) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-4 hover:bg-gray-100"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;