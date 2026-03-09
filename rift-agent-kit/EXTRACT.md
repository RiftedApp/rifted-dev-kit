# Extracting `rift-agent-kit` into its own repository

## Goal

Turn the in-repo scaffold into a standalone repo once you are ready.

## Files to keep

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `README.md`
- `openclaw.example.json`
- `skills/`
- `src/`
- `examples/`
- `.env.example`

## Follow-up changes after extraction

1. Replace:
   - `@rifted/sdk: file:../sdk`

   with a published package version:

   - `@rifted/sdk: x.y.z`

2. Add a root `.gitignore` if needed:
   - `node_modules/`
   - `dist/`
   - `.env.local`

3. Add CI:
   - `npm install`
   - `npm run typecheck`
   - `npm run build`

4. If publishing externally:
   - keep “dumbnet” messaging explicit
   - do not imply TEE verification is live
   - document backend signer risks clearly

## Suggested future additions

- remote Streamable HTTP MCP mode
- role-based tool exposure
- wallet-user mode
- publishable examples for OpenClaw and other MCP-capable clients
