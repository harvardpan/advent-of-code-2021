// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let numBits = 12;

function calculate(lines, useGreater = true) {
  let valuesMap = new Map();
  let nextSet = lines;
  for (let i = 0; i <= numBits; ++i) {
    if (i !== 0) {
      let numZeroes = valuesMap.get('0').length;
      let numOnes = valuesMap.get('1').length;
      if (numZeroes > numOnes) {
        if (useGreater) {
          nextSet = valuesMap.get('0');
        } else {
          nextSet = valuesMap.get('1');
        }
      }
      else {
        if (useGreater) {
          nextSet = valuesMap.get('1');
        }
        else {
          nextSet = valuesMap.get('0');
        }
      }  
    }
    // Break out of the for loop when there is just one value left
    if (nextSet.length === 1) {
      return nextSet[0];
    }
    if (i === numBits) {
      throw new Error('boom!!!'); // not supposed to happen
    }
    valuesMap.set('0', [ ]);
    valuesMap.set('1', [ ]);
    for (let line of nextSet) {
      if (line.charAt(i) === '1') {
        valuesMap.get('1').push(line);
      }
      else {
        valuesMap.get('0').push(line);
      }  
    }
  }
  throw new Error('boom!!!!'); // should never get here.
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'power_readings.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let lines = [ ];
  for await (const line of rl) {
    lines.push(line);
  }
  let oxygen = calculate(lines, true);
  let co2 = calculate(lines, false);
  return { oxygen: Number.parseInt(oxygen, 2), co2: Number.parseInt(co2, 2) };
}

processLineByLine()
  .then(result => {
    console.log(`Oxygen: ${result.oxygen} (${result.oxygen.toString(2).padStart(numBits, '0')}), CO2: ${result.co2} (${result.co2.toString(2).padStart(numBits, '0')}), Power: ${result.oxygen * result.co2}`);
  });
