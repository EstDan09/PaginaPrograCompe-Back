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

async function getRandomUnsolvedFilteredProblem(cf_handle, min_rating, max_rating, tags) {
  if (IS_TEST_MODE) {
    return {
      cf_code: "4A",
      name: "Watermelon",
      rating: min_rating,
      contestId: 4,
      tags: tags
    };
  }

  try {
    const {status, result: problems} = await CodeforcesAPI.call("problemset.problems", {});
    if (status !== "OK") {
      throw new Error("Failed to fetch problems from Codeforces");
    }
    const problemsList = (problems.problems || [])
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    if (problemsList.length === 0) {
      throw new Error("No problems available from Codeforces API");
    }

    for (const problem of problemsList) {
      if (!problem.rating) continue;
      if (problem.rating < min_rating || problem.rating > max_rating) continue;

      if (!problem.tags) continue;
      const problemTags = problem.tags;
      if (!tags.every(tag => problemTags.includes(tag))) continue;

      const cf_code = `${problem.contestId}${problem.index}`;
      const {solved} = await verifyProblemSolved(cf_handle, cf_code);
      if (!solved) {
        return {
            cf_code: `${problem.contestId}${problem.index}`,
            name: problem.name,
            rating: problem.rating,
            contestId: problem.contestId,
            tags: problem.tags
          };
      }
    }

    throw new Error("No problems matching the filter criteria");

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
      handle: cfHandle
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

async function getStudentKPIs(cfHandle) {
  if (IS_TEST_MODE) {
    return {
      rating: 1243,
      solvedTotal: 1243,
      streakDays: 6
    };
  }

  try {
    const userInfo = await getUserInfo(cfHandle);
    if (!userInfo) {
      throw new Error(`User ${cfHandle} not found`);
    }

    const submissions = await getUserSubmissions(cfHandle, 1, 10000);
    const solvedProblems = new Set();

    let longest_streak = 0;
    const day = 24*3600;
    let last_day = -1;
    let current_streak = 0;
    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        solvedProblems.add(`${sub.problem.contestId}${sub.problem.index}`);
        const cur_day = Math.floor(sub.creationTimeSeconds/day);
        if (Math.abs(last_day - cur_day) > 1) current_streak = 0;
        if (last_day !== cur_day) current_streak += 1;
        last_day = cur_day;
        longest_streak = Math.max(current_streak, longest_streak);
      }
    });

    const streakDays = longest_streak;

    return {
      rating: userInfo.rating || 0,
      solvedTotal: solvedProblems.size,
      streakDays: streakDays
    };
  } catch (error) {
    throw new Error(`Failed to get student KPIs: ${error.message}`);
  }
}

async function getStudentRatingGraph(cfHandle) {
  if (IS_TEST_MODE) {
    return {
      min: 820,
      max: 1243,
      series: [
        { t: "2025-08-01", rating: 820 },
        { t: "2025-12-20", rating: 930 },
        { t: "2026-01-20", rating: 1100 }
      ]
    };
  }

  try {
    const {status, result: changes} = await CodeforcesAPI.call("user.rating", {
      handle: cfHandle
    });
    if (status !== "OK") {
      throw new Error("Failed to fetch rating changes");
    }

    const ratingChanges = changes.map(rc => ({
      t: (new Date(rc.ratingUpdateTimeSeconds*1000)).toISOString().split('T')[0],
      rating: rc.newRating
    }));

    const ratings = ratingChanges.map(rc => rc.rating);
    const min = ratings.length > 0 ? Math.min(...ratings) : 0;
    const max = ratings.length > 0 ? Math.max(...ratings) : 0;

    return {
      min: min,
      max: max,
      series: ratingChanges
    };
  } catch (error) {
    throw new Error(`Failed to get student rating graph: ${error.message}`);
  }
}

async function getStudentSolvesByRating(cfHandle) {
  if (IS_TEST_MODE) {
    return {
      binSize: 100,
      bins: [
        { from: 800, to: 899, label: "800", solved: 300 },
        { from: 900, to: 999, label: "900", solved: 130 },
        { from: 1000, to: 1099, label: "1000", solved: 160 },
        { from: 1100, to: 1199, label: "1100", solved: 60 },
        { from: 1200, to: 1299, label: "1200", solved: 100 }
      ]
    };
  }

  try {
    const { status, result: problems } = await CodeforcesAPI.call("problemset.problems", {});
    if (status !== "OK") {
      throw new Error("Failed to fetch problems");
    }

    const submissions = await getUserSubmissions(cfHandle, 1, 10000);
    const solvedProblems = new Set();

    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        solvedProblems.add(`${sub.problem.contestId}${sub.problem.index}`);
      }
    });

    const bins = {};
    const binSize = 100;

    for (let rating = 800; rating <= 3500; rating += binSize) {
      bins[rating] = 0;
    }

    problems.problems.forEach(prob => {
      if (prob.rating && solvedProblems.has(`${prob.contestId}${prob.index}`)) {
        const binKey = Math.floor(prob.rating / binSize) * binSize;
        if (bins[binKey] !== undefined) {
          bins[binKey]++;
        }
      }
    });

    const binsArray = Object.entries(bins)
      .filter(([key, value]) => value > 0)
      .map(([from, solved]) => ({
        from: parseInt(from),
        to: parseInt(from) + binSize - 1,
        label: from,
        solved: solved
      }));

    return {
      binSize: binSize,
      bins: binsArray
    };
  } catch (error) {
    throw new Error(`Failed to get student solves by rating: ${error.message}`);
  }
}

async function getStudentSolvedTags(cfHandle) {
  if (IS_TEST_MODE) {
    return [
      { tag: "implementation", solved: 453 },
      { tag: "binary search", solved: 420 },
      { tag: "greedy", solved: 524 },
      { tag: "math", solved: 32 },
      { tag: "graphs", solved: 532 }
    ];
  }

  try {
    const { status, result: problems } = await CodeforcesAPI.call("problemset.problems", {});
    if (status !== "OK") {
      throw new Error("Failed to fetch problems");
    }

    const submissions = await getUserSubmissions(cfHandle, 1, 10000);
    const solvedProblems = new Set();

    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        solvedProblems.add(`${sub.problem.contestId}${sub.problem.index}`);
      }
    });

    const tagCount = {};

    problems.problems.forEach(prob => {
      if (solvedProblems.has(`${prob.contestId}${prob.index}`)) {
        prob.tags?.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    const tagsArray = Object.entries(tagCount)
      .map(([tag, solved]) => ({
        tag: tag,
        solved: solved
      }))
      .sort((a, b) => b.solved - a.solved);

    return tagsArray;
  } catch (error) {
    throw new Error(`Failed to get student solved tags: ${error.message}`);
  }
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
  verifyProblemTimelimitSeconds,
  getStudentKPIs,
  getStudentRatingGraph,
  getStudentSolvesByRating,
  getStudentSolvedTags,
  getRandomUnsolvedFilteredProblem,
  IS_TEST_MODE
};
