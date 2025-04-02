
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to auditor home page
  return <Navigate to="/nova-auditoria" replace />;
};

export default Index;
