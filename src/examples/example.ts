import { matchNames } from "../utils/nameMatchAdvanced";
const examples = [
  { input: "Vikash Yadav Luniwal", given: "Vikash Y L" },
  { input: "Vikash Yadav Luniwal", given: "Vikash Yadav" },
  { input: "Vikash Yadav Luniwal", given: "Vikash Luniwal Yadav" },
  { input: "Vikash Yadav Luniwal", given: "Vikash Yadav Luniwal" },
];

examples.forEach(({ input, given }) => {
  const result = matchNames(input, given);
  console.log(result);
});

/*
OUTPUT  : 

{
  inputName: 'Vikash Yadav Luniwal',
  givenName: 'Vikash Y L',
  percentage: 90,
  remark: 'High Similarity'
}
{
  inputName: 'Vikash Yadav Luniwal',
  givenName: 'Vikash Yadav',
  percentage: 94,
  remark: 'High Similarity'
}
{
  inputName: 'Vikash Yadav Luniwal',
  givenName: 'Vikash Luniwal Yadav',
  percentage: 99,
  remark: 'High Similarity'
}
{
  inputName: 'Vikash Yadav Luniwal',
  givenName: 'Vikash Yadav Luniwal',
  percentage: 100,
  remark: 'Exact Match'
}
*/