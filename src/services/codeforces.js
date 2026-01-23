const { CodeforcesAPI } = require("codeforces-api-ts");

const IS_TEST_MODE = process.env.NODE_ENV === "test";

async function verifyProblemSolved(cfHandle, cfCode) {
  if (IS_TEST_MODE) {
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

    const {status: contestStatus, result: contestStandings} = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });

    if (contestStatus !== "OK") {
      throw new Error("Failed to fetch contest standings");
    }

    const contest = contestStandings.contest;

    const {status, result: submissions} = await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: 1,
      count: 1000
    });

    if (status !== "OK") {
      throw new Error("Failed to fetch user submissions");
    }

    const successfulSubmission = submissions.find(sub =>
      sub.contestId === contestId &&
      sub.problem.index === problemIndex &&
      sub.verdict === "OK"
    );

    if (!successfulSubmission) {
      return { solved: false, completionType: null };
    }

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

async function verifyProblemCompilationErrorRecent(cfHandle, cfCode) {
  if (IS_TEST_MODE) {
    return cfCode !== "888Z";
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    const {status, result: submissions} = await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: 1,
      count: 10
    });
    if (status !== "OK") {
      throw new Error("Failed to fetch user submissions");
    }

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



async function validateCfCode(cfCode) {
  if (IS_TEST_MODE) {
    try {
      extractContestAndProblem(cfCode);
      return cfCode !== "999Z";
    } catch {
      return false;
    }
  }

  try {
    const { contestId, problemIndex } = extractContestAndProblem(cfCode);

    const {status, result: standings} = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });
    if (status !== "OK") throw new Error("Failed to fetch contest standings");

    const problems = standings.problems || [];
    const problemExists = problems.some(p => p.index === problemIndex);

    return problemExists;
  } catch (error) {
    return false;
  }
}

async function getProblemInfo(cfCode) {
  if (IS_TEST_MODE) {
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

    const {status, result: standings} = await CodeforcesAPI.call("contest.standings", {
      contestId: contestId
    });
    if (status !== "OK") throw new Error("Failed to fetch contest standings");

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

async function getUserInfo(cfHandle) {
  if (IS_TEST_MODE) {
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
    const {status, result: users} = await CodeforcesAPI.call("user.info", {
      handles: cfHandle
    });
    if (status !== "OK") {
      throw new Error("Failed to fetch user info");
    }

    return users[0] || null;
  } catch (error) {
    throw new Error(`Failed to get user info: ${error.message}`);
  }
}

async function verifyExistingCodeforcesAccount(cfHandle) {
  if (IS_TEST_MODE) {
    return cfHandle !== "nonexistent";
  }

  try {
    const {status, result: users} = await CodeforcesAPI.call("user.info", {
      handles: cfHandle
    });
    if (status !== "OK") {
      throw new Error("Failed to fetch user info");
    }

    return users.length > 0;
  } catch (error) {
    return false;
  }
}

async function getRandomValidProblem() {
  if (IS_TEST_MODE) {
    return {
      cf_code: "4A",
      name: "Watermelon",
      rating: 800,
      contestId: 4
    };
  }

  try {
    const {status, result: problems} = await CodeforcesAPI.call("problemset.problems", {});
    if (status !== "OK") {
      throw new Error("Failed to fetch problems from Codeforces");
    }
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

async function getUserSubmissions(cfHandle, from = 1, count = 50) {
  if (IS_TEST_MODE) {
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
    const {status, result: submissions} = await CodeforcesAPI.call("user.status", {
      handle: cfHandle,
      from: from,
      count: count
    });
    if (status !== "OK") {
      throw new Error("Failed to fetch user submissions");
    }
    return submissions;
  } catch (error) {
    throw new Error(`Failed to get user submissions: ${error.message}`);
  }
}

function extractContestAndProblem(cfCode) {
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
