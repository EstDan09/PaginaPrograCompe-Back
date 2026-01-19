/**
 * Codeforces API Service
 *
 * This service provides functions to interact with the Codeforces API for:
 * - Verifying if a user has solved a problem
 * - Checking if a user has submitted to a problem
 * - Determining if a problem was solved during a contest or in practice
 * - Retrieving user information and statistics
 *
 * Problem Code Format (cf_code):
 * Format: contestId + problemIndex (e.g., "123A", "1234B2", "4A")
 * - contestId: numerical ID of the contest (required)
 * - problemIndex: letter + optional iteration number (e.g., "A", "B2", "C1")
 * - Pattern: /^(\d+)([A-Z][0-9]*)$/
 *
 * Test Mode:
 * When NODE_ENV=test, all functions return mock data instead of calling the API.
 * This allows route tests to run without external API dependencies.
 */

const { CodeforcesAPI } = require("codeforces-api-ts");

// In test mode, don't make actual API calls
const IS_TEST_MODE = process.env.NODE_ENV === "test";

/**
 * Verify if a user has solved a specific problem and determine completion type
 * @param {string} cfHandle - Codeforces user handle
 * @param {string} cfCode - Problem code (e.g., "123A", "1234B2")
 * @returns {Promise<{solved: boolean, completionType: "contest"|"normal"|null}>}
 *         - solved: true if problem has verdict "OK", false otherwise
 *         - completionType: "contest" if solved during contest, "normal" if solved after, null if not solved
 */
async function verifyProblemSolved(cfHandle, cfCode) {
  if (IS_TEST_MODE) {
    // Mock: return consistent pattern for testing
    if (cfCode === "999Z") {
      return { solved: false, completionType: null };
    }
    return {
      solved: true,
      completionType: "normal"
    };
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    // Get contest details first to know duration
    const contestStandings = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });

    const contest = contestStandings.contest;

    // Get last 1000 submissions for performance
    const submissions = await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: 1,
      count: 1000
    });

    // Find first successful submission for this problem
    const successfulSubmission = submissions.find(sub =>
      sub.contestId === contestId &&
      sub.problem.index === problemIndex &&
      sub.verdict === "OK"
    );

    if (!successfulSubmission) {
      return { solved: false, completionType: null };
    }

    // Determine if submitted during or after contest
    const isContestSubmission =
      successfulSubmission.relativeTimeSeconds >= 0 &&
      successfulSubmission.relativeTimeSeconds <= contest.durationSeconds;

    return {
      solved: true,
      completionType: isContestSubmission ? "contest" : "normal"
    };
  } catch (error) {
    throw new Error(`Failed to verify problem solved: ${error.message}`);
  }
}

const verifyProblemTimelimitSeconds = 300; // 5 minutes

/**
 * Verify if a user has recently submitted to a specific problem with a compilation error
 * Scans only the last 1000 submissions for performance
 * @param {string} cfHandle - Codeforces user handle
 * @param {string} cfCode - Problem code (e.g., "123A", "1234B2")
 * @returns {Promise<boolean>} - True if any recent compilation error exists, false otherwise
 */
async function verifyProblemCompilationErrorRecent(cfHandle, cfCode) {
  if (IS_TEST_MODE) {
    // Mock: return consistent pattern for testing
    return cfCode !== "888Z"; // All problems have compilation errors except 888Z
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    // Get last 1000 submissions for performance
    const submissions = await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: 1,
      count: 10
    });

    const compilationErrorSubmission = submissions.find(sub =>
      sub.contestId === contestId &&
      sub.problem.index === problemIndex &&
      sub.verdict === "COMPILATION_ERROR" && 
        (Date.now() / 1000 - sub.creationTimeSeconds) <= verifyProblemTimelimitSeconds
    );

    return !!compilationErrorSubmission;
  } catch (error) {
    throw new Error(`Failed to verify problem compilation error: ${error.message}`);
  }
}



/**
 * Validate if a cf_code is valid on Codeforces
 * @param {string} cfCode - Problem code (e.g., "123A", "1234B2")
 * @returns {Promise<boolean>} - True if problem exists on Codeforces, false otherwise
 */
async function validateCfCode(cfCode) {
  if (IS_TEST_MODE) {
    // Mock: validate format and return true for all except 999Z
    try {
      extractContestAndProblem(cfCode);
      return cfCode !== "999Z";
    } catch {
      return false;
    }
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    const standings = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });

    const problems = standings.problems || [];
    const problemExists = problems.some(p => p.index === problemIndex);

    return problemExists;
  } catch (error) {
    return false; // Return false for any error (invalid format, API error, etc.)
  }
}

/**
 * Get information about a problem code
 * @param {string} cfCode - Problem code (e.g., "123A", "1234B2")
 * @returns {Promise<{exists: boolean, problem?: object, contestId?: number, problemIndex?: string}>}
 */
