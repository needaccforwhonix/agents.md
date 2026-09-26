import React from 'react';
// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeshVisualizer } from '../../src/ui/MeshVisualizer';

import { Mesh } from '../../src/logic/Mesh';

describe('MeshVisualizer Component', () => {
  it('should render the "Start Simulation" button', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    render(<MeshVisualizer />);
    const startButton = screen.getAllByText(/Start Simulation/i)[0];
    expect(startButton).toBeDefined();
  });

  it('should change button text when simulation starts', async () => {
    // Mock the fetch call for /api/files
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );

    const mockBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MeshVisualizer />);

    // Wait for the component to finish initial fetch and enable the button
    await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
      expect((btns[0] as HTMLButtonElement).disabled).toBe(false);
    });

    const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
    const activeBtn = btns[0] as HTMLButtonElement;

    fireEvent.click(activeBtn);

    // Check if the button is updated
    await waitFor(() => {
      const allBtns = screen.getAllByRole('button');
      const simBtn = allBtns.find(b => b.textContent?.includes('Simulating'));
      expect(simBtn).toBeDefined();
      expect((simBtn as HTMLButtonElement).disabled).toBe(true);
    });

    mockBroadcast.mockRestore();
  });

  it('should load state from localStorage gracefully if valid JSON', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const mockState = {
      messages: [{
        id: 'msg-1', senderId: 'TestSender', timestamp: 1234,
        what: 'test-what', where: 'test-where', how: 'test-how', reasoning: 'test-reasoning'
      }],
      agents: [{
        id: 'agent-1',
        context: {
          id: 'agent-1',
          name: 'DevBot',
          role: 'Developer',
          history: [],
          parameters: { responsiveness: 0.99 }
        }
      }]
    };
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockState));

    render(<MeshVisualizer />);

    // Wait for the UI to update with fetched items and localized state
    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('agentMeshState');
      expect(screen.getByText(/TestSender/i)).toBeDefined();
      expect(screen.getByText(/test-what/i)).toBeDefined();
      expect(screen.getByText(/test-reasoning/i)).toBeDefined();
    });

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should handle invalid localStorage state gracefully without crashing', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error("Simulated localStorage error");
    });

    // Should render without throwing an error
    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalled();
      const startButton = screen.getAllByText(/Start Simulation/i)[0];
      expect(startButton).toBeDefined();
    });

    getItemSpy.mockRestore();
  });

  it('should save state to localStorage upon simulation completion and handle error if setItem throws', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );

    const mockBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 10))
    );

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error("Simulated setItem quota error");
    });

    render(<MeshVisualizer />);

    await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
      expect((btns[0] as HTMLButtonElement).disabled).toBe(false);
    });

    const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
    fireEvent.click(btns[0]);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('agentMeshState', expect.any(String));
    });

    setItemSpy.mockRestore();
    mockBroadcast.mockRestore();
  });

  it('should render messages correctly even if reasoning is absent', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/mock.ts', name: 'mock.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const mockState = {
      messages: [{
        id: 'msg-no-reason', senderId: 'SilentSender', timestamp: 12345,
        what: 'test-what-no-reasoning', where: 'test-where-no', how: 'test-how-no'
      }],
      agents: []
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockState));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(screen.getByText(/SilentSender/i)).toBeDefined();
      expect(screen.getByText(/test-what-no-reasoning/i)).toBeDefined();
    });

    getItemSpy.mockRestore();
  });
});
