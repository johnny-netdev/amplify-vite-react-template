import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// Defines the data schema for the app, including UserProfiles and TaskTable.
const schema = a.schema({
  /**
   * A model for storing user profile information.
   * Authorization is set so only the owner of the profile can access it.
   */
  UserProfiles: a
    .model({
      userId: a.string().required(), // Links to the Cognito user's unique ID
      name: a.string(),
      email: a.string().required(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  /**
   * A model for storing tasks for the Kanban board.
   * Authorization is set so only the owner of the tasks can access them.
   */
  TaskTable: a
    .model({
      taskId: a.string().required(),
      userId: a.string(), // Links to the UserProfiles.userId
      title: a.string().required(),
      description: a.string(),
      status: a.string().required(), // e.g., "TODO", "In-progress", "Done"
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

// Exports the client-side schema type.
export type Schema = ClientSchema<typeof schema>;

// Defines the data resource configuration.
export const data = defineData({
  schema,
  // Sets the default authorization mode to use Cognito User Pools.
  // This means users must be logged in to interact with the data.
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});