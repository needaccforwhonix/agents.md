# Agent Mesh Simulation

This module implements an "Agent2Agent" simulation where autonomous agents interact in an asynchronous mesh.

## Features

- **Agent2Agent Structure**: Each agent operates independently with its own state and parameters.
- **AlphaEvolve Algorithm**: Agents mutate their parameters (curiosity, responsiveness, creativity, aggression) over time based on interaction.
- **Agentic Context Engineering**: Agents filter inputs based on internal "vocabulary" and current energy levels, simulating context-aware decision making.
- **Asynchronous Processing**: Communication simulates network latency and processing time.

## Architecture

### Logic (`components/AgentMesh/logic/`)

- `Agent.ts`: Core agent class. Handles `receive`, `process`, `mutate`.
- `MeshSimulation.ts`: Controller that manages the agent pool and message broadcasting.
- `types.ts`: TypeScript interfaces for `AgentState`, `Message`, `AgentParams`.

### UI (`components/AgentMesh/ui/`)

- `AgentNode.tsx`: Visual representation of an agent's state.
- `MeshVisualizer.tsx`: Grid layout of agents.
- `ActivityLog.tsx`: Real-time feed of mesh communication.
- `Controls.tsx`: Simulation controls.

## Usage

The simulation is available at `/mesh`.
Click "Start Simulation" to begin the interaction loop.
Use "Add Agent" to dynamically scale the mesh.

## Optimization & Style

The implementation follows a clean, modular structure using React and Tailwind CSS. The simulation logic is decoupled from the UI, allowing for future expansion (e.g., connecting to real LLMs).
