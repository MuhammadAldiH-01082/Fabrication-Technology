import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) return null;

  if (profile?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/client" />;
}
