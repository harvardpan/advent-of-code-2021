// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function step(polymer, ruleMap) {
  let result = '';
  for (let i = 0; i < polymer.length; ++i) {
    if (i === polymer.length - 1) {
      // last character - just append it
      result = result.concat(polymer.charAt(i));
      break;
    }
    let pair = polymer.slice(i, i + 2);
    if (!ruleMap.has(pair)) {
      throw new Error('boom!');
    }
    result = result.concat(pair.charAt(0), ruleMap.get(pair));
  }
  return result;
}

function mapByFrequency(polymer) {
  let frequencyMap = new Map();
  let polymerArray = polymer.split('');
  for (let i = 0; i < polymerArray.length; ++i) {
    let character = polymerArray[i];
    if (!frequencyMap.has(character)) {
      frequencyMap.set(character, 0);
    }
    frequencyMap.set(character, frequencyMap.get(character) + 1);
  }
  return frequencyMap;
}

function minMax(frequencyMap) {
  let result = { 
    min: null,
    minChar: null, 
    max: null,
    maxChar: null
  };
  for (const [character, count] of frequencyMap) {
    if (result.min === null || result.min > count) {
      result.min = count;
      result.minChar = character;
    }
    if (result.max === null || result.max < count) {
      result.max = count;
      result.maxChar = character;
    }
  }
  return result;
}

let ruleRegex = /([A-Z]+) -> ([A-Z])/;
async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let ruleMap = new Map();
  let polymerTemplate = null;
  for await (const line of rl) {
    if (!polymerTemplate) {
      polymerTemplate = line;
      continue;
    }
    if (!line.trim().length) {
      continue; // nothing to parse
    }
    let found = line.match(ruleRegex);
    if (found) {
      ruleMap.set(found[1], found[2]);
    }
  }
  console.log(`Template:     ${polymerTemplate}`);
  let polymer = polymerTemplate;
  for (let i = 0; i < 10; ++i) {
    polymer = step(polymer, ruleMap);
    // console.log(`After step ${i + 1}: ${polymer}`);
  }
  let frequencyMap = mapByFrequency(polymer);
  let result = minMax(frequencyMap);
  console.log(`Most common element (${result.maxChar}, ${result.max})`);
  console.log(`Least common element (${result.minChar}, ${result.min})`);
  console.log(`Difference: ${result.max - result.min}`);
}

processLineByLine()
  .then(result => {
  });
