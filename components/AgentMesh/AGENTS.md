# Agent Mesh Documentation & Guidelines

This directory contains the implementation of the "Agent2Agent" mesh network simulation.

## Architecture

The system follows a strict **Event-Driven Architecture** where:
1.  **Topology:** Full Mesh. Every agent is connected to every other agent via a central broadcast bus.
2.  **Communication:** All outputs from any agent are broadcast as inputs to ALL agents.
3.  **Concurrency:** Agents operate in simulated parallel loops (`setInterval` ticks).

## Core Components

### 1. Logic (`/logic`)
*   **`AgentLogic.ts`**: The main agent class. It orchestrates the Brain, Context, and Evolution modules.
*   **`ContextManager.ts` (ACE)**: Implements "Agentic Context Engineering". It maintains a sliding window of history and filters for relevance.
*   **`EvolutionEngine.ts` (AlphaEvolve)**: Implements evolutionary algorithms. It mutates agent traits (`assertiveness`, `verbosity`, `creativity`) based on feedback or random drift.
*   **`useAgentMesh.ts`**: The React hook that powers the simulation loop and message bus.

### 2. UI (`/ui`)
*   **`MeshLayout.tsx`**: The container.
*   **`AgentCard.tsx`**: Visualizes internal agent state (traits, thoughts).
*   **`BroadcastLog.tsx`**: Displays the immutable ledger of communication.

## Rules for Extension

1.  **Strict Typing**: Always use types from `types.ts`. Input and Output must be unambiguous.
2.  **No Hidden Channels**: Agents must communicate ONLY via the broadcast bus. No side-channel state sharing.
3.  **Evolution**: When modifying `EvolutionEngine`, ensure that mutations are bounded [0, 1] to prevent instability.
4.  **Performance**: The simulation runs in the main thread. Avoid heavy blocking computations in `process()`.

## Terminology

*   **ACE (Agentic Context Engineering)**: The strategy of managing context window efficiency.
*   **AlphaEvolve**: The algorithmic approach to self-improving agent parameters.
*   **Broadcast**: The atomic unit of communication.

## Future Improvements

*   Integrate real LLM API calls in `AgentLogic.ts` (replacing the heuristic `process` method).
*   Implement vector embeddings for `ContextManager` relevance scoring.
*   Add visual graph topology to `MeshLayout`.
