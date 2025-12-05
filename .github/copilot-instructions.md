# Copilot Instructions for amplify-vite-react-template

## Project Architecture
- **Frontend**: React (TypeScript) app bootstrapped with Vite (`src/`, `public/`, `index.html`).
- **Amplify Backend**: AWS Amplify project in `amplify/` with subfolders for `auth/` (Cognito) and `data/` (DynamoDB, AppSync). Backend resources are defined in `amplify/*/resource.ts` files.
- **Configuration**: Project-level config in `amplify.yml`, `vite.config.ts`, and TypeScript configs.

## Key Workflows
- **Install dependencies**: `npm install` (root and `amplify/` if backend code is modified)
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Amplify CLI**: Use `amplify/` as the working directory for backend commands (e.g., `amplify push`, `amplify status`).

## Patterns & Conventions
- **Amplify Resources**: Each backend resource (auth, data) has a `resource.ts` for configuration. Follow existing structure for new resources.
- **TypeScript**: Use strict typing throughout (`tsconfig.json`).
- **Component Structure**: Place React components in `src/`. Use functional components and hooks.
- **Assets**: Static assets go in `src/assets/` or `public/`.
- **Environment Variables**: Managed via Vite (`.env` files, `import.meta.env`).

## Integration Points
- **Auth**: Cognito setup in `amplify/auth/resource.ts`.
- **API/Data**: AppSync and DynamoDB in `amplify/data/resource.ts`.
- **Frontend-Backend**: Use Amplify JS libraries to connect React app to backend services.

## Examples
- To add a new backend resource, copy the pattern in `amplify/auth/resource.ts` or `amplify/data/resource.ts`.
- To use authentication in React, import from Amplify libraries and reference the Cognito setup.

## References
- See `README.md` for high-level project info.
- See `CONTRIBUTING.md` for security and contribution guidelines.

---
For more, see https://docs.amplify.aws/ and Vite/React documentation.