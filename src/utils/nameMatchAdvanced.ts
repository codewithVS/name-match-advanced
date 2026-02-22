
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
  if (token.length >= 2 && token.length <= 4 && /^[a-z]+$/.test(token) && !/[aeiou]/.test(token)) {
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

  inputTokens = expandCombinedInitials(inputTokens);
  givenTokens = expandCombinedInitials(givenTokens);

  let score = 0;

  if (inputName === givenName) score = 100;
  else if (isSwappedMatch(inputTokens, givenTokens)) score = 99;
  else if (
    givenTokens.every((t) => inputTokens.includes(t)) ||
    inputTokens.every((t) => givenTokens.includes(t))
  ) {
    const longer = Math.max(inputTokens.length, givenTokens.length);
    const shorter = Math.min(inputTokens.length, givenTokens.length);
    const diff = longer - shorter;

    const hasFullTokenMatch = givenTokens.some((t) => t.length > 1 && inputTokens.includes(t));

    if (hasFullTokenMatch) {
      if (diff === 0) score = 99;
      else if (diff === 1) score = 94;
      else score = 90;
    } else {
      const matchRatio = shorter / longer;
      score = Math.round(matchRatio * 60);
    }
  } else {
    let matchedScore = 0;
    const usedIndexes = new Set<number>();

    for (const g of givenTokens) {
      let bestMatch = 0;
      let bestIndex = -1;

      inputTokens.forEach((i, idx) => {
        if (usedIndexes.has(idx)) return;

        if (i.startsWith(g) || g.startsWith(i)) {
          const similarity = Math.min(1, (Math.min(i.length, g.length) / Math.max(i.length, g.length)) * 1.1);
          if (similarity > bestMatch) {
            bestMatch = similarity;
            bestIndex = idx;
          }
        }

        const distance = levenshtein(i, g);
        const similarity = 1 - distance / Math.max(i.length, g.length);
        const weighted = Math.min(1, similarity * 1.05);
        if (weighted > bestMatch) {
          bestMatch = weighted;
          bestIndex = idx;
        }

        if (isInitialMatch(i, g)) {
          const initialScore = 0.85;
          if (initialScore > bestMatch) {
            bestMatch = initialScore;
            bestIndex = idx;
          }
        }
      });

      if (bestIndex !== -1) {
        usedIndexes.add(bestIndex);
        matchedScore += bestMatch;
      }
    }

    const coverage = matchedScore / inputTokens.length;
    const precision = matchedScore / givenTokens.length;
    score = Math.round((coverage * 0.65 + precision * 0.5) * 100);

    if (score >= 98 && inputName !== givenName) score = 95;
  }
  const inputHasFull = inputTokens.some((t) => t.length > 1);
  const givenHasFull = givenTokens.some((t) => t.length > 1);
  const inputAllInitials = inputTokens.every((t) => t.length === 1);
  const givenAllInitials = givenTokens.every((t) => t.length === 1);
  const fullTokenMatchExists = givenTokens.some((g) => g.length > 1 && inputTokens.includes(g));

  if ((inputHasFull && givenAllInitials) || (givenHasFull && inputAllInitials)) {
    score = Math.min(score, 65);
  } else if (inputHasFull && givenHasFull && !fullTokenMatchExists) {
    score = Math.min(score, 65);
  }

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