// src/components/layout/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import FooterNav from './FooterNav';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Always show header */}
      <main className="flex-1 p-4">
        <Outlet /> {/* 🔥 Pages render here */}
      </main>
      <FooterNav /> {/* Always show footer */}
    </div>
  );
};

export default Layout;
