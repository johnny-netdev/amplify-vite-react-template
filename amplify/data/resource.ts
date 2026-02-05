import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // 1. THE VAULTS: Metadata for interactive modules
  CisspVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(), 
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(), 
    s3Path: a.string(),
    certID: a.string().default('CISSP'), // ⭐️ Added for unified filtering
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins')
  ]),

  AwsVisual: a.model({
    title: a.string().required(),
    domain: a.string().required(),
    description: a.string(),
    type: a.enum(['QUIZ', 'DIAGRAM', 'INTERACTIVE', 'LEGACY']),
    config: a.string(),
    s3Path: a.string(),
    certID: a.string().default('AWS_SAP'),
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
    certID: a.string().default('SEC_PLUS'),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins')
  ]),

  // ⭐️ NEW: THE DYNAMIC QUESTION BANK
  // This is where you will "Bulk Upload" your JSON questions.
  QuestionBank: a.model({
    certID: a.string().required(),      // e.g., 'CISSP'
    domain: a.string().required(),      // e.g., 'SOFTWARE_DEV_SEC'
    conceptTag: a.string().required(),  // e.g., 'D8_SDLC_PHASES' (ARIES uses this)
    questionText: a.string().required(),
    options: a.string().array(),        // Store as ["A) Option", "B) Option"]
    correctAnswer: a.string().required(),
    explanation: a.string(),
    difficulty: a.enum(['EASY', 'MEDIUM', 'HARD']),
  }).authorization(allow => [
    allow.authenticated().to(['read']),
    allow.group('Admins')
  ]),

  // 2. THE TELEMETRY: Stores high-level quiz/game results
  UserActivity: a.model({
    userId: a.string().required(),    
    visualId: a.id().required(),      
    domain: a.string().required(),    
    score: a.integer().required(),    
    duration: a.integer().required(), 
    timestamp: a.datetime().required(),
  }).authorization(allow => [
    allow.owner(),
    allow.group('Admins')
  ]),

  // 3. THE PROFILE
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

  // 5. THE AI SIGNALS: Granular tracking for A.R.I.E.S.
  UserInteraction: a.model({
    userEmail: a.string().required(),
    moduleTitle: a.string(),
    conceptTag: a.string(), 
    status: a.enum(['CORRECT', 'INCORRECT', 'STARTED']),
    metadata: a.string(),   
    timestamp: a.datetime().required(),
  }).authorization(allow => [
    allow.owner(),         
    allow.group('Admins')
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});