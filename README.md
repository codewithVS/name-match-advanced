# name-match-advanced

---

🚀 **Live Interactive Demo:**  
👉 
<p align="center">
  <a href="https://name-match-advanced-demo.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Try%20DEMO-Live%20Interactive%20Demo-4F46E5?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

---

A Most Powerful robust name matching library for Node.js and TypeScript that combines multiple strategies — initials handling, token swapping, fuzzy similarity, and prefix normalization — for accurate name matching in **fintech, insurance, CRM, KYC, OCR and other applications**.

[![npm version](https://img.shields.io/npm/v/name-match-advanced)](https://www.npmjs.com/package/name-match-advanced)
![Test Coverage](https://img.shields.io/badge/Test%20Coverage-98%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Supported-F7DF1E?logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## Features

* **Multi-strategy Matching**: Combines exact match, initials handling, swapped tokens, and fuzzy Levenshtein similarity.
* **Prefix Normalization**: Removes common prefixes like Mr, Mrs, Dr, Shri, Smt, etc.
* **Initials Expansion & Merge**: Converts `K.S.` → `KS`, `KS` → `K S`, or merges initials intelligently.
* **Swapped Tokens Handling**: Recognizes names in different order 
(e.g., "Vijay Kumar Sharma" → "Sharma Vijay Kumar"
"Vijay Kumar Sharma" → "Vijay K S").
* **Scoring System**: Returns percentage similarity and descriptive remarks: Exact Match, High Similarity, Possible Match, Low Match.
* **Fuzzy Matching**: Handles typos and variations using Levenshtein distance.
* **Node.js & TypeScript Ready**: Works in JS, TS, and frameworks like Next.js.

---

## Installation

```bash
npm install name-match-advanced
```

Or yarn:

```bash
yarn add name-match-advanced
```

---

## Quick Start (JavaScript)

```javascript
const { matchNames } = require('name-match-advanced');

const result = matchNames('Sagar Kumar Jangid', 'Sagar Kumar J');

console.log(result);
/*
{
  inputName: 'Sagar Kumar Jangid',
  givenName: 'Sagar Kumar J',
  percentage: 95,
  remark: 'High Similarity'
}
*/
```

---

## TypeScript Example

```ts
import { matchNames } from 'name-match-advanced';

const result = matchNames('Sagar Kumar Jangid', 'Sagar Kumar J');

console.log(result);
/*
{
  inputName: 'Sagar Kumar Jangid',
  givenName: 'Sagar Kumar J',
  percentage: 95,
  remark: 'High Similarity'
}
*/
```

---

## Next.js API Example

```ts
// pages/api/match.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { matchNames } from 'name-match-advanced';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { inputName, givenName } = req.query;

  if (!inputName || !givenName) {
    return res.status(400).json({ error: 'inputName and givenName are required' });
  }

  const result = matchNames(inputName as string, givenName as string);
  res.status(200).json(result);
}

/*
Request:
GET /api/match?inputName=Gowri%20K%20S&givenName=GOWRI%20KS

Response:
{
  "inputName": "Gowri K S",
  "givenName": "GOWRI KS",
  "percentage": 100,
  "remark": "Exact Match"
}
*/
```

---

## Advanced Usage

```ts
import { matchNames } from 'name-match-advanced';

const examples = [
  { input: 'K S Gowri', given: 'Gowri K S' },
  { input: 'Yadav Vijaysinh Ishwarsinh', given: 'VIJAYSINH ISHWARSINH YADAV' },
  { input: 'Shilpa Deshpande', given: 'Shilpa P Deshpande' }
];

examples.forEach(({ input, given }) => {
  const result = matchNames(input, given);
  console.log({ input, given, result });
});

/*
Sample Output:

{ input: 'K S Gowri', given: 'Gowri K S', result: { inputName: 'K S Gowri', givenName: 'Gowri K S', percentage: 99, remark: 'High Similarity' } }

{ input: 'Yadav Vijaysinh Ishwarsinh', given: 'VIJAYSINH ISHWARSINH YADAV', result: { inputName: 'Yadav Vijaysinh Ishwarsinh', givenName: 'VIJAYSINH ISHWARSINH YADAV', percentage: 100, remark: 'Exact Match' } }

{ input: 'Shilpa Deshpande', given: 'Shilpa P Deshpande', result: { inputName: 'Shilpa Deshpande', givenName: 'Shilpa P Deshpande', percentage: 85, remark: 'Possible Match' } }
*/
```

---

## How It Works


1. **Matching Strategies**

   * **Exact Match** → 100%
   * **Swapped Token Match** → 99%
   * **Full Token Containment** → 90–99%
   * **Fuzzy Levenshtein Match** → 60–95%
   * **Initial-only Downgrade** → Avoids false positives

2. **Scoring & Remark**

   * 100 → Exact Match
   * 90–99 → High Similarity
   * 70–89 → Possible Match
   * <70 → Low Match

---

## Challenges Handled

* Different name orders (first last vs. last, first)
* Middle names and initials
* Nicknames and formal names
* Suffixes (Jr, Sr, III)
* Titles and prefixes (Mr, Dr, Smt)
* Hyphenated or compound names
* Case differences, spacing variations, special characters

---


## License

MIT License © 2026 vspro

---

## Keywords

`name-matching`, `name-matching-kyc`, `name-matching-ocr`, `fuzzy-match`, `initials`, `levenshtein`, `typescript`, `nodejs`, `nextjs`, `npm-package`, `name-validation`, `crm`, `fintech`, `insurance`, `KYC`, `OCR`, `CRM`
