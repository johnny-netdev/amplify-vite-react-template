import React from 'react';
import CompetencyDashboard from './CompetencyDashboard';

const CISSPApp: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>CISSP Learning App</h1>
      <p>Welcome! This app will help you master CISSP domains through gamified learning and quizzes.</p>
      <CompetencyDashboard />
    </div>
  );
};

export default CISSPApp;
