
// Mapping of CISSP domain codes to their full names
export const CISSP_DOMAIN_MAP: Record<string, string> = {
  RISK_MGMT: 'Domain 1: Security and Risk Management',
  ASSET_SEC: 'Domain 2: Asset Security',
  SEC_ARCH_ENG: 'Domain 3: Security Architecture and Engineering',
  COMM_NET_SEC: 'Domain 4: Communication and Network Security',
  IAM: 'Domain 5: Identity and Access Management (IAM)',
  SEC_ASSESS_TEST: 'Domain 6: Security Assessment and Testing',
  SEC_OPS: 'Domain 7: Security Operations',
  SOFTWARE_DEV_SEC: 'Domain 8: Software Development Security',
};
const ISC2_BLUE = '#00829b';
const ISC2_NAVY = '#002b45';

// Helpful for colors if you want to color-code your cards by domain
export const DOMAIN_COLORS: Record<string, string> = {
  RISK_MGMT: ISC2_BLUE,
  ASSET_SEC: ISC2_BLUE,
  SEC_ARCH_ENG: ISC2_BLUE,
  COMM_NET_SEC: ISC2_BLUE,
  IAM: ISC2_BLUE,
  SEC_ASSESS_TEST: ISC2_BLUE,
  SEC_OPS: ISC2_BLUE,
  SOFTWARE_DEV_SEC: ISC2_BLUE,
};

export const CISSP_TERMINAL = {
  buttonBorder: ISC2_NAVY,
  buttonText: '#234de5ff',
  buttonHoverBg: 'rgba(0, 255, 65, 0.1)',
  accent: '#234de5ff'
};
