// src/utils/certRegistry.ts
import { CISSP_DOMAIN_MAP } from '../cissp/constant';

export interface CertConfig {
  id: string;
  name: string;
  color: string;
  map: Record<string, string>;
}

export const CERT_REGISTRY: Record<string, CertConfig> = {
  cissp: {
    id: 'CISSP',
    name: 'CISSP',
    color: '#00ff41',
    map: CISSP_DOMAIN_MAP
  },
  securityplus: {
    id: 'SEC_PLUS',
    name: 'SECURITY+',
    color: '#0073ae',
    map: {
      'D1': 'General Security Concepts',
      'D2': 'Threats, Vulnerabilities, Mitigations',
      'D3': 'Security Architecture',
      'D4': 'Operations & Incident Response',
      'D5': 'Governance, Risk, Compliance'
    }
  },
  awssap: {
    id: 'AWS_SAP',
    name: 'AWS SA PRO',
    color: '#FF9900',
    map: {
      'D1': 'Design for Org Complexity',
      'D2': 'Design for New Solutions',
      'D3': 'Continuous Improvement',
      'D4': 'Security & Reliability'
    }
  }
};

export const getCertConfigByPath = (path: string): CertConfig => {
  const normalizedPath = path.toLowerCase();
  if (normalizedPath.includes('awssap')) return CERT_REGISTRY.awssap;
  if (normalizedPath.includes('securityplus')) return CERT_REGISTRY.securityplus;
  return CERT_REGISTRY.cissp;
};