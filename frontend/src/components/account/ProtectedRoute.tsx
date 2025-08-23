import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // ВРЕМЕННО ОТКЛЮЧАЕМ ВСЮ ПРОВЕРКУ - ПРЯМОЙ ДОСТУП!
  return children ? <>{children}</> : <Outlet />;
};

export { ProtectedRoute };
