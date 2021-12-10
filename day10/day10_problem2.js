// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let openingCharacters = [ '{', '(', '[', '<' ];
let closingCharacters = [ '}', ')', ']', '>' ];

function completeMissingCharacters(line) {
  let stack = [ ];
  let characters = line.split('');
  for (let i = 0; i < characters.length; ++i) {
    let currentCharacter = characters[i];
    if (openingCharacters.includes(currentCharacter)) {
      stack.push(currentCharacter);
      continue;
    }
    if (closingCharacters.includes(currentCharacter)) {
      let index = closingCharacters.indexOf(currentCharacter);
      let lastCharacter = stack.slice(-1)[0];
      if (lastCharacter === openingCharacters[index]) {
        // paired - can pop
        stack.pop();
        continue;
      }
      return undefined;
    }
  }
  if (stack.length === 0) {
    return [ ];
  }
  let missingCharacters = [ ];
  // The remaining stack, we need to build up the missing characters by popping off stack
  while (lastCharacter = stack.pop()) {
    let index = openingCharacters.indexOf(lastCharacter);
    missingCharacters.push(closingCharacters[index]);
  }
  return missingCharacters;
}

function calculateScore(result) {
  let score = result.reduce((acc, curr) => {
    let value = 0;
    switch (curr) {
      case ')':
        value = 1;
        break;
      case ']':
        value = 2;
        break;
      case '}':
        value = 3;
        break;
      case '>':
        value = 4;
        break;
    }
    return acc * 5 + value;
  }, 0);
  return score;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let points = 0;
  let scores = [ ];
  for await (const line of rl) {
    let result = completeMissingCharacters(line);
    if (!result) {
      continue; // illegal character found, ignore.
    }
    let score = calculateScore(result);
    scores.push(score);
    console.log(`${result.join('')} - ${score}`);
  }
  scores.sort(function(a, b) { return a - b; });
  console.log(JSON.stringify(scores));
  console.log(`Middle score is ${scores[Math.floor(scores.length / 2)]}`);
}

processLineByLine()
  .then(result => {
  });
