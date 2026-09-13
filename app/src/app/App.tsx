import React from 'react';
import QueryProvider from './providers/QueryProvider';
import RouterProvider from './providers/RouterProvider';
import { ToastProvider } from './providers/ToastProvider';
import { AuthProvider } from '../features/auth/AuthProvider';
import AppPreferencesProvider from './providers/AppPreferencesProvider';
import AppRoutes from '../routes';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider>
        <AppPreferencesProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </AppPreferencesProvider>
      </RouterProvider>
    </QueryProvider>
  );
};

export default App;