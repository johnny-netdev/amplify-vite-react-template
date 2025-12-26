import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // 1. THE VAULTS: Metadata for interactive modules
  // Users only need to READ these. Admins need to MANAGE (CRUD) them.
  CisspVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(), 
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(), 
    s3Path: a.string(),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins') // Allows you to add/edit modules from an admin panel
  ]),

  AwsVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(),
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(),
    s3Path: a.string(),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins')
  ]),

  SecPlusVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(),
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(),
    s3Path: a.string(),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins')
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
    allow.owner(),         // User manages their own history
    allow.group('Admins')  // Admin can view telemetry for all users
  ]),

  // 3. THE PROFILE: Stores user-specific info
  UserProfile: a.model({
    userId: a.string().required(),
    username: a.string(),
    bio: a.string(),
    profilePic: a.string(),
  }).authorization(allow => [
    allow.owner(), 
    allow.group('Admins')
  ]),

  // 4. THE TASK MANAGER
  Task: a.model({
    title: a.string().required(),
    status: a.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']),
    score: a.integer(),
    certID: a.string(),
    origin: a.enum(['QUIZ_FAILURE', 'TERMINAL_DIAGNOSTIC', 'MANUAL', 'DECAY_RECOVERY']),
    domain: a.string(),
    drillId: a.string(),
    priority: a.integer(),
    metadata: a.json(),
    owner: a.string() 
  }).authorization(allow => [
    allow.owner(), 
    allow.group('Admins')
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Switching default to userPool is safer for a group-based app
    defaultAuthorizationMode: 'userPool',
  },
});