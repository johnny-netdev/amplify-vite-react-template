import React from 'react';
import TacticalVault from '../components/TacticalVault';
import { AWS_SAP_RAW_DATA, AWS_COLORS } from './constant';

const AWSSAPVaultPage: React.FC = () => {
  return (
    <TacticalVault 
      title="ARCHITECT_VAULT // AWS_SAP_SECTORS"
      domainMap={AWS_SAP_RAW_DATA}
      domainColors={AWS_COLORS}
      accentColor="#ff9900" // AWS Orange accent
      model="AwsVisual" // Dynamic model for AWS
    />
  );
};

export default AWSSAPVaultPage;