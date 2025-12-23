// src/utils/vaultEngine.ts
export interface DomainData {
  id: string;
  name: string;
  weight: number;    
  userScore: number; 
}

export const useVaultEngine = (domains: DomainData[], sessionStartTime: number) => {
  const totalWeight = domains.reduce((sum, d) => sum + d.weight, 0);
  const weightedTotal = domains.reduce((sum, d) => sum + (d.userScore * d.weight), 0);
  const competencyScore = totalWeight > 0 ? Math.round((weightedTotal / totalWeight) * 100) : 0;

  const minutesElapsed = Math.floor((Date.now() - sessionStartTime) / 60000);
  const fatigueLevel = Math.min(Math.floor(minutesElapsed / 10), 100);

  let stabilityLabel = "INITIALIZING";
  if (competencyScore > 85) stabilityLabel = "COMBAT_READY";
  else if (competencyScore > 70) stabilityLabel = "OPTIMAL";
  else if (competencyScore > 45) stabilityLabel = "STABILIZING";
  else stabilityLabel = "DEGRADED";

  return {
    competencyScore,
    fatigueLevel,
    stabilityLabel,
    fatigueString: fatigueLevel < 5 ? `NOMINAL (${fatigueLevel}%)` : `STRESS_DETECTED (${fatigueLevel}%)`
  };
};