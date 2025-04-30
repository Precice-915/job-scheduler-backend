import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Users,
  UserCog,
  FileText,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Droplet as DropletPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Sidebar: React.FC = () => {
  const { signOut, user, profile } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [collapsed, setCollapsed] = useState(isMobile);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={`bg-[#1E40AF] text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex flex-col h-screen fixed lg:relative z-30`}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        {!collapsed && (
          <div className="flex items-center">
            <DropletPlus className="h-8 w-8 text-white" />
            <span className="ml-3 font-bold text-lg whitespace-nowrap">Precise Leak</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <DropletPlus className="h-8 w-8 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white p-1 rounded-full hover:bg-blue-700 lg:flex hidden"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <Home size={20} />
            {!collapsed && <span className="ml-4">Dashboard</span>}
          </NavLink>

          <NavLink
            to="/jobs"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <ClipboardList size={20} />
            {!collapsed && <span className="ml-4">Jobs</span>}
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <Users size={20} />
            {!collapsed && <span className="ml-4">Clients</span>}
          </NavLink>

          <NavLink
            to="/technicians"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <UserCog size={20} />
            {!collapsed && <span className="ml-4">Technicians</span>}
          </NavLink>

          <NavLink
            to="/invoices"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <FileText size={20} />
            {!collapsed && <span className="ml-4">Invoices</span>}
          </NavLink>

          <NavLink
            to="/schedule"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <Calendar size={20} />
            {!collapsed && <span className="ml-4">Schedule</span>}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => `
              flex items-center py-3 px-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} 
              transition-colors duration-200 mb-1
            `}
          >
            <Settings size={20} />
            {!collapsed && <span className="ml-4">Settings</span>}
          </NavLink>
        </nav>

        <div>
          {!collapsed && profile && (
            <div className="px-4 py-2">
              <p className="text-sm text-blue-200">{profile.full_name}</p>
              <p className="text-xs text-blue-300 capitalize">{profile.role}</p>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center w-full py-3 px-4 hover:bg-blue-700 transition-colors duration-200"
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-4">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
