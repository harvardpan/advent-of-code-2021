// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function explode(input) {
  let explodingPair = null;
  let bracketStack = [ ];
  let previousNumber = NaN;
  let currentNumber = '';
  let nextNumber = function() {
    if (currentNumber !== '') {
      previousNumber = Number.parseInt(currentNumber);
    }
    currentNumber = '';
  }
  for (let i = 0; i < input.length; ++i) {
    if (input.charAt(i) === '[') {
      nextNumber();
      bracketStack.push(input.charAt(i));
      if (bracketStack.length === 5) {
        // we found our explode candidate!
        let pairEndIndex = input.indexOf(']', i);
        explodingPair = input.slice(i + 1, pairEndIndex).split(',').map(x => Number.parseInt(x));
        // find the next occurrence of a number
        let afterText = input.slice(pairEndIndex + 1);
        let found = afterText.match(/(\d+)/);
        if (found) {
          afterText = afterText.replace(/\d+/, `${Number.parseInt(found[1]) + explodingPair[1]}`);
        }
        // find the last occurrence of a number
        let beforeText = input.slice(0, i);
        found = beforeText.match(/(\d+)([^\d]*)$/);
        if (found) {
          beforeText = beforeText.replace(/(\d+)([^\d]*)$/, `${Number.parseInt(found[1]) + explodingPair[0]}${found[2]}`);
        }
        return beforeText + '0' + afterText;
      }
    }
    else if (input.charAt(i) === ']') {
      nextNumber();
      bracketStack.pop();
    }
    else if (input.charAt(i) === ',') {
      nextNumber();
    }
    else {
      // only digits here
      currentNumber = currentNumber.concat(input.charAt(i));
    }
  }
  return false;
}

function split(input) {
  let result = '';
  let doubleDigitRegex = /\d{2}/;
  let inputLastIndex = 0;
  let found = doubleDigitRegex.exec(input)
  if (found) {
    result = result.concat(input.slice(inputLastIndex, found.index));
    inputLastIndex = found.index + 2; // accounts for the two digits
    // Add in the newly split pair
    let number = Number.parseInt(found[0]);
    result += `[${Math.floor(number / 2)},${Math.ceil(number / 2)}]`;
  }
  result = result.concat(input.slice(inputLastIndex));
  if (result === input) {
    return false;
  }
  return result;
}

function addition(a, b) {
  return `[${a},${b}]`
}

function reduce(input) {
  let done = false;
  let updated = input;

  while (true) {
    let exploded = explode(updated);
    if (exploded) {
      updated = exploded;
      continue;
    }
    let splitted = split(updated);
    if (splitted) {
      updated = splitted;
      continue;
    }
    break; // if neither operation happened, we exit.
  }
  return updated;
}

function magnitude(input) {
  let result = input;
  let leafRegex = /\[(\d+),(\d+)\]/;
  let found = null;
  while ((found = result.match(leafRegex)) !== null) {
    let replacement = Number.parseInt(found[1]) * 3 + Number.parseInt(found[2]) * 2;
    result = result.replace(found[0], `${replacement}`);
  }
  return result;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let latest = null;
  for await (const line of rl) {
    if (!latest) {
      latest = line;
    }
    else {
      latest = addition(latest, line);
    }
    latest = reduce(latest);
  }
  console.log(`Final: ${latest}`);
  console.log(`Magnitude: ${magnitude(latest)}`);
}

processLineByLine()
  .then(result => {
  });
