import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.string().required(),
      username: a.string().required(),
      bio: a.string(),
      profilePictureUrl: a.url(),
    })
    .authorization(allow => [allow.owner()])
    .secondaryIndexes((index) => [index("userId")]),
  Task: a
    .model({
      taskId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      status: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    })
    .authorization(allow => [allow.owner()]),
  CisspVisual: a
    .model({
      title: a.string().required(),
      description: a.string(),
      domain: a.enum([
        'RISK_MGMT',
        'ASSET_SEC', 
        'SEC_ARCH_ENG', 
        'COMM_NET_SEC', 
        'IAM', 
        'SEC_ASSESS_TEST', 
        'SEC_OPS', 
        'SOFTWARE_DEV_SEC'
      ]),
      s3Path: a.string().required(), // Location of the image in S3
    })
    .authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  },
});