// src/apps/aws/constant.ts
import { DomainData } from '../utils/vaultEngine';

export const AWS_SAP_RAW_DATA: DomainData[] = [
  { id: 'SAP_D1', name: 'Design for Organizational Complexity', weight: 0.26, userScore: 0.80 },
  { id: 'SAP_D2', name: 'Design for New Solutions', weight: 0.29, userScore: 0.75 },
  { id: 'SAP_D3', name: 'Continuous Improvement', weight: 0.25, userScore: 0.60 },
  { id: 'SAP_D4', name: 'Migration & Modernization', weight: 0.20, userScore: 0.92 },
];

export const AWS_COLORS: Record<string, string> = {
  'SAP_D1': '#ff9900', // AWS Orange
  'SAP_D2': '#00ff41',
  'SAP_D3': '#357ae8',
  'SAP_D4': '#ff4b2b',
};