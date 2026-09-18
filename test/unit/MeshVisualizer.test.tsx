import React from 'react';
// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeshVisualizer } from '../../components/AgentMesh/ui/MeshVisualizer';

import { Mesh } from '../../components/AgentMesh/logic/Mesh';

describe('MeshVisualizer Component', () => {
  it('should render the "Start Simulation" button', () => {
    render(<MeshVisualizer />);
    const startButton = screen.getAllByText(/Start Simulation/i)[0];
    expect(startButton).toBeDefined();
  });

  it('should change button text when simulation starts', async () => {
    const mockBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MeshVisualizer />);
    const startButton = screen.getAllByText(/Start Simulation/i)[0];

    fireEvent.click(startButton);

    // Check if the button is updated immediately
    const simulatingButton = await screen.findByText(/Simulating/i);
    expect(simulatingButton).toBeDefined();
    expect(simulatingButton.closest('button')?.disabled).toBe(true);

    mockBroadcast.mockRestore();
  });
});
