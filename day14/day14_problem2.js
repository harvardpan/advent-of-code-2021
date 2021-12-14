// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function getPairCount(polymer, ruleMap) {
  let result = new Map();
  for (const [pair, target] of ruleMap) {
    result.set(pair, 0);
  }
  for (let i = 0; i < polymer.length - 1; ++i) { // ignore last element as it won't be a pair
    let pair = polymer.slice(i, i + 2);
    result.set(pair, result.get(pair) + 1);
  }
  return result;
}

function step(pairCount, ruleMap, characterCount) {
  let newPairCount = new Map(pairCount); // clone a copy
  for (const [pair, count] of pairCount) {
    if (count === 0) {
      continue; // no need to process an empty count
    }
    let target = ruleMap.get(pair);
    // Increase the character count of the traget
    if (!characterCount.has(target)) {
      characterCount.set(target, 0);
    }
    characterCount.set(target, characterCount.get(target) + count);
    // Insert the target to get the two new pairs
    let newPair1 = `${pair.charAt(0)}${target}`;
    let newPair2 = `${target}${pair.charAt(1)}`;
    newPairCount.set(newPair1, newPairCount.get(newPair1) + count);
    newPairCount.set(newPair2, newPairCount.get(newPair2) + count);
    // Now subtract the original pair
    newPairCount.set(pair, newPairCount.get(pair) - count);
  }
  return newPairCount;
}

function mapByFrequency(polymer) {
  let frequencyMap = new Map();
  for (let i = 0; i < polymer.length; ++i) {
    let character = polymer.charAt(i);
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
  let pairCount = getPairCount(polymerTemplate, ruleMap);
  let frequencyMap = mapByFrequency(polymerTemplate);
  for (let i = 0; i < 40; ++i) {
    pairCount = step(pairCount, ruleMap, frequencyMap);
  }
  let result = minMax(frequencyMap);
  console.log(`Most common element (${result.maxChar}, ${result.max})`);
  console.log(`Least common element (${result.minChar}, ${result.min})`);
  console.log(`Difference: ${result.max - result.min}`);
}

processLineByLine()
  .then(result => {
  });
