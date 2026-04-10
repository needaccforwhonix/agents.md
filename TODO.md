
# TODO

- Explore integration with real application UI.
- Connect specific AgentMesh simulation outcomes directly to the real application interface.
- Add real persistence (database) to agent states to replace in-memory maps.
- Fine-tune AlphaEvolve hyperparameters over many concurrent test runs.
- Develop custom Web Worker architecture to run simulations completely decoupled from the main thread.
- Explore integration with actual Language Models (LLMs) utilizing generated JSON definitions.
- Enhance CI/CD pipeline tests to integrate automatic Demock checks continuously.

## Done


- Implement root agent for the root directory
- Enhance RuleBasedBrain prompt generation with structured Jules output formats
- Implement complex dynamic Demock testing patterns within AST.ts analysis including `TODO` and `console.log` validations.
- Added CI/CD agent.

- Connect individual directory agents to the mesh simulation script for wider testing.
- Introduce Message parameter bound validations using simulated token counts.
- Monitor the mesh simulation with an expanded set of agents and verify continuous background execution
