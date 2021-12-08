// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const codeRegex = /[a-g]{2,8}/g;

const numberToSegmentMap = new Map();
numberToSegmentMap.set(0, [ 'a', 'b', 'c', 'e', 'f', 'g' ]);
numberToSegmentMap.set(1, [ 'c', 'f' ]);
numberToSegmentMap.set(2, [ 'a', 'c', 'd', 'e', 'g' ]);
numberToSegmentMap.set(3, [ 'a', 'c', 'd', 'f', 'g' ]);
numberToSegmentMap.set(4, [ 'b', 'c', 'd', 'f' ]);
numberToSegmentMap.set(5, [ 'a', 'b', 'd', 'f', 'g' ]);
numberToSegmentMap.set(6, [ 'a', 'b', 'd', 'e', 'f', 'g' ]);
numberToSegmentMap.set(7, [ 'a', 'c', 'f' ]);
numberToSegmentMap.set(8, [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]);
numberToSegmentMap.set(9, [ 'a', 'b', 'c', 'd', 'f', 'g' ]);
// Reverse map of sorts
const countToNumberMap = new Map();
numberToSegmentMap.forEach((segments, key) => {
  if (!countToNumberMap.has(segments.length)) {
    countToNumberMap.set(segments.length, [ ]);
  }
  countToNumberMap.get(segments.length).push(key);
});

function decodeInput(input) {
  let decoder = Array(10).fill(null);
  let candidates = [ ];
  let found = null;
  // c, f from 1
  // a is difference in set between 7 and 1
  // b, d is difference in set between 1 and 4
  // 5 is the only one that has 5 characters and both b, d
  // 'e' and 'f' differ between 2 and 3, only 3 has both letters of 1
  // 9 doesn't have 'e'
  // 6 doesn't have 'c'
  // 0 is last one
  while ((found = codeRegex.exec(input)) !== null) {
    let numSegments = found[0].length;
    let possibilities = countToNumberMap.get(numSegments);
    if (possibilities.length === 1) {
      decoder[possibilities[0]] = found[0];
    }
    else {
      candidates.push(found[0]);
    }
  }
  // 'b', 'd' are in 4, but not in 1
  let segmentsBD = decoder[4].split('').filter(x => !decoder[1].includes(x));
  // 5 is the only one that has 5 characters and both b, d
  decoder[5] = candidates.find(x => x.length === 5 && x.includes(segmentsBD[0]) && x.includes(segmentsBD[1]));
  candidates.splice(candidates.indexOf(decoder[5]), 1);
  // 3 is the only 5 length that has both c, f (decoder[1])
  decoder[3] = candidates.find(x => x.length === 5 && x.includes(decoder[1][0]) && x.includes(decoder[1][1]));
  candidates.splice(candidates.indexOf(decoder[3]), 1);
  // 2 is the remaining one with 5 length
  decoder[2] = candidates.find(x => x.length === 5);
  candidates.splice(candidates.indexOf(decoder[2]), 1);
  // Difference between 2 and 3 is 'e'
  let segmentE = decoder[2].split('').filter(x => !decoder[3].includes(x));
  // 9 is the one remaining that doesn't have E
  decoder[9] = candidates.find(x => !x.includes(segmentE[0]));
  candidates.splice(candidates.indexOf(decoder[9]), 1);
  // 6 is the remaining one that that has both b, d from before
  decoder[6] = candidates.find(x => x.includes(segmentsBD[0]) && x.includes(segmentsBD[1]));
  candidates.splice(candidates.indexOf(decoder[6]), 1);
  // 0 is the last one.
  decoder[0] = candidates[0];

  return decoder;
}

function decodeOutput(decoder, output) {
  let result = [ ];
  while ((found = codeRegex.exec(output)) !== null) {
    let value = found[0];
    let match = decoder.find(candidate => {
      if (value.length !== candidate.length) {
        return false;
      }
      let nonMatchingLetters = value.split('').filter(x => !candidate.includes(x));
      return nonMatchingLetters.length === 0;
    });
    result.push(decoder.indexOf(match));
  }
  return Number.parseInt(result.map(x => `${x}`).join(''));
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let count = 0;
  for await (const line of rl) {
    let parts = line.split('|').map(element => element.trim());
    let input = parts[0];
    let output = parts[1];
    let decoder = decodeInput(input);
    let decoded = decodeOutput(decoder, output);
    count += decoded;
  }
  return count;
}

processLineByLine()
  .then(result => {
    console.log(`Total ${result}`);
  });
