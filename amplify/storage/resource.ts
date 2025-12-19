import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplify-vite-react-template-storage',
  access: (allow) => ({
    'guest-access/*': [
      allow.guest.to(['read']),
    ],
    'protected-access/*': [
      allow.authenticated.to(['read', 'write']),
    ],
    'private-access/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});