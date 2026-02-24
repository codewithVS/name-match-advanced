const COMMON_PREFIXES = ["mr", "mrs", "ms", "miss", "shri", "smt", "dr"];

// const COMMON_SURNAMES = [
//   "singh", "kaur", "kumar", "devi", "patel", "sharma",
//   "reddy", "yadav", "gupta", "rao", "das"
// ];

export interface MatchResult {
  inputName: string;
  givenName: string;
  percentage: number;
  remark: string;
}

export function normalizeName(name: string | undefined): string {
  if (!name) return "";


  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => !COMMON_PREFIXES.includes(word))
    .join(" ");
}

export function removeDuplicateTokens(tokens: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const token of tokens) {
    if (!seen.has(token)) {
      seen.add(token);
      result.push(token);
    }
  }

  return result;
}

export function mergeInitials(name: string): string {
  return name.replace(/\b([a-z])\.\s*([a-z])\./g, "$1$2");
}

export function tokenize(name: string): string[] {
  return name.split(" ").filter(Boolean);
}

export function expandCombinedInitials(tokens: string[]): string[] {
  let expanded: string[] = [];

  for (const token of tokens) {
    if (/^[a-z]{2,4}$/.test(token) && !/[aeiou]/.test(token)) {
      expanded.push(...token.split(""));
    } else {
      expanded.push(token);
    }
  }

  return expanded;
}

export function normalizeInitialToken(token: string): string {
  if (
    token.length >= 2 &&
    token.length <= 4 &&
    /^[a-z]+$/.test(token) &&
    !/[aeiou]/.test(token)
  ) {
    return token.split("").sort().join("");
  }
  return token;
}

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function isSwappedMatch(tokens1: string[], tokens2: string[]): boolean {
  if (tokens1.length !== tokens2.length) return false;

  const sorted1 = tokens1.map(normalizeInitialToken).sort().join(" ");
  const sorted2 = tokens2.map(normalizeInitialToken).sort().join(" ");

  return sorted1 === sorted2;
}

export function isInitialMatch(token1: string, token2: string): boolean {
  if (token1.length === 1 && token2.startsWith(token1)) return true;
  if (token2.length === 1 && token1.startsWith(token2)) return true;
  return false;
}

export function matchNames(inputName: string, givenName: string): MatchResult {
  const originalInput = inputName;
  const originalGiven = givenName;

if (
  !inputName ||
  !givenName ||
  inputName.trim() === "" ||
  givenName.trim() === ""
) {
  return {
    inputName: originalInput || "",
    givenName: originalGiven || "",
    percentage: 0,
    remark: "Low Match",
  };
}

  inputName = mergeInitials(normalizeName(inputName));
  givenName = mergeInitials(normalizeName(givenName));

  let inputTokens = removeDuplicateTokens(tokenize(inputName));
  let givenTokens = removeDuplicateTokens(tokenize(givenName));

  inputName = inputTokens.join(" ");
  givenName = givenTokens.join(" ");

  const inputNoSpace = inputName.replace(/\s+/g, "");
  const givenNoSpace = givenName.replace(/\s+/g, "");

  if (inputName === givenName) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 100,
      remark: "Exact Match",
    };
  }

  if (
    (givenTokens.length === 1 && givenTokens[0].length === 1) ||
    (inputTokens.length === 1 && inputTokens[0].length === 1)
  ) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 40,
      remark: "Low Match",
    };
  }

  if (
    inputTokens.length === givenTokens.length &&
    inputTokens.slice().sort().join(" ") ===
      givenTokens.slice().sort().join(" ")
  ) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 99,
      remark: "High Similarity",
    };
  }

  if (inputNoSpace === givenNoSpace) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 96,
      remark: "High Similarity",
    };
  }

  const mergeDistance = levenshtein(inputNoSpace, givenNoSpace);
  const mergeSimilarity =
    1 - mergeDistance / Math.max(inputNoSpace.length, givenNoSpace.length);

  if (mergeSimilarity >= 0.92) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: Math.min(99, Math.round(mergeSimilarity * 100)),
      remark: "High Similarity",
    };
  }