async function getProblemInfo(cfCode) {
  if (IS_TEST_MODE) {
    // Mock: return problem info for known test codes
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);
    return {
      exists: cfCode !== "999Z",
      problem: {
        contestId,
        index: problemIndex,
        name: `Problem ${problemIndex}`,
        type: "PROGRAMMING",
        tags: ["test"]
      },
      contestId,
      problemIndex
    };
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    const standings = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });

    const problems = standings.problems || [];

    const problem = problems.find(p => p.index === problemIndex);

    if (!problem) {
      return {
        exists: false,
        contestId,
        problemIndex
      };
    }

    return {
      exists: true,
      problem,
      contestId,
      problemIndex
    };
  } catch (error) {
    throw new Error(`Failed to get problem info: ${error.message}`);
  }
}

/**
 * Get user information and statistics
 * @param {string} cfHandle - Codeforces user handle
 * @returns {Promise<object|null>} - User info or null if not found
 */
async function getUserInfo(cfHandle) {
  if (IS_TEST_MODE) {
    // Mock: return consistent user data for testing
    return {
      handle: cfHandle,
      rating: 1500,
      rank: "specialist",
      maxRating: 1800,
      maxRank: "expert",
      lastOnlineTimeSeconds: Math.floor(Date.now() / 1000),
      registrationTimeSeconds: Math.floor(Date.now() / 1000) - 86400 * 365
    };
  }

  try {
    const users = await CodeforcesAPI.call("user.info", {
      handles: cfHandle
    });

    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user info: ${error.message}`);
  }
}

/**
 * Verify if a Codeforces account exists
 * @param {string} cfHandle - Codeforces user handle
 * @returns {Promise<boolean>} - True if account exists, false otherwise
 */
async function verifyExistingCodeforcesAccount(cfHandle) {
  if (IS_TEST_MODE) {
    // Mock: return true for all handles except "nonexistent"
    return cfHandle !== "nonexistent";
  }

  try {
    const users = await CodeforcesAPI.call("user.info", {
      handles: cfHandle
    });

    return users.length > 0;
  } catch (error) {
    return false; // Return false for any error (invalid handle, API error, etc.)
  }
}

/**
 * Get a random valid Codeforces problem for verification
 * @returns {Promise<{cf_code: string, name: string, rating?: number, contestId?: number}>}
 */
async function getRandomValidProblem() {
  if (IS_TEST_MODE) {
    // Mock: return a fixed problem for testing
    return {
      cf_code: "4A",
      name: "Watermelon",
      rating: 800,
      contestId: 4
    };
  }

  try {
    const problems = await CodeforcesAPI.call("problemset.problems", {});
    const problemsList = problems.problems || [];

    if (problemsList.length === 0) {
      throw new Error("No problems available from Codeforces API");
    }

    const randomProblem =
      problemsList[Math.floor(Math.random() * problemsList.length)];

    return {
      cf_code: `${randomProblem.contestId}${randomProblem.index}`,
      name: randomProblem.name,
      rating: randomProblem.rating,
      contestId: randomProblem.contestId
    };
  } catch (error) {
    throw new Error(`Failed to get random problem: ${error.message}`);
  }
}

/**
 * Get paginated user submissions
 * @param {string} cfHandle - Codeforces user handle
 * @param {number} from - Starting index (1-based)
 * @param {number} count - Number of submissions to fetch
 * @returns {Promise<array>} - Array of submissions
 */
async function getUserSubmissions(cfHandle, from = 1, count = 50) {
  if (IS_TEST_MODE) {
    // Mock: return sample submissions
    return [
      {
        id: 1,
        contestId: 123,
        creationTimeSeconds: Math.floor(Date.now() / 1000),
        relativeTimeSeconds: 3600,
        problem: {
          contestId: 123,
          index: "A",
          name: "Problem A"
        },
        verdict: "OK",
        testset: "TESTS"
      }
    ];
  }

  try {
    return await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: from,
      count: count
    });
  } catch (error) {
    throw new Error(`Failed to get user submissions: ${error.message}`);
  }
}

// ============= Helper Functions =============

/**
 * Parse cf_code to extract contestId and problemIndex
 * Format: contestId + problemIndex (e.g., "123A", "1234B2")
 * @param {string} cfCode
 * @returns {{contestId: number, problemIndex: string}}
 * @throws Error if format is invalid
 */
function extractContestAndProblem(cfCode) {
  // Match pattern: digits followed by letters/digits (e.g., "123A", "1234B2", "4A1")
  const match = cfCode.match(/^(\d+)([A-Z][0-9]*)$/);

  if (!match) {
    throw new Error(
      `Invalid cf_code format: "${cfCode}". Expected format like "123A" or "1234B2"`
    );
  }

  return {
    contestId: parseInt(match[1], 10),
    problemIndex: match[2]
  };
}

// ============= Exports =============

module.exports = {
  verifyProblemSolved,
  verifyProblemCompilationErrorRecent,
  validateCfCode,
  verifyExistingCodeforcesAccount,
  getProblemInfo,
  getUserInfo,
  getRandomValidProblem,
  getUserSubmissions,
  verifyProblemTimelimitSeconds
};
