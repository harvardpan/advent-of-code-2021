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
  let decoded = [ ];
  let found = null;
  while ((found = codeRegex.exec(input)) !== null) {
    let numSegments = found[0].length;
    let possibilities = countToNumberMap.get(numSegments);
    if (possibilities.length === 1) {
      // console.log(`Found ${found[0]} to equal ${possibilities[0]}`);
      decoded.push(`${found[0]}:${possibilities[0]}`);
    }
  }
  return decoded;
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
    let decoded = decodeInput(output);
    count += decoded.length;
  }
  return count;
}

processLineByLine()
  .then(result => {
    console.log(`Found ${result} easy numbers.`);
  });
