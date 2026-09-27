import { describe, it, expect } from "vitest";
import { countTokens, boundHistory } from "../../src/logic/ACE";
import { Message } from "../../src/logic/Types";

describe("ACE Module", () => {
  describe("countTokens", () => {
    it("should correctly count tokens (approximate string length / 4)", () => {
      expect(countTokens("")).toBe(0);
      expect(countTokens("1234")).toBe(1);
      expect(countTokens("12345678")).toBe(2);
      expect(countTokens("123456789")).toBe(3);
    });
  });

  describe("boundHistory", () => {
    it("should keep messages within token limit", () => {
      const msg1: Message = { id: "1", senderId: "s", timestamp: 1, what: "12", where: "", how: "", reasoning: "" };
      const msg2: Message = { id: "2", senderId: "s", timestamp: 2, what: "123", where: "", how: "", reasoning: "" };
      const history = [msg1, msg2];

      const bounded = boundHistory(history, 10);
      expect(bounded).toEqual(history);
    });

    it("should truncate older messages if token limit exceeded", () => {
      const msg1: Message = { id: "1", senderId: "s", timestamp: 1, what: "1234", where: "", how: "", reasoning: "" };
      const msg2: Message = { id: "2", senderId: "s", timestamp: 2, what: "12345678", where: "", how: "", reasoning: "" };
      const history = [msg1, msg2];

      const bounded = boundHistory(history, 4);
      expect(bounded).toEqual([msg2]);
    });

    it("should return empty array if maxTokens is 0", () => {
      const msg: Message = { id: "1", senderId: "s", timestamp: 1, what: "1", where: "2", how: "3", reasoning: "4" };
      const history = [msg];
      expect(boundHistory(history, 0)).toEqual([]);
    });

    it("should safely handle null or undefined history array", () => {
      expect(boundHistory(null as unknown as Message[], 1000)).toEqual([]);
      expect(boundHistory(undefined as unknown as Message[], 1000)).toEqual([]);
    });

    it("should include messages when token limit is exactly met", () => {
      const msg: Message = { id: "1", senderId: "s", timestamp: 1, what: "1234", where: "1234", how: "1234", reasoning: "1234" }; // length 19 (incl spaces) -> 5 tokens
      const msg2: Message = { id: "2", senderId: "s", timestamp: 2, what: "123", where: "1", how: "1", reasoning: "1" }; // length 10 (incl spaces) -> 3 tokens

      const history = [msg, msg2]; // Total tokens = 8

      // Max is exactly 8
      const bounded = boundHistory(history, 8);
      expect(bounded).toEqual([msg, msg2]);
    });
  });
});
