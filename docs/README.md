# AGENTS.md

![AGENTS.md logo](./public/og.png)

[AGENTS.md](https://agents.md) is a simple, open format for guiding coding agents.

Think of AGENTS.md as a README for agents: a dedicated, predictable place
to provide context and instructions to help AI coding agents work on your project.

Below is a minimal example of an AGENTS.md file:

```markdown
# Sample AGENTS.md file

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
```

## Website

This repository also includes a basic Next.js website hosted at https://agents.md/
that explains the project’s goals in a simple way, and featuring some examples.

### Running the app locally
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm run dev
   ```
3. Open your browser and go to http://localhost:3000

## Agent2Agent Mesh Architecture

This project also features a parallel broadcast simulation of an Agent Mesh.
All Agents utilize the explicit `Message` protocol which expects:
* `what` (Intent)
* `where` (Location)
* `how` (Action)
* `reasoning` (Why it is desired)

Specialized domains include: Security, Performance, Style, Documentation,
Cleanliness, Order, Optimization. And directories are managed separately
(e.g., Components, Pages, Scripts).

### Running the background simulation
```bash
npx tsx scripts/start-mesh.ts
```

### Advanced Features

* **Configurable Limits:** You can pass a max recursive message limit to the `Mesh` constructor (e.g., `new Mesh(500)`) to allow simulations to run longer. Field bounds are rigorously enforced (max ~2000 tokens per message property) to ensure agents do not bloat application memory.
* **AST Demock Validation:** To maintain purity and real functionality, `AST.ts` parses generated agent typescript responses to reject string literals like `"dummy"`, mock identifiers, and empty function declarations (e.g. `() => {}`). This validation is embedded natively into the `Mesh` continuous broadcast logic to prevent regressions during the recursive event loop.
* **AlphaEvolve:** Parameter mutations are serialized directly into an agent's `reasoning` trace to demonstrate continuous evolution across parallel branches.
