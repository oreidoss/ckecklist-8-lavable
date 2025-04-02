
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to nova-auditoria page as requested
  return <Navigate to="/nova-auditoria" replace />;
};

export default Index;
