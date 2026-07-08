import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProductedRoute = () => {
  const token = localStorage.getItem('sessionToken');

  // If no session token found in browser storage, block access and bounce to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Renders the sub-route child pages dynamically inside your App workflow
  return <Outlet />;
};

export default ProductedRoute;
