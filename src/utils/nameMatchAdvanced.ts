const COMMON_PREFIXES = ["mr", "mrs", "ms", "miss", "shri", "smt", "dr"];

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

  inputName = mergeInitials(normalizeName(inputName));
  givenName = mergeInitials(normalizeName(givenName));

  let inputTokens = tokenize(inputName);
  let givenTokens = tokenize(givenName);

  // Remove duplicate tokens
  inputTokens = removeDuplicateTokens(inputTokens);
  givenTokens = removeDuplicateTokens(givenTokens);

  // Rebuild cleaned names after duplicate removal
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

  if (isSwappedMatch(inputTokens, givenTokens)) {
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

  if (mergeSimilarity >= 0.88) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: Math.round(mergeSimilarity * 100),
      remark: "High Similarity",
    };
  }

  const shorterTokens =
    inputTokens.length <= givenTokens.length
      ? inputTokens
      : givenTokens;

  const longerTokens =
    inputTokens.length > givenTokens.length
      ? inputTokens
      : givenTokens;

  let exactShortMatches = 0;

  for (const s of shorterTokens) {
    if (longerTokens.includes(s)) {
      exactShortMatches++;
    }
  }

  const validShortName =
  shorterTokens.length > 1 ||
  shorterTokens.some(t => t.length >= 3);

if (
  validShortName &&
  exactShortMatches === shorterTokens.length
) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 90,
      remark: "High Similarity",
    };
  }

  let initialMatchCount = 0;
  let fullTokenMatchCount = 0;

  for (const g of givenTokens) {
    if (/^[a-z]{1,3}$/.test(g) && !/[aeiou]/.test(g)) {
      const letters = g.split("");
      for (const letter of letters) {
        if (inputTokens.some(t => t.startsWith(letter))) {
          initialMatchCount++;
        }
      }
    } else if (g.length === 1) {
      if (inputTokens.some(t => t.startsWith(g))) {
        initialMatchCount++;
      }
    } else if (inputTokens.includes(g)) {
      fullTokenMatchCount++;
    }
  }

  if (fullTokenMatchCount >= 1 && initialMatchCount >= 1) {
    return {
      inputName: originalInput,
      givenName: originalGiven,
      percentage: 88 + Math.min(initialMatchCount * 2, 6),
      remark: "High Similarity",
    };
  }

  let strongMatches: string[] = [];

  for (const g of givenTokens) {
    for (const i of inputTokens) {
      const distance = levenshtein(i, g);
      const similarity =
        1 - distance / Math.max(i.length, g.length);

      if (similarity >= 0.95) {
        strongMatches.push(g);
      }
    }
  }

  if (strongMatches.length === 1) {
    const remainingGiven = givenTokens.filter(
      t => !strongMatches.includes(t)
    );
    const remainingInput = inputTokens.filter(
      t => !strongMatches.includes(t)
    );

    let secondarySimilarity = 0;

    if (remainingGiven.length && remainingInput.length) {
      const d = levenshtein(
        remainingGiven[0],
        remainingInput[0]
      );
      secondarySimilarity =
        1 - d /
        Math.max(
          remainingGiven[0].length,
          remainingInput[0].length
        );
    }

    if (secondarySimilarity >= 0.6) {
      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 82,
        remark: "Possible Match",
      };
    } else {
      return {
        inputName: originalInput,
        givenName: originalGiven,
        percentage: 40,
        remark: "Low Match",
      };
    }
  }

  let matchedScore = 0;
  const usedIndexes = new Set<number>();

  for (const g of givenTokens) {
    let bestMatch = 0;
    let bestIndex = -1;

    inputTokens.forEach((i, idx) => {
      if (usedIndexes.has(idx)) return;

      const distance = levenshtein(i, g);
      const similarity =
        1 - distance / Math.max(i.length, g.length);

      if (similarity > bestMatch) {
        bestMatch = similarity;
        bestIndex = idx;
      }

      if (isInitialMatch(i, g) && 0.9 > bestMatch) {
        bestMatch = 0.9;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1) {
      usedIndexes.add(bestIndex);
      matchedScore += bestMatch;
    }
  }

  const coverage = matchedScore / inputTokens.length;
  const precision = matchedScore / givenTokens.length;

  let score = Math.round((coverage * 0.7 + precision * 0.6) * 100);

  if (mergeSimilarity < 0.6) {
    const totalLength = inputNoSpace.length;

    if (totalLength <= 6) score -= mergeDistance * 4;
    else if (totalLength <= 12) score -= mergeDistance * 2;
    else score -= mergeDistance * 1;
  }

  score = Math.max(0, Math.min(100, score));

  let remark: string;
  if (score === 100) remark = "Exact Match";
  else if (score >= 90) remark = "High Similarity";
  else if (score >= 70) remark = "Possible Match";
  else remark = "Low Match";

  return {
    inputName: originalInput,
    givenName: originalGiven,
    percentage: score,
    remark,
  };
}