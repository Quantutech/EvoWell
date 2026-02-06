import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = `#${location.pathname}${location.search}`;

  return (
    <>
      <Navbar currentPath={currentPath} />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default PublicLayout;