if (
  (inputTokens.length === 2 && givenTokens.length === 1) ||
  (givenTokens.length === 2 && inputTokens.length === 1)
) {
  const longer = inputTokens.length === 2 ? inputTokens : givenTokens;
  const shorter = inputTokens.length === 1 ? inputTokens : givenTokens;

  if (longer.includes(shorter[0])) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 85,
      remark: "High Similarity",
    };
  }
}

  let exactMatches: string[] = [];

  for (const g of givenTokens) {
    for (const i of inputTokens) {
      if (i === g) exactMatches.push(g);
    }
  }

  if (exactMatches.length === 1 && inputTokens.length >= 2) {
    const matchedToken = exactMatches[0];

    const isFirstMatch =
      inputTokens[0] === matchedToken ||
      givenTokens[0] === matchedToken;

    const isLastMatch =
      inputTokens[inputTokens.length - 1] === matchedToken ||
      givenTokens[givenTokens.length - 1] === matchedToken;

    let initialCount = 0;
    let fullWordSupport = 0;

    for (const g of givenTokens.slice(1)) {
      for (const i of inputTokens.slice(1)) {
        if (g.length === 1 && i.startsWith(g)) initialCount++;
        if (g.length > 1 && i === g) fullWordSupport++;
      }
    }

    if (isFirstMatch && !isLastMatch) {
      if (fullWordSupport >= 2) {
        return {
          inputName: originalInput,
          givenName: originalGiven,
          percentage: 92,
          remark: "High Similarity",
        };
      }

      if (initialCount >= 2) {
        return {
          inputName: originalInput,
          givenName: originalGiven,
          percentage: 88,
          remark: "High Similarity",
        };
      }

      if (initialCount === 1) {
        return {
          inputName: originalInput,
          givenName: originalGiven,
          percentage: 82,
          remark: "High Similarity",
        };
      }

      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 75,
        remark: "Possible Match",
      };
    }

    if (isLastMatch && initialCount >= 1) {
      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 70,
        remark: "Possible Match",
      };
    }

    if (isLastMatch && initialCount === 0) {
      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 55,
        remark: "Low Match",
      };
    }
  }

  if (inputTokens.length === givenTokens.length) {
    const sortedInput = inputTokens.slice().sort();
    const sortedGiven = givenTokens.slice().sort();

    let strongTokenMatches = 0;

    for (let i = 0; i < sortedInput.length; i++) {
      const dist = levenshtein(sortedInput[i], sortedGiven[i]);
      const sim =
        1 -
        dist /
          Math.max(sortedInput[i].length, sortedGiven[i].length);

      if (sim >= 0.85) strongTokenMatches++;
    }

    if (strongTokenMatches === sortedInput.length) {
      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 92,
        remark: "High Similarity",
      };
    }
  }

  let matchedScore = 0;
  const usedIndexes = new Set<number>();

  for (const g of givenTokens) {
    let best = 0;
    let bestIndex = -1;

    inputTokens.forEach((i, idx) => {
      if (usedIndexes.has(idx)) return;

      const dist = levenshtein(i, g);
      const sim =
        1 - dist / Math.max(i.length, g.length);

      if (sim > best) {
        best = sim;
        bestIndex = idx;
      }

      if (isInitialMatch(i, g) && 0.9 > best) {
        best = 0.9;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1) {
      usedIndexes.add(bestIndex);
      matchedScore += best;
    }
  }

  const coverage = matchedScore / inputTokens.length;
  const precision = matchedScore / givenTokens.length;

  let score = Math.round((coverage * 0.7 + precision * 0.6) * 100);

  if (mergeSimilarity < 0.6) {
    if (inputNoSpace.length <= 6) score -= mergeDistance * 4;
    else if (inputNoSpace.length <= 12) score -= mergeDistance * 2;
    else score -= mergeDistance * 1;
  }

  score = Math.max(0, Math.min(99, score));

  let remark: string;
  if (score === 100) remark = "Exact Match";
  else if (score >= 80) remark = "High Similarity";
  else if (score >= 70) remark = "Possible Match";
  else remark = "Low Match";

  return {
    inputName: originalInput,
    givenName: originalGiven,
    percentage: score,
    remark,
  };
}