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
  let previousMeasurement = null;
  for await (const line of rl) {
    let currentMeasurement = line.replace(/^(.*)$/, '$1');
    if (isNaN(parseInt(currentMeasurement))) {
      console.error(`Bad input '${currentMeasurement}', skipping!`)
    }
    if (previousMeasurement !== null && Number(currentMeasurement) > previousMeasurement) {
      numIncreases++;
    }
    previousMeasurement = Number(currentMeasurement);
  }
  return numIncreases;
}

processLineByLine()
  .then(result => {
    console.log(`There are ${result} increases.`);
  });
