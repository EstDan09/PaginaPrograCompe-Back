const codeforces = require("../services/codeforces");

describe("Codeforces Service", () => {
  describe("verifyProblemSolved", () => {
    it("should return solved=true with completionType for most problems in test mode", async () => {
      const result = await codeforces.verifyProblemSolved("testuser", "123A");
      expect(result.solved).toBe(true);
      expect(result.completionType).toBe("normal");
    });

    it("should return solved=true with completionType='normal' for non-A problems", async () => {
      const result = await codeforces.verifyProblemSolved("testuser", "123B");
      expect(result.solved).toBe(true);
      expect(result.completionType).toBe("normal");
    });

    it("should return solved=false with completionType=null for problem 999Z", async () => {
      const result = await codeforces.verifyProblemSolved("testuser", "999Z");
      expect(result.solved).toBe(false);
      expect(result.completionType).toBeNull();
    });
  });

  describe("verifyProblemCompilationErrorRecent", () => {
    it("should return true for most problems in test mode", async () => {
      const result = await codeforces.verifyProblemCompilationErrorRecent("testuser", "123A");
      expect(result).toBe(true);
    });

    it("should return false for problem 888Z in test mode", async () => {
      const result = await codeforces.verifyProblemCompilationErrorRecent("testuser", "888Z");
      expect(result).toBe(false);
    });
  });

  describe("validateCfCode", () => {
    it("should return true for valid cf_codes in test mode", async () => {
      const result = await codeforces.validateCfCode("123A");
      expect(result).toBe(true);
    });

    it("should return true for cf_codes with problem iteration", async () => {
      const result = await codeforces.validateCfCode("1234B2");
      expect(result).toBe(true);
    });

    it("should return false for invalid cf_code 999Z in test mode", async () => {
      const result = await codeforces.validateCfCode("999Z");
      expect(result).toBe(false);
    });

    it("should return false for invalid format", async () => {
      const result = await codeforces.validateCfCode("InvalidCode");
      expect(result).toBe(false);
    });

    it("should return false for code without contest ID", async () => {
      const result = await codeforces.validateCfCode("A");
      expect(result).toBe(false);
    });
  });

  describe("verifyExistingCodeforcesAccount", () => {
    it("should return true for most handles in test mode", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount("fisher199");
      expect(result).toBe(true);
    });

    it("should return true for testuser", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount("testuser");
      expect(result).toBe(true);
    });

    it("should return false for nonexistent handle in test mode", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("getProblemInfo", () => {
    it("should return problem info for valid code in test mode", async () => {
      const result = await codeforces.getProblemInfo("123A");
      expect(result.exists).toBe(true);
      expect(result.contestId).toBe(123);
      expect(result.problemIndex).toBe("A");
    });

    it("should return non-existent for 999Z in test mode", async () => {
      const result = await codeforces.getProblemInfo("999Z");
      expect(result.exists).toBe(false);
    });
  });

  describe("getUserInfo", () => {
    it("should return user info in test mode", async () => {
      const result = await codeforces.getUserInfo("testuser");
      expect(result.handle).toBe("testuser");
      expect(result.rating).toBe(1500);
      expect(result.rank).toBe("specialist");
    });
  });

  describe("getRandomValidProblem", () => {
    it("should return a problem object in test mode", async () => {
      const result = await codeforces.getRandomValidProblem();
      expect(result.cf_code).toBe("4A");
      expect(result.name).toBe("Watermelon");
      expect(result.contestId).toBe(4);
    });
  });

  describe("getUserSubmissions", () => {
    it("should return submissions array in test mode", async () => {
      const result = await codeforces.getUserSubmissions("testuser");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].verdict).toBe("OK");
    });
  });

  describe("cf_code format validation", () => {
    it("should accept valid formats like 123A, 1234B2", async () => {
      expect(() => codeforces.getProblemInfo("123A")).not.toThrow();
      expect(() => codeforces.getProblemInfo("1234B2")).not.toThrow();
      expect(() => codeforces.getProblemInfo("4A")).not.toThrow();
    });

    it("should throw error for invalid formats", async () => {
      try {
        await codeforces.getProblemInfo("InvalidCode");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Invalid cf_code format");
      }
    });

    it("should throw error for formats without contest ID", async () => {
      try {
        await codeforces.getProblemInfo("A");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Invalid cf_code format");
      }
    });
  });
});
