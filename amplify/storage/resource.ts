import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cisspVault',
  access: (allow) => ({
    // 'media/*' is our central directory for all interactive visuals
    'media/*': [
      // 1. Allow you (the admin) full control
      allow.authenticated.to(['read', 'write', 'delete']),
      // 2. Allow guests/students to ONLY read the content
      allow.guest.to(['read']) 
    ],
  })
});