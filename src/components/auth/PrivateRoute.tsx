import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export function PrivateRoute() {
  const user = useStore((state) => state.user);
  const location = useLocation();

  // Permitir acesso à página /access mesmo sem autenticação
  if (location.pathname === '/access') {
    return <Outlet />;
  }

  if (!user) {
    console.log('[PrivateRoute] Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}