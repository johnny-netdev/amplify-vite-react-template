import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import vaultData from '../data/challengeVault.json';

const client = generateClient<Schema>();

export const useDiagnosticEngine = () => {
  const [insights, setInsights] = useState<{
    weakSpots: string[];
    atrophyRisk: string[];
    totalPoints: number;
  }>({ weakSpots: [], atrophyRisk: [], totalPoints: 0 });

  const analyzeData = async () => {
    const { data: items } = await client.models.UserInteraction.list();
    const now = new Date();
    const stats: Record<string, { correct: number; total: number; lastSeen: Date }> = {};

    items.forEach(item => {
      const tag = item.conceptTag || 'UNKNOWN';
      if (!stats[tag]) {
        stats[tag] = { correct: 0, total: 0, lastSeen: new Date(item.timestamp) };
      }
      stats[tag].total += 1;
      if (item.status === 'CORRECT') stats[tag].correct += 1;
      const itemDate = new Date(item.timestamp);
      if (itemDate > stats[tag].lastSeen) stats[tag].lastSeen = itemDate;
    });

    const weakSpots = Object.keys(stats).filter(tag => 
      (stats[tag].correct / stats[tag].total) < 0.7
    );

    const atrophyRisk = Object.keys(stats).filter(tag => {
      const hoursSince = (now.getTime() - stats[tag].lastSeen.getTime()) / (1000 * 60 * 60);
      return hoursSince > 48;
    });

    setInsights({ weakSpots, atrophyRisk, totalPoints: items.length });
  };

  // ⭐️ NEW: The Summoner Function
  const getAriesChallenge = () => {
    if (insights.weakSpots.length === 0) return null;
    
    // Pick the "weakest" spot first
    const primaryTarget = insights.weakSpots[0];
    
    // Find a matching challenge in our JSON vault
    const challenge = vaultData.challenges.find(c => c.topic === primaryTarget);
    
    return challenge || null;
  };

  useEffect(() => {
    analyzeData();
  }, []);

  return { insights, getAriesChallenge, refresh: analyzeData };
};