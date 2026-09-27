import React from 'react';
// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeshVisualizer } from '../../ui/MeshVisualizer';

import { Mesh } from '../../logic/Mesh';

describe('MeshVisualizer Component', () => {
  it('should render the "Start Simulation" button', () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    render(<MeshVisualizer />);
    const startButton = screen.getAllByText(/Start Simulation/i)[0];
    expect(startButton).toBeDefined();
  });

  it('should change button text when simulation starts', async () => {
    // spy the fetch call for /api/files
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );

    const spyBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
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

    spyBroadcast.mockRestore();
  });

  it('should load state from localStorage gracefully if valid JSON', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const testState = {
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
          history: [{ id: 'old-msg', senderId: 'user', timestamp: 1, what: 'w', where: 'w', how: 'h', reasoning: 'r' }],
          parameters: { responsiveness: 0.99, customStringVal: "string-value" }
        }
      }]
    };
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(testState));

    render(<MeshVisualizer />);

    // Wait for the UI to update with fetched items and localized state
    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('agentMeshState');
      expect(screen.getByText(/TestSender/i)).toBeDefined();
      expect(screen.getByText(/test-what/i)).toBeDefined();
      expect(screen.getByText(/test-reasoning/i)).toBeDefined();
      expect(screen.getByText(/string-value/i)).toBeDefined();
    });

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should handle agents data with missing history during hydration', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const testState = {
      messages: "not-an-array", // Cover line 73 falsy array check
      agents: "not-an-array" // Cover line 78 falsy array check
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(testState));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('agentMeshState');
    });

    getItemSpy.mockRestore();
  });

  it('should handle agents data context hydration without history', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const testState = {
      messages: [],
      agents: [{
        id: 'agent-2',
        context: {
          id: 'agent-2',
          name: 'SecBot',
          role: 'Security Analyst',
          parameters: { responsiveness: 0.05 }
          // history intentionally omitted to trigger fallback logic line 86
        }
      }]
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(testState));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('agentMeshState');
    });

    getItemSpy.mockRestore();
  });

  it("should not start simulation if meshRef is null", async () => {
    // This will trigger the check `if (!meshRef || isSimulating) return;` since meshRef is null.
    render(<MeshVisualizer />);
    const startButton = screen.getAllByRole("button", { name: /Start Simulation/i })[0];
    fireEvent.click(startButton);
    await waitFor(() => {
      expect((startButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('should ignore simulation start if already simulating', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );

    let resolveBroadcast: (value: void | PromiseLike<void>) => void;
    const spyBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
      () => new Promise((resolve) => {
        resolveBroadcast = resolve;
      })
    );

    render(<MeshVisualizer />);

    await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /Start Simulation/i });
      expect((btns[0] as HTMLButtonElement).disabled).toBe(false);
    });

    const activeBtn = screen.getAllByRole('button', { name: /Start Simulation/i })[0] as HTMLButtonElement;

    // First click
    fireEvent.click(activeBtn);

    // Attempt second click while simulating
    fireEvent.click(activeBtn);

    expect(spyBroadcast).toHaveBeenCalledTimes(1);

    // Resolve broadcast
    resolveBroadcast!();

    await waitFor(() => {
      expect((activeBtn as HTMLButtonElement).disabled).toBe(false);
    });

    spyBroadcast.mockRestore();
  });

  it('should handle invalid localStorage state gracefully without crashing', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
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
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );

    const spyBroadcast = vi.spyOn(Mesh.prototype, 'broadcast').mockImplementation(
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
    spyBroadcast.mockRestore();
  });

  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should correctly register agents for all file extensions', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { path: 'testDir', name: 'testDir', isDirectory: true },
          { path: 'sample.ts', name: 'sample.ts', isDirectory: false },
          { path: 'sample.tsx', name: 'sample.tsx', isDirectory: false },
          { path: 'sample.json', name: 'sample.json', isDirectory: false },
          { path: 'sample.md', name: 'sample.md', isDirectory: false },
          { path: 'sample.unknown', name: 'sample.unknown', isDirectory: false },
        ]),
      } as unknown as Response)
    );
    const testState = { messages: [], agents: [] };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(testState));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(screen.getAllByText(/Directory Manager/i)).toBeDefined();
      expect(screen.getAllByText(/TypeScript File Manager/i)).toBeDefined();
      expect(screen.getAllByText(/React Component Manager/i)).toBeDefined();
      expect(screen.getAllByText(/JSON Config Manager/i)).toBeDefined();
      expect(screen.getAllByText(/Markdown Documenter/i)).toBeDefined();
      expect(screen.getAllByText(/File Manager/i)).toBeDefined();
    });

    getItemSpy.mockRestore();
  });

  it('should render messages correctly even if reasoning is absent', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const testState = {
      messages: [{
        id: 'msg-no-reason', senderId: 'SilentSender', timestamp: 12345,
        what: 'test-what-no-reasoning', where: 'test-where-no', how: 'test-how-no'
      }],
      agents: []
    };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(testState));

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(screen.getByText(/SilentSender/i)).toBeDefined();
      expect(screen.getByText(/test-what-no-reasoning/i)).toBeDefined();
    });

    getItemSpy.mockRestore();
  });

  it('should handle invalid JSON from localStorage gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ path: 'src/sample.ts', name: 'sample.ts', isDirectory: false }]),
      } as unknown as Response)
    );
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue("invalid-json");

    render(<MeshVisualizer />);

    await waitFor(() => {
      expect(getItemSpy).toHaveBeenCalledWith('agentMeshState');
    });

    getItemSpy.mockRestore();
  });
});
