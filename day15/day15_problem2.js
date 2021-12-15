// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function buildLargeMap(risks) {
  let largeMap = [ ];
  // First, copy the row five times, each time mapping it higher by 1
  for (let row = 0; row < risks.length; ++row) {
    let newRow = [ ];
    for (let increase = 0; increase < 5; ++increase) {
      newRow = newRow.concat(risks[row].map(x => {
        let newValue = x + increase;
        if (newValue >= 10) {
          newValue -= 9;
        }
        return newValue;
      }));
    }
    largeMap.push(newRow);
  }
  // Now, we take each row, and increase it by one with additional rows beneath it.
  let numOriginalRows = largeMap.length;
  for (let increase = 1; increase < 5; ++increase) {
    for (let row = 0; row < numOriginalRows; ++row) {
      largeMap.push(largeMap[row].map(x => {
        let newValue = x + increase;
        if (newValue >= 10) {
          newValue -= 9;
        }
        return newValue;
      }));
    }
  }
  return largeMap;
}

function findShortestPath(risks, start, end, shortestDistances, visited = new Set(), orderedCandidates = [ ]) {
  let startKey = `${start.row}:${start.col}`;
  if (visited.has(startKey)) {
    return;
  }
  visited.add(startKey);
  let left = start.col > 0 ? { row: start.row, col: start.col - 1 } : null;
  if (left) {
    if (risks[left.row][left.col] + shortestDistances[start.row][start.col] < shortestDistances[left.row][left.col]) {
      shortestDistances[left.row][left.col] = risks[left.row][left.col] + shortestDistances[start.row][start.col];
      orderedCandidates.push(left);
    }
  }
  let right = start.col < risks[0].length - 1 ? { row: start.row, col: start.col + 1 } : null;
  if (right) {
    if (risks[right.row][right.col] + shortestDistances[start.row][start.col] < shortestDistances[right.row][right.col]) {
      shortestDistances[right.row][right.col] = risks[right.row][right.col] + shortestDistances[start.row][start.col];
      orderedCandidates.push(right);
    }
  }
  let up = start.row > 0 ? { row: start.row - 1, col: start.col } : null;
  if (up) {
    if (risks[up.row][up.col] + shortestDistances[start.row][start.col] < shortestDistances[up.row][up.col]) {
      shortestDistances[up.row][up.col] = risks[up.row][up.col] + shortestDistances[start.row][start.col];
      orderedCandidates.push(up);
    }
  }
  let down = start.row < risks.length - 1 ? { row: start.row + 1, col: start.col } : null;
  if (down) {
    if (risks[down.row][down.col] + shortestDistances[start.row][start.col] < shortestDistances[down.row][down.col]) {
      shortestDistances[down.row][down.col] = risks[down.row][down.col] + shortestDistances[start.row][start.col];
      orderedCandidates.push(down);
    }
  }
  // eliminate duplicates and sort the orderedCandidates.
  orderedCandidates.sort(function(a, b) {
    return shortestDistances[b.row][b.col] - shortestDistances[a.row][a.col];
  });
  return orderedCandidates.pop();
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let allRisks = [ ];
  let shortestDistances = [ ];
  for await (const line of rl) {
    let values = line.split('').map(x => Number.parseInt(x));
    allRisks.push(values);
    for (let i = 0; i < 5; ++i) {
      shortestDistances.push(Array(values.length * 5).fill(Number.MAX_SAFE_INTEGER));
    }
  }
  shortestDistances[0][0] = 0; // set the beginning point to 0 as we start there
  let largeMap = buildLargeMap(allRisks);
  let startingPoint = { row: 0, col: 0 };
  let endingPoint = { row: largeMap.length - 1, col: largeMap[0].length - 1 };
  let visited = new Set();
  let orderedCandidates = [ ]; // priority queue
  let nextNode = findShortestPath(largeMap, startingPoint, endingPoint, shortestDistances, visited, orderedCandidates);
  while (nextNode) {
    nextNode = findShortestPath(largeMap, nextNode, endingPoint, shortestDistances, visited, orderedCandidates);
  }
  console.log(shortestDistances[endingPoint.row][endingPoint.col]);
}

processLineByLine()
  .then(result => {
  });
