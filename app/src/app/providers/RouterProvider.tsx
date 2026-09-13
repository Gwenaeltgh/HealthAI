import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Router>{children}</Router>;
};

export default RouterProvider;