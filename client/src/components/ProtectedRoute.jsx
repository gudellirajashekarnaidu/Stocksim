import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminRequired = false }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;
  if (adminRequired && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
