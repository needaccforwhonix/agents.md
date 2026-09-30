import { describe, it, expect } from 'vitest';
import { LLMBrain } from '../../logic/LLMBrain';
import { RuleBasedBrain } from '../../logic/RuleBasedBrain';
import { Mesh } from '../../logic/Mesh';
import { Agent } from '../../logic/Agent';
import { Message, AgentContext } from '../../logic/Types';

describe('Architectural Audit - Edge Cases & Boundary Conditions', () => {
    describe('LLMBrain Edge Cases', () => {
        it('should throw error for null or undefined message input', async () => {
            const brain = new LLMBrain();
            const ctx: AgentContext = { id: 'agent-1', name: 'Agent', role: 'Role', history: [], parameters: {} };
            await expect(brain.decide(null as unknown as Message, ctx)).rejects.toThrow('Input message cannot be null or undefined');
            await expect(brain.decide(undefined as unknown as Message, ctx)).rejects.toThrow('Input message cannot be null or undefined');
        });

        it('should throw error for null or undefined context input', async () => {
            const brain = new LLMBrain();
            const msg: Message = { id: '1', senderId: 'sys', timestamp: 1, what: 'w', where: 'w', how: 'h', reasoning: 'r' };
            await expect(brain.decide(msg, null as unknown as AgentContext)).rejects.toThrow('Input context cannot be null or undefined');
            await expect(brain.decide(msg, undefined as unknown as AgentContext)).rejects.toThrow('Input context cannot be null or undefined');
        });

        it('should drop message if sender matches context id', async () => {
             const brain = new LLMBrain();
             const msg: Message = { id: '1', senderId: 'agent-1', timestamp: 1, what: 'w', where: 'w', how: 'h', reasoning: 'r' };
             const ctx: AgentContext = { id: 'agent-1', name: 'Agent', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
             const response = await brain.decide(msg, ctx);
             expect(response).toBeNull();
        });

        it('should fallback responsiveness if parameters missing and occasionally drop message', async () => {
             const brain = new LLMBrain();
             const msg: Message = { id: '1', senderId: 'sys', timestamp: 1, what: 'w', where: 'w', how: 'h', reasoning: 'r' };
             const ctx: AgentContext = { id: 'agent-1', name: 'Agent', role: 'Role', history: [], parameters: undefined as unknown as AgentContext['parameters'] };
             // Use math random spy to simulate dropping
             const originalRandom = Math.random;
             Math.random = () => 0.9; // > 0.5 default responsiveness -> null
             try {
                const response = await brain.decide(msg, ctx);
                expect(response).toBeNull();
             } finally {
                Math.random = originalRandom;
             }
        });
    });

    describe('RuleBasedBrain Edge Cases', () => {
        it('should handle token limits by truncating long inputs correctly', async () => {
            const brain = new RuleBasedBrain();
            const longString = 'a'.repeat(5000);
            const msg: Message = {
                id: '1', senderId: 'sys', timestamp: 1,
                what: longString, where: longString, how: longString, reasoning: longString
            };
            const ctx: AgentContext = { id: 'agent-1', name: 'Agent', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };

            const originalRandom = Math.random;
            Math.random = () => 0.1; // Ensure it responds
            try {
                const response = await brain.decide(msg, ctx);
                expect(response).not.toBeNull();
                expect(response?.what).toContain('...');
                expect(response?.what).not.toContain('a'.repeat(4001));
            } finally {
                Math.random = originalRandom;
            }
        });
    });

    describe('Mesh Edge Cases', () => {
        it('should throw error when registering invalid agent', () => {
            const mesh = new Mesh();
            expect(() => mesh.registerAgent(null as unknown as Agent)).toThrow('Invalid Agent: Agent and Agent Context must be fully defined.');
            expect(() => mesh.registerAgent({} as Agent)).toThrow('Invalid Agent: Agent and Agent Context must be fully defined.');
        });

        it('should throw error when broadcasting null or undefined message', async () => {
            const mesh = new Mesh();
            await expect(mesh.broadcast(null as unknown as Message)).rejects.toThrow('Invalid Message: Message cannot be null or undefined.');
            await expect(mesh.broadcast(undefined as unknown as Message)).rejects.toThrow('Invalid Message: Message cannot be null or undefined.');
        });

        it('should throw error when hydrating invalid messages array', () => {
            const mesh = new Mesh();
            expect(() => mesh.setMessages(null as unknown as Message[])).toThrow('Invalid Messages: Messages must be a valid array.');
            expect(() => mesh.setMessages(undefined as unknown as Message[])).toThrow('Invalid Messages: Messages must be a valid array.');
        });

        it('should not process message that exceeds token bounds', async () => {
            const mesh = new Mesh();
            const mockAgent = new Agent('a1', 'A', 'R', new RuleBasedBrain(), { responsiveness: 1.0 }); // force response if it gets this far
            mesh.registerAgent(mockAgent);

            // Create a message that is huge
            // 'a '.repeat(5000) has length 10000. 10000 / 4 = 2500 tokens. Wait, the limit is 4000 tokens per field!
            // So we need > 16000 chars!
            const hugeString = 'a'.repeat(20000);
            const msg: Message = { id: '1', senderId: 'sys', timestamp: 1, what: hugeString, where: 'w', how: 'h', reasoning: 'r' };

            await mesh.broadcast(msg);
            // It will be added to mesh messages, but won't trigger further processing.
            const messages = mesh.getMessages();
            expect(messages).toHaveLength(1);
        });

        it('should safely swallow agent errors during broadcast without crashing the mesh', async () => {
             const mesh = new Mesh();
             // Create a bad brain that throws
             class BadBrain extends RuleBasedBrain {
                 async decide(): Promise<Message | null> {
                     throw new Error("Deliberate failure in Agent Brain");
                 }
             }
             const mockAgent = new Agent('a1', 'A', 'R', new BadBrain(), {});
             mesh.registerAgent(mockAgent);
             const msg: Message = { id: '1', senderId: 'sys', timestamp: 1, what: 'test', where: 'test', how: 'test', reasoning: 'test' };
             // Broadcast should not reject
             await expect(mesh.broadcast(msg)).resolves.not.toThrow();
        });
    });
});
