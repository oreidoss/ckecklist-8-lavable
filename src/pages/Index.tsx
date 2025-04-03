
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to home page as the main entry point
  return <Navigate to="/" replace />;
};

export default Index;
