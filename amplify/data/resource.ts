import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // 1. THE VAULTS: Metadata for your interactive HTML modules
  CisspVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(), 
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(), 
    s3Path: a.string(),
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read']) 
  ]),

  AwsVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(),
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(),
    s3Path: a.string(),
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read'])
  ]),

  SecPlusVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(),
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(),
    s3Path: a.string(),
  }).authorization(allow => [
    allow.publicApiKey(),
    allow.authenticated().to(['read'])
  ]),

  // 2. THE TELEMETRY: Stores quiz/game results
  UserActivity: a.model({
    userId: a.string().required(),    
    visualId: a.id().required(),      
    domain: a.string().required(),    
    score: a.integer().required(),    
    duration: a.integer().required(), 
    timestamp: a.datetime().required(),
  }).authorization(allow => [
    allow.owner(),
    allow.authenticated().to(['read'])
  ]),

  // 3. THE PROFILE: Stores user-specific info
  UserProfile: a.model({
    userId: a.string().required(),
    username: a.string(),
    bio: a.string(),
    profilePic: a.string(),
  }).authorization(allow => [allow.owner(), allow.authenticated().to(['read'])]),

  // 4. THE TASK MANAGER: Powers Kanban Board logic
  Task: a.model({
    title: a.string().required(),
    status: a.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']),
  }).authorization(allow => [allow.owner()]),
}); // Closes the a.schema block

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});