// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function findShortestPath(risks, start, end, shortestDistances, visited = new Set()) {
  let startKey = `${start.row}:${start.col}`;
  if (visited.has(startKey)) {
    return;
  }
  visited.add(startKey);
  let left = start.col > 0 ? { row: start.row, col: start.col - 1 } : null;
  if (left) {
    if (risks[left.row][left.col] + shortestDistances[start.row][start.col] < shortestDistances[left.row][left.col]) {
      shortestDistances[left.row][left.col] = risks[left.row][left.col] + shortestDistances[start.row][start.col];
    }
  }
  let right = start.col < risks[0].length - 1 ? { row: start.row, col: start.col + 1 } : null;
  if (right) {
    if (risks[right.row][right.col] + shortestDistances[start.row][start.col] < shortestDistances[right.row][right.col]) {
      shortestDistances[right.row][right.col] = risks[right.row][right.col] + shortestDistances[start.row][start.col];
    }
  }
  let up = start.row > 0 ? { row: start.row - 1, col: start.col } : null;
  if (up) {
    if (risks[up.row][up.col] + shortestDistances[start.row][start.col] < shortestDistances[up.row][up.col]) {
      shortestDistances[up.row][up.col] = risks[up.row][up.col] + shortestDistances[start.row][start.col];
    }
  }
  let down = start.row < risks.length - 1 ? { row: start.row + 1, col: start.col } : null;
  if (down) {
    if (risks[down.row][down.col] + shortestDistances[start.row][start.col] < shortestDistances[down.row][down.col]) {
      shortestDistances[down.row][down.col] = risks[down.row][down.col] + shortestDistances[start.row][start.col];
    }
  }
  // Find the smallest unvisited node
  let lowestValue = Number.MAX_SAFE_INTEGER;
  let nextNode = { row: null, col: null };
  for (let row = 0; row < shortestDistances.length; ++row) {
    for (let col = 0; col < shortestDistances[0].length; ++col) {
      if (shortestDistances[row][col] === Number.MAX_SAFE_INTEGER) {
        continue; // hasn't been updated, can ignore this node.
      }
      let key = `${row}:${col}`;
      if (visited.has(key)) {
        continue;
      }
      if (shortestDistances[row][col] < lowestValue) {
        lowestValue = shortestDistances[row][col];
        nextNode = { row, col };
      }
    }
  }
  if (lowestValue === Number.MAX_SAFE_INTEGER) {
    return; // done! we've processed all the nodes at this point
  }
  return nextNode;
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
    shortestDistances.push(Array(values.length).fill(Number.MAX_SAFE_INTEGER));
  }
  shortestDistances[0][0] = 0; // set the beginning point to 0 as we start there
  let startingPoint = { row: 0, col: 0 };
  let endingPoint = { row: allRisks.length - 1, col: allRisks[0].length - 1 };
  let visited = new Set();
  let nextNode = findShortestPath(allRisks, startingPoint, endingPoint, shortestDistances, visited);
  while (nextNode) {
    nextNode = findShortestPath(allRisks, nextNode, endingPoint, shortestDistances, visited);
  }
  for (let row = 0; row < shortestDistances.length; ++row) {
    console.log(`${JSON.stringify(shortestDistances[row])}`);
  }
}

processLineByLine()
  .then(result => {
  });
