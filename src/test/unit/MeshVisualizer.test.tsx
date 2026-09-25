import React from 'react';
// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeshVisualizer } from '../../ui/MeshVisualizer';

import { Mesh } from '../../logic/Mesh';

describe('MeshVisualizer Component', () => {
  it('should render the "Start Simulation" button', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'mock.ts', name: 'mock.ts', isDirectory: false }]),
      })
    ) as unknown as typeof global.fetch;
    render(<MeshVisualizer />);
    const startButton = screen.getAllByText(/Start Simulation/i)[0];
    expect(startButton).toBeDefined();
  });

  it('should change button text when simulation starts', async () => {
    // Mock the fetch call for /api/files
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'mock.ts', name: 'mock.ts', isDirectory: false }]),
      })
    ) as unknown as typeof global.fetch;

    const mockBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MeshVisualizer />);

    // Wait for the component to finish initial fetch and enable the button
    // We'll use findByText to poll until the button text updates.
    // wait for it to be enabled
    await new Promise((resolve) => setTimeout(resolve, 50));

    const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
    const activeBtn = btns[0] as HTMLButtonElement;

    fireEvent.click(activeBtn);

    // After clicking, wait for the state to transition
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Check if the button is updated
    const allBtns = screen.getAllByRole('button');
    const simBtn = allBtns.find(b => b.textContent?.includes('Simulating'));
    expect(simBtn).toBeDefined();
    expect((simBtn as HTMLButtonElement).disabled).toBe(true);

    mockBroadcast.mockRestore();
  });
});
