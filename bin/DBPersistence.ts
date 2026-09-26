import Database from "better-sqlite3";
import { Message, AgentContext } from "../src/logic/Types";
import fs from "fs";

export class DBPersistence {
  private db: Database.Database;

  constructor(dbPath: string = ".agent_mesh.db") {
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        what TEXT NOT NULL,
        where_field TEXT NOT NULL,
        how TEXT NOT NULL,
        reasoning TEXT
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        parameters TEXT NOT NULL
      );
    `);
  }

  public saveMessage(message: Message) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO messages (id, senderId, timestamp, what, where_field, how, reasoning)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      message.id,
      message.senderId,
      message.timestamp,
      message.what,
      message.where,
      message.how,
      message.reasoning || null
    );
  }

  public saveAgentState(context: AgentContext) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agents (id, name, role, parameters)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(
      context.id,
      context.name,
      context.role,
      JSON.stringify(context.parameters)
    );
  }

  public loadMessages(limit: number = 1000): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.reverse().map(row => ({
      id: row.id,
      senderId: row.senderId,
      timestamp: row.timestamp,
      what: row.what,
      where: row.where_field,
      how: row.how,
      reasoning: row.reasoning || undefined
    }));
  }

  public loadAgentStates(): any[] {
    const stmt = this.db.prepare(`SELECT * FROM agents`);
    return stmt.all().map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      parameters: JSON.parse(row.parameters)
    }));
  }

  public close() {
    this.db.close();
  }
}
