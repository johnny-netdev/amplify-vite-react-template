import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export const emitRemediationTask = async (
  topic: string,
  score: number,
  domain: string,
  drillId: string
) => {
  // Only emit a task if the user falls below the mastery threshold (e.g., 80%)
  if (score >= 80) return null;

  try {
    const { data: newTask, errors } = await client.models.Task.create({
      title: `REMEDIATE: ${topic} [Score: ${score}%]`,
      status: 'TODO',
      origin: 'QUIZ_FAILURE',
      domain: domain,
      drillId: drillId,
      priority: score < 50 ? 10 : 5, // 10 is Critical, 5 is High
      metadata: JSON.stringify({
        lastAttemptScore: score,
        generatedAt: new Date().toISOString(),
      })
    }, { authMode: 'userPool' });

    if (errors) console.error("Emitter failed to log task:", errors);
    return newTask;
  } catch (err) {
    console.error("Critical error in Task Emitter:", err);
  }
};