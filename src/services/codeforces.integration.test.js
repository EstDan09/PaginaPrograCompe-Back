const codeforces = require("../services/codeforces");

const shouldRunIntegration = process.env.NODE_ENV !== "test";

describe("Codeforces Service - Integration Tests (Real API)", () => {
  const describeIntegration = shouldRunIntegration ? describe : describe.skip;

  const REAL_HANDLE = "fisher199";
  const SOLVED_PROBLEM = "1720D1";
  const UNSOLVED_PROBLEM = "1A";

  describeIntegration("verifyProblemSolved - Real API", () => {
    it("should confirm that fisher199 has solved 1720D1", async () => {
      const result = await codeforces.verifyProblemSolved(REAL_HANDLE, SOLVED_PROBLEM);
      expect(result.solved).toBe(true);
      expect(["contest", "normal"]).toContain(result.completionType);
    }, 10000);

    it("should confirm that fisher199 has NOT solved 1A", async () => {
      const result = await codeforces.verifyProblemSolved(REAL_HANDLE, UNSOLVED_PROBLEM);
      expect(result.solved).toBe(false);
      expect(result.completionType).toBeNull();
    });

    it("should return an object with solved and completionType properties", async () => {
      const result = await codeforces.verifyProblemSolved(REAL_HANDLE, SOLVED_PROBLEM);
      expect(result).toHaveProperty("solved");
      expect(result).toHaveProperty("completionType");
      expect(typeof result.solved).toBe("boolean");
    });

    it("should properly distinguish between contest and normal submissions", async () => {
      const result = await codeforces.verifyProblemSolved(REAL_HANDLE, SOLVED_PROBLEM);
      if (result.solved) {
        expect(["contest", "normal"]).toContain(result.completionType);
      }
    });
  });

  describeIntegration("validateCfCode - Real API", () => {
    it("should validate that 1720D1 is a real problem", async () => {
      const result = await codeforces.validateCfCode(SOLVED_PROBLEM);
      expect(result).toBe(true);
    });

    it("should validate that 1A is a real problem", async () => {
      const result = await codeforces.validateCfCode(UNSOLVED_PROBLEM);
      expect(result).toBe(true);
    });

    it("should return false for non-existent problem code", async () => {
      const result = await codeforces.validateCfCode("99999Z");
      expect(result).toBe(false);
    });

    it("should return false for invalid format", async () => {
      const result = await codeforces.validateCfCode("InvalidCode");
      expect(result).toBe(false);
    });
  });

  describeIntegration("getProblemInfo - Real API", () => {
    it("should retrieve info for problem 1720D1", async () => {
      const result = await codeforces.getProblemInfo(SOLVED_PROBLEM);
      expect(result.exists).toBe(true);
      expect(result.contestId).toBe(1720);
      expect(result.problemIndex).toBe("D1");
      expect(result.problem).toBeDefined();
      expect(result.problem.name).toBeDefined();
    });

    it("should retrieve info for problem 1A", async () => {
      const result = await codeforces.getProblemInfo(UNSOLVED_PROBLEM);
      expect(result.exists).toBe(true);
      expect(result.contestId).toBe(1);
      expect(result.problemIndex).toBe("A");
      expect(result.problem).toBeDefined();
    });

    it("should return exists=false for non-existent problem", async () => {
      try {
        const result = await codeforces.getProblemInfo("99999Z");
        expect(result.exists).toBe(false);
      } catch (error) {
        expect(error.message).toContain("Failed to get problem info");
      }
    });

    it("should return proper structure with contestId and problemIndex", async () => {
      const result = await codeforces.getProblemInfo(SOLVED_PROBLEM);
      expect(result).toHaveProperty("exists");
      expect(result).toHaveProperty("contestId");
      expect(result).toHaveProperty("problemIndex");
    });
  });

  describeIntegration("verifyExistingCodeforcesAccount - Real API", () => {
    it("should confirm that fisher199 exists on Codeforces", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount(REAL_HANDLE);
      expect(result).toBe(true);
    });

    it("should handle non-existent users gracefully", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount("ThisHandleDefinitelyDoesNotExist123456");
      expect(typeof result).toBe("boolean");
    });

    it("should be case-sensitive for handles", async () => {
      const result = await codeforces.verifyExistingCodeforcesAccount("FISHER199");
      expect(typeof result).toBe("boolean");
    });
  });

  describeIntegration("getUserInfo - Real API", () => {
    it("should retrieve information about fisher199", async () => {
      const result = await codeforces.getUserInfo(REAL_HANDLE);
      expect(result).not.toBeNull();
      expect(result.handle).toBe(REAL_HANDLE);
      expect(result).toHaveProperty("rating");
      expect(result).toHaveProperty("rank");
      expect(result).toHaveProperty("maxRating");
      expect(result).toHaveProperty("maxRank");
    });

    it("should return valid user data structure", async () => {
      const result = await codeforces.getUserInfo(REAL_HANDLE);
      expect(typeof result.handle).toBe("string");
      expect(typeof result.rating).toBe("number");
      expect(typeof result.rank).toBe("string");
    });

    it("should return null for non-existent user", async () => {
      try {
        const result = await codeforces.getUserInfo("ThisHandleDefinitelyDoesNotExist123456");
        expect(result).toBeNull();
      } catch (error) {
        expect(error.message).toContain("Failed to get user info");
      }
    });
  });

  describeIntegration("getUserSubmissions - Real API", () => {
    it("should retrieve submissions for fisher199", async () => {
      const result = await codeforces.getUserSubmissions(REAL_HANDLE, 1, 10);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return submission objects with proper structure", async () => {
      const result = await codeforces.getUserSubmissions(REAL_HANDLE, 1, 10);
      if (result.length > 0) {
        const submission = result[0];
        expect(submission).toHaveProperty("id");
        expect(submission).toHaveProperty("contestId");
        expect(submission).toHaveProperty("problem");
        expect(submission).toHaveProperty("verdict");
        expect(submission.problem).toHaveProperty("index");
      }
    });

    it("should support pagination", async () => {
      const resultPage1 = await codeforces.getUserSubmissions(REAL_HANDLE, 1, 5);
      const resultPage2 = await codeforces.getUserSubmissions(REAL_HANDLE, 6, 5);
      
      expect(Array.isArray(resultPage1)).toBe(true);
      expect(Array.isArray(resultPage2)).toBe(true);
      
      if (resultPage1.length > 0 && resultPage2.length > 0) {
        expect(resultPage1[0].id).not.toEqual(resultPage2[0].id);
      }
    });

    it("should respect the count parameter", async () => {
      const result = await codeforces.getUserSubmissions(REAL_HANDLE, 1, 20);
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  describeIntegration("getRandomValidProblem - Real API", () => {
    it("should return a valid random problem", async () => {
      const result = await codeforces.getRandomValidProblem();
      expect(result).toHaveProperty("cf_code");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("contestId");
    });

    it("should return a properly formatted cf_code", async () => {
      const result = await codeforces.getRandomValidProblem();
      expect(typeof result.cf_code).toBe("string");
      expect(result.cf_code).toMatch(/^\d+[A-Z]\d*$/);
    });

    it("should return different problems on multiple calls", async () => {
      const result1 = await codeforces.getRandomValidProblem();
      const result2 = await codeforces.getRandomValidProblem();
      const result3 = await codeforces.getRandomValidProblem();
      
      const allSame = result1.cf_code === result2.cf_code && result2.cf_code === result3.cf_code;
      expect(allSame).toBe(false);
    }, 30000);

    it("should return problem with valid metadata", async () => {
      const result = await codeforces.getRandomValidProblem();
      expect(typeof result.name).toBe("string");
      expect(result.name.length).toBeGreaterThan(0);
      expect(typeof result.contestId).toBe("number");
      expect(result.contestId).toBeGreaterThan(0);
    });
  });

  describeIntegration("API Consistency Tests", () => {
    it("verifyProblemSolved and validateCfCode should be consistent for solved problem", async () => {
      const isValid = await codeforces.validateCfCode(SOLVED_PROBLEM);
      const isSolved = await codeforces.verifyProblemSolved(REAL_HANDLE, SOLVED_PROBLEM);
      
      expect(isValid).toBe(true);
      expect(isSolved.solved).toBe(true);
    });

    it("should find solved problem in user submissions", async () => {
      const submissions = await codeforces.getUserSubmissions(REAL_HANDLE, 1, 1000);
      const { contestId, problemIndex } = extractContestAndProblem(SOLVED_PROBLEM);
      
      const foundProblem = submissions.find(sub => 
        sub.contestId === contestId && 
        sub.problem.index === problemIndex &&
        sub.verdict === "OK"
      );
      
      expect(foundProblem).toBeDefined();
    });

    it("userInfo should confirm fisher199 is a real account", async () => {
      const userInfo = await codeforces.getUserInfo(REAL_HANDLE);
      const accountExists = await codeforces.verifyExistingCodeforcesAccount(REAL_HANDLE);
      
      expect(accountExists).toBe(true);
      expect(userInfo).not.toBeNull();
    });
  });

  describeIntegration("Error Handling - Real API", () => {
    it("should throw error for invalid cf_code format in verifyProblemSolved", async () => {
      try {
        await codeforces.verifyProblemSolved(REAL_HANDLE, "InvalidFormat");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Invalid cf_code format");
      }
    });

    it("should throw error for invalid cf_code format in getProblemInfo", async () => {
      try {
        await codeforces.getProblemInfo("InvalidFormat");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Invalid cf_code format");
      }
    });
  });

  describeIntegration("getStudentKPIs - Real API", () => {
    it("should retrieve KPIs for fisher199", async () => {
      const result = await codeforces.getStudentKPIs(REAL_HANDLE);
      expect(result).toHaveProperty("rating");
      expect(result).toHaveProperty("solvedTotal");
      expect(result).toHaveProperty("streakDays");
    });

    it("should return correct structure with number types", async () => {
      const result = await codeforces.getStudentKPIs(REAL_HANDLE);
      expect(typeof result.rating).toBe("number");
      expect(typeof result.solvedTotal).toBe("number");
      expect(typeof result.streakDays).toBe("number");
      expect(result.solvedTotal).toBeGreaterThan(0);
    });

    it("should return non-negative values", async () => {
      const result = await codeforces.getStudentKPIs(REAL_HANDLE);
      expect(result.rating).toBeGreaterThanOrEqual(0);
      expect(result.solvedTotal).toBeGreaterThanOrEqual(0);
      expect(result.streakDays).toBeGreaterThanOrEqual(0);
    });
  });

  describeIntegration("getStudentRatingGraph - Real API", () => {
    it("should retrieve rating graph for fisher199", async () => {
      const result = await codeforces.getStudentRatingGraph(REAL_HANDLE);
      expect(result).toHaveProperty("min");
      expect(result).toHaveProperty("max");
      expect(result).toHaveProperty("series");
    });

    it("should return properly structured series", async () => {
      const result = await codeforces.getStudentRatingGraph(REAL_HANDLE);
      expect(Array.isArray(result.series)).toBe(true);
      if (result.series.length > 0) {
        const point = result.series[0];
        expect(point).toHaveProperty("t");
        expect(point).toHaveProperty("rating");
        expect(typeof point.rating).toBe("number");
      }
    });

    it("should have consistent min/max values", async () => {
      const result = await codeforces.getStudentRatingGraph(REAL_HANDLE);
      expect(result.min).toBeLessThanOrEqual(result.max);
      expect(typeof result.min).toBe("number");
      expect(typeof result.max).toBe("number");
    });

    it("should return limited series (max 20 points)", async () => {
      const result = await codeforces.getStudentRatingGraph(REAL_HANDLE);
      expect(result.series.length).toBeLessThanOrEqual(20);
    });
  });

  describeIntegration("getStudentSolvesByRating - Real API", () => {
    it("should retrieve solves by rating for fisher199", async () => {
      const result = await codeforces.getStudentSolvesByRating(REAL_HANDLE);
      expect(result).toHaveProperty("binSize");
      expect(result).toHaveProperty("bins");
      expect(typeof result.binSize).toBe("number");
    });

    it("should return properly structured bins", async () => {
      const result = await codeforces.getStudentSolvesByRating(REAL_HANDLE);
      expect(Array.isArray(result.bins)).toBe(true);
      if (result.bins.length > 0) {
        const bin = result.bins[0];
        expect(bin).toHaveProperty("from");
        expect(bin).toHaveProperty("to");
        expect(bin).toHaveProperty("label");
        expect(bin).toHaveProperty("solved");
        expect(typeof bin.solved).toBe("number");
        expect(bin.solved).toBeGreaterThan(0);
      }
    });

    it("should have correct bin ranges", async () => {
      const result = await codeforces.getStudentSolvesByRating(REAL_HANDLE);
      result.bins.forEach(bin => {
        expect(bin.to).toBe(bin.from + result.binSize - 1);
        expect(bin.from).toBeLessThanOrEqual(bin.to);
      });
    });

    it("should only include bins with solved > 0", async () => {
      const result = await codeforces.getStudentSolvesByRating(REAL_HANDLE);
      result.bins.forEach(bin => {
        expect(bin.solved).toBeGreaterThan(0);
      });
    });
  });

  describeIntegration("getStudentSolvedTags - Real API", () => {
    it("should retrieve solved tags for fisher199", async () => {
      const result = await codeforces.getStudentSolvedTags(REAL_HANDLE);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);

    it("should return properly structured tag objects", async () => {
      const result = await codeforces.getStudentSolvedTags(REAL_HANDLE);
      if (result.length > 0) {
        const tag = result[0];
        expect(tag).toHaveProperty("tag");
        expect(tag).toHaveProperty("solved");
        expect(typeof tag.tag).toBe("string");
        expect(typeof tag.solved).toBe("number");
        expect(tag.solved).toBeGreaterThan(0);
      }
    });

    it("should return tags sorted by solved count in descending order", async () => {
      const result = await codeforces.getStudentSolvedTags(REAL_HANDLE);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].solved).toBeGreaterThanOrEqual(result[i + 1].solved);
      }
    });

    it("should not have duplicate tags", async () => {
      const result = await codeforces.getStudentSolvedTags(REAL_HANDLE);
      const tagNames = result.map(t => t.tag);
      const uniqueTags = new Set(tagNames);
      expect(uniqueTags.size).toBe(tagNames.length);
    });
  });
});

function extractContestAndProblem(cfCode) {
  const match = cfCode.match(/^(\d+)([A-Z][0-9]*)$/);
  if (!match) {
    throw new Error(`Invalid cf_code format: "${cfCode}"`);
  }
  return {
    contestId: parseInt(match[1], 10),
    problemIndex: match[2]
  };
}
