import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface AdminRouteProps {
  // children: React.ReactNode;
}

export function AdminRoute(/* { children }: AdminRouteProps */) {
  const user = useStore((state) => state.user);
  
  // Se não houver usuário ou não for o admin, redireciona para home
  if (!user || user.email !== 'wp22santos@gmail.com') {
    console.log('[AdminRoute] Acesso negado:', user?.email);
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Acesso permitido para admin:', user.email);
  return <Outlet />;
}
