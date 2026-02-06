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
    const { data: items } = await client.models.UserActivity.list();
    const now = new Date();
    const stats: Record<string, { correct: number; total: number; lastSeen: Date }> = {};

    items.forEach(item => {
      const tag = item.domain || 'UNKNOWN';
      
      if (!stats[tag]) {
        stats[tag] = { 
          correct: 0, 
          total: 0, 
          lastSeen: item.timestamp ? new Date(item.timestamp) : new Date() 
        };
      }
      
      stats[tag].total += 1;
      
      // FIX: Use 'score' to determine if this was a "success"
      // If a domain quiz was < 70%, we count it as a failure for that domain
      if (item.score && item.score >= 70) {
        stats[tag].correct += 1;
      }

      if (item.timestamp && new Date(item.timestamp) > stats[tag].lastSeen) {
        stats[tag].lastSeen = new Date(item.timestamp);
      }
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

  const getAriesChallenge = () => {
    if (insights.weakSpots.length === 0) return null;
    
    // Pick the "weakest" spot first
    const primaryTarget = insights.weakSpots[0];
    
    // Find a matching challenge in our JSON vault
    const challenge = vaultData.challenges.find(c => c.topic === primaryTarget) 
                      || vaultData.challenges.find(c => c.fallacyType === 'STABILITY_CHECK')
                      || vaultData.challenges[0]; // Absolute fallback
    
    return challenge || null;
  };

  useEffect(() => {
    analyzeData();
  }, []);

  return { insights, getAriesChallenge, refresh: analyzeData };
};