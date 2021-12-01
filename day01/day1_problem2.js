// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'measurements.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let numIncreases = 0;
  let arrayOfFour = [ ];
  for await (const line of rl) {
    let currentMeasurement = line.replace(/^(.*)$/, '$1');
    if (isNaN(parseInt(currentMeasurement))) {
      console.error(`Bad input '${currentMeasurement}', skipping!`)
    }
    arrayOfFour.push(Number(currentMeasurement));
    arrayOfFour = arrayOfFour.slice(-4);
    if (arrayOfFour.length !== 4) {
      continue;
    }
    let previousWindowSum = arrayOfFour.slice(0, 3).reduce((acc, curr) => {
      return acc + curr;
    }, 0);
    let currentWindowSum = arrayOfFour.slice(1, 4).reduce((acc, curr) => {
      return acc + curr;
    }, 0);
    if (currentWindowSum > previousWindowSum) {
      numIncreases++;
    }
  }
  return numIncreases;
}

processLineByLine()
  .then(result => {
    console.log(`There are ${result} increases.`);
  });
