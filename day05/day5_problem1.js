// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let rowRegex = /^(\d+),(\d+) -> (\d+),(\d+)$/;

function addDataPoints(x1, y1, x2, y2, pointsMap) {
  if (x1 === x2) {
    for (let i = Math.min(y1, y2); i <= Math.max(y1, y2); ++i) {
      let pointKey = `${x1},${i}`;
      if (!pointsMap.has(pointKey)) {
        pointsMap.set(pointKey, 0);
      }
      pointsMap.set(pointKey, pointsMap.get(pointKey) + 1); // increment if encountered before
    }
  }
  else if (y1 === y2) {
    for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); ++i) {
      let pointKey = `${i},${y1}`;
      if (!pointsMap.has(pointKey)) {
        pointsMap.set(pointKey, 0);
      }
      pointsMap.set(pointKey, pointsMap.get(pointKey) + 1); // increment if encountered before
    }
  }
  else {
    throw new Error('boom!!!!');
  }
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let battleshipMap = new Map();
  for await (const line of rl) {
    let found = line.match(rowRegex);
    if (!found) {
      continue;
    }
    // Only horizontal lines and vertical lines allowed
    let x1 = Number.parseInt(found[1]);
    let y1 = Number.parseInt(found[2]);
    let x2 = Number.parseInt(found[3]);
    let y2 = Number.parseInt(found[4]);
    if (x1 !== x2 && y1 !== y2) {
      continue; // not a vertical or horizontal line.
    }
    addDataPoints(x1, y1, x2, y2, battleshipMap);
  }

  let dangerousPoints = 0;
  for (let hits of battleshipMap.values()) {
    if (hits >= 2) {
      dangerousPoints++;
    }
  }
  return dangerousPoints;
}

processLineByLine()
  .then(result => {
    console.log(`Number of dangerous points: ${result}`);
  });
