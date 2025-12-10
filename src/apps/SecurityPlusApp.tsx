import React from 'react';
import SecurityPlusDashboard from './SecurityPlusDashboard';

const SecurityPlusApp: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Security+ Learning App</h1>
      <p>Welcome! This app will help you master Security+ topics through gamified learning and quizzes.</p>
  <SecurityPlusDashboard />
    </div>
  );
};

export default SecurityPlusApp;
