
import React from 'react';
import { ChecklistProvider } from '@/contexts/ChecklistContext';
import ChecklistScoresHandler from '@/components/checklist/ChecklistScoresHandler';
import ChecklistMainContainer from '@/components/checklist/ChecklistMainContainer';

const Checklist: React.FC = () => {
  return (
    <ChecklistProvider>
      <ChecklistScoresHandler />
      <ChecklistMainContainer />
    </ChecklistProvider>
  );
};

export default Checklist;
