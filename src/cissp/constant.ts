
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

// Helpful for colors if you want to color-code your cards by domain
export const DOMAIN_COLORS: Record<string, string> = {
  RISK_MGMT: '#ff4d4d',
  ASSET_SEC: '#ffa64d',
  SEC_ARCH_ENG: '#ffff4d',
  COMM_NET_SEC: '#4dff4d',
  IAM: '#4dffff',
  SEC_ASSESS_TEST: '#4d4dff',
  SEC_OPS: '#a64dff',
  SOFTWARE_DEV_SEC: '#ff4dff',
};

export const CISSP_TERMINAL = {
  buttonBorder: '#234de5ff',
  buttonText: '#234de5ff',
  buttonHoverBg: 'rgba(0, 255, 65, 0.1)',
  accent: '#234de5ff'
};
