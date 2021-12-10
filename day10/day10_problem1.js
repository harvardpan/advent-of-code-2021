// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let openingCharacters = [ '{', '(', '[', '<' ];
let closingCharacters = [ '}', ')', ']', '>' ];
function findIllegalCharacter(line) {
  let stack = [ ];
  let characters = line.split('');
  for (let i = 0; i < characters.length; ++i) {
    let currentCharacter = characters[i];
    if (openingCharacters.includes(currentCharacter)) {
      stack.push(currentCharacter);
      continue;
    }
    if (closingCharacters.includes(currentCharacter)) {
      if (stack.length === 0) {
        return { expected: null, found: currentCharacter };
      }
      let index = closingCharacters.indexOf(currentCharacter);
      let lastCharacter = stack.slice(-1)[0];
      if (lastCharacter === openingCharacters[index]) {
        // paired - can pop
        stack.pop();
        continue;
      }
      index = openingCharacters.indexOf(lastCharacter);
      return { expected: closingCharacters[index], found: currentCharacter };
    }
  }
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
  for await (const line of rl) {
    let result = findIllegalCharacter(line);
    if (!result) {
      continue; // no illegal character found
    }
    console.log(JSON.stringify(result));
    if (result.found === ')') {
      points += 3;
    }
    else if (result.found === ']') {
      points += 57;
    }
    else if (result.found === '}') {
      points += 1197;
    }
    else if (result.found === '>') {
      points += 25137;
    }
  }
  console.log(`Total Syntax Error Score: ${points}`);
}

processLineByLine()
  .then(result => {
  });
