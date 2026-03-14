# AGENTS Guidelines for This Repository

This repository contains a Next.js application located in the root of this repository. When
working on the project interactively with an agent (e.g. the Codex CLI) please follow
the guidelines below so that the development experience – in particular Hot Module
Replacement (HMR) – continues to work smoothly.

## 1. Use the Development Server, **not** `npm run build`

* **Always use `npm run dev` (or `pnpm dev`, `yarn dev`, etc.)** while iterating on the
  application.  This starts Next.js in development mode with hot-reload enabled.
* **Do _not_ run `npm run build` inside the agent session.**  Running the production
  build command switches the `.next` folder to production assets which disables hot
  reload and can leave the development server in an inconsistent state.  If a
  production build is required, do it outside of the interactive agent workflow.

## 2. Keep Dependencies in Sync

If you add or update dependencies remember to:

1. Update the appropriate lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`).
2. Re-start the development server so that Next.js picks up the changes.

## 3. Coding Conventions

* Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
* Co-locate component-specific styles in the same folder as the component when
  practical.

## 4. Useful Commands Recap

| Command            | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the Next.js dev server with HMR.             |
| `npm run lint`     | Run ESLint checks.                                 |
| `npm run test`     | Execute the test suite using vitest.               |
| `npm run build`    | **Production build – _do not run during agent sessions_** |

---

## Agent Mesh Directives

When modifying the Agent2Agent mesh, follow the core architecture:
* **Everything gets its own A2A Agent**: Domains (Security, Performance, Style, Documentation, Cleanliness, Order, Optimization) and directories (Components, Pages, Scripts, Tests, Styles, Public) each have dedicated agents.
* **All Outputs as Inputs**: Every A2A agent receives every output as input and can independently decide how to react.
* **Agentic Context Engineering & AlphaEvolve**: Agents use reasoning, full context, and continuous parameter mutation to evolve asynchronously.
* Always implement the `Message` protocol completely. Input and Output must explicitly describe `what` (Intent), `where` (Location), `how` (Action), and `reasoning` (Why).
* Aim for asynchronous, parallel development ensuring everything is continuously evolved and kept up-to-date.
* Run `npx tsx scripts/start-mesh.ts` to test background processing changes and start at least one complete A2A Agent mesh per session.

Following these practices ensures that the agent-assisted development workflow stays
fast and dependable.  When in doubt, restart the dev server rather than running the
production build.
