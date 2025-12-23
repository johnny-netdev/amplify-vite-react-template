import React from 'react';
import TacticalVault from '../components/TacticalVault';
import { SEC_PLUS_RAW_DATA, SEC_PLUS_COLORS } from './constant';

const SecurityPlusVaultPage: React.FC = () => {
  return (
    <TacticalVault 
      title="TACTICAL_INTEL // SECURITY_PLUS_SECTORS"
      domainMap={SEC_PLUS_RAW_DATA}
      domainColors={SEC_PLUS_COLORS}
      accentColor="#00ff41" // Classic Terminal Green
      model="SecPlusVisual" // Dynamic model for Security+
    />
  );
};

export default SecurityPlusVaultPage;