import { describe, it, expect } from "vitest";
import { countTokens, boundHistory } from "../../logic/ACE";
import { Message } from "../../logic/Types";

describe("ACE Module", () => {
  describe("countTokens", () => {
    it("should correctly count tokens (approximate string length / 4)", () => {
      expect(countTokens("")).toBe(0);
      expect(countTokens("1234")).toBe(1);
      expect(countTokens("12345678")).toBe(2);
      expect(countTokens("123456789")).toBe(3);
    });

    it("should handle extremely large string inputs", () => {
      const largeString = "a".repeat(10000);
      expect(countTokens(largeString)).toBe(2500);
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

    it("should drop a single message from history if that individual message's token count strictly exceeds maxTokens", () => {
      const oversizedMsg: Message = { id: "1", senderId: "s", timestamp: 1, what: "12345678", where: "", how: "", reasoning: "" };
      // "12345678   " -> length 11 -> ceil(11/4) = 3 tokens
      const history = [oversizedMsg];
      const bounded = boundHistory(history, 2);
      expect(bounded).toEqual([]);
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

    it("should handle boundary values for maxTokens exactly 1 in boundHistory", () => {
      const msg1: Message = { id: "1", senderId: "s", timestamp: 1, what: "1", where: "2", how: "3", reasoning: "" };
      const history = [msg1];
      const bounded = boundHistory(history, 1);
      // "1 2 3 " -> length 6 -> 2 tokens
      // Limit is 1, so it should not include any message
      expect(bounded).toEqual([]);
    });

    it("should handle token limit being hit exactly by the first checked message", () => {
      const msg: Message = { id: "1", senderId: "s", timestamp: 1, what: "123", where: "", how: "", reasoning: "" }; // "123   " -> 6 -> 2
      const history = [msg];
      const bounded = boundHistory(history, 2);
      expect(bounded).toEqual([msg]);
    });

    it("should handle massive history arrays efficiently", () => {
      const history: Message[] = Array.from({ length: 10000 }).map((_, i) => ({
        id: `msg-${i}`,
        senderId: "s",
        timestamp: i,
        what: "short",
        where: "text",
        how: "msg",
        reasoning: "r"
      }));

      // Each msg is "short text msg r" -> 16 chars -> 4 tokens
      // Total tokens = 40000. Let's limit to 400 tokens (last 100 messages)
      const bounded = boundHistory(history, 400);
      expect(bounded.length).toBe(100);
      expect(bounded[99].id).toBe("msg-9999");
      expect(bounded[0].id).toBe("msg-9900");
    });
  });

  describe("Edge cases for token counting", () => {
    it("should handle strings with non-ASCII characters", () => {
      expect(countTokens("🌟")).toBe(1); // Length is 2, 2/4 = 0.5 -> ceil(0.5) = 1
      expect(countTokens("こんにちは")).toBe(2); // Length 5, 5/4 = 1.25 -> ceil(1.25) = 2
    });
  });
});
