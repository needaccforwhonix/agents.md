# TODO

- Connect specific AgentMesh simulation outcomes directly to the real application interface.
- Add real persistence (database) to agent states to replace in-memory maps.
- Fine-tune AlphaEvolve hyperparameters over many concurrent test runs.
- Develop custom Web Worker architecture to run simulations completely decoupled from the main thread.
- Explore integration with actual Language Models (LLMs) utilizing generated JSON definitions.

## Agent Mesh Optimization Backlog

### Demock
- [x] Refactor AST analysis to use Schema v2, separating errors, warnings, and suggestions.
- [x] Ensure `TODO` and `console.log` generate warnings instead of halting validation.
- [ ] Implement deeper semantic validation for hardcoded test patterns (e.g., matching standard mock library outputs).

### Testing
- [x] Ensure all Vitest unit and E2E tests are passing after AST schema modifications.
- [x] Remove `console.log` statements from test assertions.
- [ ] Implement mock coverage reports for specific domain logic paths.

### ACE (Agentic Context Engineering)
- [x] Verified parameter mutations in reasoning strings using the simulated AlphaEvolve setup.
- [ ] Map ACE parameter bounds to real LLM token capacities per model definition (e.g., Gemini 1.5 Pro).

### CI/CD Pipeline
- [x] Ensure `pnpm run lint` and `pnpm test` run perfectly via GitHub Actions `.github/workflows/ci.yml`.
- [ ] Integrate automatic Vercel PR deployments for frontend verification.

### E2E Testing
- [x] Validate AgentMesh recursive simulation dropping messages properly (E2E bounds and Demock limits).
- [ ] Implement Playwright visual verification scripts for Next.js interface updates.

### AST
- [x] Implement robust AST V2 checks ensuring strictly strictly additive updates.
- [x] Reject empty function declarations (`() => {}`) in code outputs.
- [ ] Add explicit checks against destructive file operations (e.g., removing imports that are still referenced).

### Documentation
- [x] Created targeted TODO items based on continuous optimization request.
- [ ] Expand `README.md` with detailed instructions on configuring the custom AST rules.
- [ ] Add extensive TSDoc comments to `RuleBasedBrain.ts`.

## Done

- Implement German-specific AgentMesh Prompt instructions ensuring explicit formatting around Optimizations, Demock Testing, ACE, E2E Testing, AST, Documentation updates, and full system modifications.
- Enhance CI/CD pipeline tests to integrate automatic Demock checks continuously by embedding AST analysis into the active Mesh broadcast validation logic.
- Implement root agent for the root directory
- Enhance RuleBasedBrain prompt generation with structured Jules output formats
- Implement complex dynamic Demock testing patterns within AST.ts analysis including `TODO` and `console.log` validations.
- Connect individual directory agents to the mesh simulation script for wider testing.
- Introduce Message parameter bound validations using simulated token counts.
- Monitor the mesh simulation with an expanded set of agents and verify continuous background execution
