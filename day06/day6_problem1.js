// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function incrementDay(allFishes) {
  let numNewFishes = 0;
  allFishes.reduce((acc, curr, index) => {
    if (curr === 0) {
      numNewFishes++;
      acc[index] = 6; // reset to 6
      return acc;
    }
    acc[index] = curr - 1;
    return acc;
  }, allFishes);
  allFishes.push(...Array(numNewFishes).fill(8));
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let allFishes = [ ];
  for await (const line of rl) {
    allFishes = line.split(',').map(strValue => Number.parseInt(strValue));
    break;
  }

  let daysToIncrement = 80;
  for (let i = 0; i < daysToIncrement; ++i) {
    incrementDay(allFishes);
    console.log(`After ${i + 1} days: ${JSON.stringify(allFishes)}`);    
  }
  return allFishes.length;
}

processLineByLine()
  .then(result => {
    console.log(`There are ${result} lanternfishes in total.`);
  });
