// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function average(allPoints) {
  let sum = allPoints.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  return sum / allPoints.length;
}

function median(allPoints) {
  if (!allPoints || !allPoints.length) {
    return undefined;
  }

  allPoints.sort();
  let numPoints = allPoints.length;
  if (numPoints % 2 === 0) {
    // even set, so need to take average of middle two elements
    let highMidpoint = allPoints[numPoints / 2];
    let lowMidpoint = highMidpoint - 1;
    return (allPoints[lowMidpoint] + allPoints[highMidpoint]) / 2;
  }
  // odd set, so take the middle element
  let midpoint = Math.floor(numPoints / 2);
  return allPoints[midpoint];
}

function calculateTotalDistances(allPoints, pivot) {
  return allPoints.reduce((acc, curr) => {
    let distance = Math.abs(pivot - curr);
    let cost = ((distance + 1) * distance) / 2; 
    return acc + cost;
  }, 0);
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let allPoints = [ ];
  for await (const line of rl) {
    allPoints = line.split(',').map(strValue => Number.parseInt(strValue));
    break;
  }

  let lowestCost = Number.MAX_SAFE_INTEGER;
  let lowestPoint = Number.MAX_SAFE_INTEGER;
  let highest = Math.max(...allPoints);
  for (let i = Math.min(...allPoints); i <= highest; ++i) {
    let fuelCost = calculateTotalDistances(allPoints, i);
    console.log(`Fuel cost for ${i}: ${fuelCost}`);
    if (fuelCost < lowestCost) {
      lowestCost = fuelCost;
      lowestPoint = i;
    }
  }
  console.log(`Average: ${average(allPoints)}, Median: ${median(allPoints)}`);
  console.log(`Lowest cost for ${lowestPoint}: ${lowestCost}`);
}

processLineByLine()
  .then(result => {
  });
