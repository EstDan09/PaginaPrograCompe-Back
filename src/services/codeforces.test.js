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

  describe("getStudentKPIs", () => {
    it("should return KPI object with rating, solvedTotal, and streakDays in test mode", async () => {
      const result = await codeforces.getStudentKPIs("testuser");
      expect(result).toHaveProperty("rating");
      expect(result).toHaveProperty("solvedTotal");
      expect(result).toHaveProperty("streakDays");
      expect(typeof result.rating).toBe("number");
      expect(typeof result.solvedTotal).toBe("number");
      expect(typeof result.streakDays).toBe("number");
    });

    it("should return specific test values in test mode", async () => {
      const result = await codeforces.getStudentKPIs("testuser");
      expect(result.rating).toBe(1243);
      expect(result.solvedTotal).toBe(1243);
      expect(result.streakDays).toBe(6);
    });
  });

  describe("getStudentRatingGraph", () => {
    it("should return rating graph with min, max, and series in test mode", async () => {
      const result = await codeforces.getStudentRatingGraph("testuser");
      expect(result).toHaveProperty("min");
      expect(result).toHaveProperty("max");
      expect(result).toHaveProperty("series");
      expect(typeof result.min).toBe("number");
      expect(typeof result.max).toBe("number");
      expect(Array.isArray(result.series)).toBe(true);
    });

    it("should return series with date and rating properties", async () => {
      const result = await codeforces.getStudentRatingGraph("testuser");
      if (result.series.length > 0) {
        const point = result.series[0];
        expect(point).toHaveProperty("t");
        expect(point).toHaveProperty("rating");
        expect(typeof point.rating).toBe("number");
      }
    });

    it("should have min <= max in test mode", async () => {
      const result = await codeforces.getStudentRatingGraph("testuser");
      expect(result.min).toBeLessThanOrEqual(result.max);
    });
  });

  describe("getStudentSolvesByRating", () => {
    it("should return solves by rating with binSize and bins in test mode", async () => {
      const result = await codeforces.getStudentSolvesByRating("testuser");
      expect(result).toHaveProperty("binSize");
      expect(result).toHaveProperty("bins");
      expect(typeof result.binSize).toBe("number");
      expect(Array.isArray(result.bins)).toBe(true);
    });

    it("should return bins with from, to, label, and solved properties", async () => {
      const result = await codeforces.getStudentSolvesByRating("testuser");
      if (result.bins.length > 0) {
        const bin = result.bins[0];
        expect(bin).toHaveProperty("from");
        expect(bin).toHaveProperty("to");
        expect(bin).toHaveProperty("label");
        expect(bin).toHaveProperty("solved");
        expect(typeof bin.solved).toBe("number");
      }
    });

    it("should have proper bin ranges (to = from + binSize - 1)", async () => {
      const result = await codeforces.getStudentSolvesByRating("testuser");
      result.bins.forEach(bin => {
        expect(bin.to).toBe(bin.from + result.binSize - 1);
      });
    });
  });

  describe("getStudentSolvedTags", () => {
    it("should return array of tag objects in test mode", async () => {
      const result = await codeforces.getStudentSolvedTags("testuser");
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        const tag = result[0];
        expect(tag).toHaveProperty("tag");
        expect(tag).toHaveProperty("solved");
        expect(typeof tag.tag).toBe("string");
        expect(typeof tag.solved).toBe("number");
      }
    });

    it("should return tags with correct structure", async () => {
      const result = await codeforces.getStudentSolvedTags("testuser");
      expect(result[0].tag).toBe("implementation");
      expect(result[0].solved).toBe(453);
      expect(result[result.length - 1].tag).toBe("graphs");
      expect(result[result.length - 1].solved).toBe(532);
    });
  });

  describe("getRandomUnsolvedFilteredProblem", () => {
    it("should return a problem with correct structure in test mode", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 1200, ["implementation", "greedy"]);
      expect(result).toHaveProperty("cf_code");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("rating");
      expect(result).toHaveProperty("contestId");
      expect(result).toHaveProperty("tags");
    });

    it("should return a problem with rating within the specified range", async () => {
      const min = 1000;
      const max = 1500;
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", min, max, ["implementation"]);
      expect(result.rating).toBe(min);
    });

    it("should return a problem with the specified tags", async () => {
      const tags = ["implementation", "greedy"];
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 1200, tags);
      expect(result.tags).toEqual(tags);
    });

    it("should handle low rating range", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 900, ["implementation"]);
      expect(result).toHaveProperty("cf_code");
      expect(result.rating).toBe(800);
    });

    it("should handle high rating range", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 2000, 2500, ["geometry"]);
      expect(result).toHaveProperty("cf_code");
      expect(result.rating).toBe(2000);
    });

    it("should return cf_code in correct format", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 1200, ["implementation"]);
      expect(result.cf_code).toMatch(/^\d+[A-Z]/);
    });

    it("should return valid contest ID", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 1200, ["implementation"]);
      expect(typeof result.contestId).toBe("number");
      expect(result.contestId).toBeGreaterThan(0);
    });

    it("should return a name for the problem", async () => {
      const result = await codeforces.getRandomUnsolvedFilteredProblem("testuser", 800, 1200, ["implementation"]);
      expect(typeof result.name).toBe("string");
      expect(result.name.length).toBeGreaterThan(0);
    });
  });
});
