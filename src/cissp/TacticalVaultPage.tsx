// src/apps/cissp/TacticalVaultPage.tsx
import TacticalVault from '../components/TacticalVault';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from './constant';

const CISSPVault = () => {
  return (
    <TacticalVault 
      title="INTEL_VAULT // CISSP_SECTORS"
      domainMap={CISSP_DOMAIN_MAP}
      domainColors={DOMAIN_COLORS}
      accentColor="#234de5ff" 
    />
  );
};

export default CISSPVault;