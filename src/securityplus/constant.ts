// src/apps/securityplus/constant.ts
import { DomainData } from '../utils/vaultEngine';

export const SEC_PLUS_RAW_DATA: DomainData[] = [
  { id: '1', name: 'General Security Concepts', weight: 1, userScore: 0.85 },
  { id: '2', name: 'Threats, Vulnerabilities & Mitigations', weight: 1, userScore: 0.72 },
  { id: '3', name: 'Security Architecture', weight: 1, userScore: 0.64 },
  { id: '4', name: 'Security Operations', weight: 1, userScore: 0.90 },
  { id: '5', name: 'Governance, Risk & Compliance', weight: 1, userScore: 0.55 },
];

export const SEC_PLUS_COLORS: Record<string, string> = {
  '1': '#00ff41',
  '2': '#ff4b2b',
  '3': '#357ae8',
  '4': '#f0db4f',
  '5': '#a020f0',
};

export const SEC_PLUS_TERMINAL = {
  buttonBorder: '#00ff41',
  buttonText: '#00ff41',
  buttonHoverBg: 'rgba(0, 255, 65, 0.1)',
  accent: '#00ff41'
};