import React from 'react';
import CompetencyDashboard from './CompetencyDashboard';

const AWSSAPApp: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>AWS Solutions Architect Professional App</h1>
      <p>Welcome! This app will help you master AWS SA Pro topics through gamified learning and quizzes.</p>
      <CompetencyDashboard />
    </div>
  );
};

export default AWSSAPApp;
