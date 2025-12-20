// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // 1. THE VAULT: Metadata for your interactive HTML modules
  CisspVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(), 
    description: a.string(),
    s3Path: a.string().required(),
  }).authorization(allow => [allow.authenticated()]),

  // 2. THE TELEMETRY: Stores every quiz/game result for weighted readiness math
  UserActivity: a.model({
    userId: a.string().required(),    
    visualId: a.id().required(),      
    domain: a.string().required(),    
    score: a.integer().required(),    
    duration: a.integer().required(), 
    timestamp: a.datetime().required(),
  }).authorization(allow => [allow.authenticated()]),

  // 3. THE PROFILE: Stores user-specific info (referenced in your App.tsx)
  UserProfile: a.model({
    userId: a.string().required(),
    username: a.string(),
    bio: a.string(),
    profilePic: a.string(),
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  // 4. THE TASK MANAGER: Powers your Kanban Board logic
  Task: a.model({
    taskId: a.string().required(),
    title: a.string().required(),
    description: a.string(),
    status: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});