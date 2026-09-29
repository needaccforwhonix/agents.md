import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DBPersistence } from "../../logic/DBPersistence";
import { Message, AgentContext } from "../../logic/Types";
import fs from "fs";

describe("DBPersistence", () => {
  const dbPath = ".test_agent_mesh.db";
  let db: DBPersistence;

  beforeEach(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    db = new DBPersistence(dbPath);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  it("should save and load messages", () => {
    const msg: Message = {
      id: "msg1",
      senderId: "agent1",
      timestamp: 1000,
      what: "test what",
      where: "test where",
      how: "test how",
      reasoning: "test reasoning"
    };

    db.saveMessage(msg);

    const loaded = db.loadMessages();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("msg1");
    expect(loaded[0].reasoning).toBe("test reasoning");
  });

  it("should save and load messages without reasoning gracefully", () => {
    const msg: Message = {
      id: "msg2",
      senderId: "agent2",
      timestamp: 2000,
      what: "test what",
      where: "test where",
      how: "test how",
      reasoning: ""
    };

    db.saveMessage(msg);

    const loaded = db.loadMessages();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("msg2");
    expect(loaded[0].reasoning).toBe("");
  });

  it("should save and load agent states", () => {
    const context: AgentContext = {
      id: "agent1",
      name: "Test Agent",
      role: "Test Role",
      history: [],
      parameters: { responsiveness: 0.8, generation: 1 }
    };

    db.saveAgentState(context);

    const loaded = db.loadAgentStates();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("agent1");
    expect(loaded[0].parameters.responsiveness).toBe(0.8);
  });

  it("should not fail when saving identical message twice (INSERT OR IGNORE)", () => {
    const msg: Message = {
      id: "msg_duplicate",
      senderId: "agent1",
      timestamp: 1000,
      what: "test what",
      where: "test where",
      how: "test how",
      reasoning: "test reasoning"
    };

    db.saveMessage(msg);
    // Saving again should not throw an error
    expect(() => db.saveMessage(msg)).not.toThrow();

    const loaded = db.loadMessages();
    expect(loaded.length).toBe(1);
  });

  it("should overwrite existing agent state correctly (INSERT OR REPLACE)", () => {
    const context: AgentContext = {
      id: "agent_replace",
      name: "Test Agent",
      role: "Test Role",
      history: [],
      parameters: { responsiveness: 0.8, generation: 1 }
    };

    db.saveAgentState(context);

    // Modify and save again
    context.parameters.responsiveness = 0.9;
    db.saveAgentState(context);

    const loaded = db.loadAgentStates();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe("agent_replace");
    expect(loaded[0].parameters.responsiveness).toBe(0.9);
  });

  it("should respect the limit parameter when loading messages", () => {
    for (let i = 0; i < 5; i++) {
      db.saveMessage({
        id: `msg-${i}`,
        senderId: "agent1",
        timestamp: 1000 + i,
        what: "test what",
        where: "test where",
        how: "test how",
        reasoning: "test reasoning"
      });
    }

    const loadedAll = db.loadMessages(10);
    expect(loadedAll.length).toBe(5);

    const loadedLimited = db.loadMessages(2);
    expect(loadedLimited.length).toBe(2);
    // Should get the newest messages (highest timestamp) first before reverse,
    // so after reverse they are ordered by timestamp ascending
    expect(loadedLimited[0].id).toBe("msg-3");
    expect(loadedLimited[1].id).toBe("msg-4");
  });

  it.each([
    { limit: 0, expectedCount: 0 },
    { limit: -1, expectedCount: 5 }
  ])("should handle limit parameter edge cases for loadMessages ($limit)", ({ limit, expectedCount }) => {
    for (let i = 0; i < 5; i++) {
      db.saveMessage({
        id: `msg-edge-${i}`,
        senderId: "agent1",
        timestamp: 1000 + i,
        what: "test what",
        where: "test where",
        how: "test how",
        reasoning: "test reasoning"
      });
    }

    const loaded = db.loadMessages(limit);
    expect(loaded.length).toBe(expectedCount);
  });

  describe("Table-Driven Boundary and Nil Checks (Zero-Mockup / Fail-Fast)", () => {
    it.each([
      { name: "null message", val: null },
      { name: "undefined message", val: undefined },
    ])("should throw error for $name in saveMessage", ({ val }) => {
      expect(() => db.saveMessage(val as unknown as Message)).toThrow("Message cannot be null or undefined");
    });

    it.each([
      { name: "null context", val: null },
      { name: "undefined context", val: undefined },
    ])("should throw error for $name in saveAgentState", ({ val }) => {
      expect(() => db.saveAgentState(val as unknown as AgentContext)).toThrow("Agent context cannot be null or undefined");
    });
  });
});
