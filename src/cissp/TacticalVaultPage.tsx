// src/apps/cissp/TacticalVaultPage.tsx
import TacticalVault from '../components/TacticalVault';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from './constant';

// 1. Define the interface for the props
interface CISSPVaultProps {
  accentColor?: string;
}

// 2. Accept the props in the function arguments
const CISSPVault: React.FC<CISSPVaultProps> = ({ accentColor = "#234de5ff" }) => {
  return (
    <TacticalVault 
      title="INTEL_VAULT // CISSP_SECTORS"
      domainMap={CISSP_DOMAIN_MAP}
      domainColors={DOMAIN_COLORS}
      accentColor={accentColor} // 3. Pass it down to the engine
      model="CisspVisual" 
    />
  );
};

export default CISSPVault;