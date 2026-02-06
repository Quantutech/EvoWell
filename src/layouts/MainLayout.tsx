import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardNavbar from '@/components/DashboardNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
  variant?: 'public' | 'dashboard' | 'auth';
  currentPath?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, variant = 'public', currentPath = '#/' }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white bg-[#F8FAFC]">
      {variant === 'dashboard' && <DashboardNavbar />}
      {variant === 'public' && <Navbar currentPath={currentPath} />}
      
      <main className="flex-grow">
        {children}
      </main>
      
      {variant === 'public' && <Footer />}
    </div>
  );
};

export default MainLayout;