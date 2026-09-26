import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DBPersistence } from "../../bin/DBPersistence";
import { Message, AgentContext } from "../../src/logic/Types";
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
});
