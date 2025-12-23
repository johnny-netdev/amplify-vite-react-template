// src/apps/securityplus/constant.ts
import { DomainData } from '../utils/vaultEngine';

export const SEC_PLUS_RAW_DATA: DomainData[] = [
  { id: '1', name: 'General Security Concepts', weight: 1, userScore: 0.85 },
  { id: '2', name: 'Threats, Vulnerabilities & Mitigations', weight: 1, userScore: 0.72 },
  { id: '3', name: 'Security Architecture', weight: 1, userScore: 0.64 },
  { id: '4', name: 'Security Operations', weight: 1, userScore: 0.90 },
  { id: '5', name: 'Governance, Risk & Compliance', weight: 1, userScore: 0.55 },
];

export const COMPTIA_THEME = {
  ORANGE: '#ff6600',
  BLUE: '#0073ae',
  NAVY: '#002663',
  SUCCESS: '#28a745', // Standard security green
  CRITICAL: '#dc3545', // Alert/Vulnerability red
};

export const SEC_PLUS_COLORS: Record<string, string> = {
  'D1': COMPTIA_THEME.BLUE,
  'D2': COMPTIA_THEME.ORANGE,
  'D3': COMPTIA_THEME.NAVY,
  'D4': '#8ca4ac', // Cadet Blue for neutral modules
  'D5': '#7d9cb7', // Steel Blue for management modules
};

export const SEC_PLUS_TERMINAL = {
  buttonBorder: '#00ff41',
  buttonText: '#00ff41',
  buttonHoverBg: 'rgba(0, 255, 65, 0.1)',
  accent: '#00ff41'
};