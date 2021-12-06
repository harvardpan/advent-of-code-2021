// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function incrementDay(fishCounts) {
  let numNewFishes = fishCounts[0];;
  for (let i = 1; i < 9; ++i) {
    fishCounts[i - 1] = fishCounts[i]; // shift downwards
  }
  // add the 0's to the 6's as that's the reset point.
  fishCounts[6] += numNewFishes;
  fishCounts[8] = numNewFishes;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let fishCounts = Array(9).fill(0);
  for await (const line of rl) {
    let allFishes = line.split(',').map(strValue => Number.parseInt(strValue));
    for (let fish of allFishes) {
      fishCounts[fish]++;
    }
    break;
  }

  let daysToIncrement = 256;
  for (let i = 0; i < daysToIncrement; ++i) {
    incrementDay(fishCounts);
  }
  let sumFishes = fishCounts.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  console.log(`After ${daysToIncrement} days: ${sumFishes} lanternfish`);    
}

processLineByLine()
  .then(result => {
    console.log('done');
  });
