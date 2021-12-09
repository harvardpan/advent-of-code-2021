// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function findBasin(data, row, col, basin = new Array(), visited = new Set()) {
  let visitedKey = `${row}:${col}`;
  visited.add(visitedKey); // ensure we don't visit this node again.

  let currentValue = data[row][col];
  if (currentValue === 9) {
    return null; // 9 is not part of any basin
  }
  // Add the current item to the basin
  basin.push({ row: row, col: col, value: currentValue });

  let up = row === 0 ? null : { row: row - 1, column: col };
  let down = row === data.length - 1 ? null : { row: row + 1, column: col };
  let left = col === 0 ? null : { row: row, column: col - 1 };
  let right = col === data[0].length - 1 ? null : { row: row, column: col + 1 };
  if (up) {
    let key = `${up.row}:${up.column}`;
    if (!visited.has(key)) {
      findBasin(data, up.row, up.column, basin, visited);
    }
  }
  if (down) {
    let key = `${down.row}:${down.column}`;
    if (!visited.has(key)) {
      findBasin(data, down.row, down.column, basin, visited);
    }
  }
  if (left) {
    let key = `${left.row}:${left.column}`;
    if (!visited.has(key)) {
      findBasin(data, left.row, left.column, basin, visited);
    }
  }
  if (right) {
    let key = `${right.row}:${right.column}`;
    if (!visited.has(key)) {
      findBasin(data, right.row, right.column, basin, visited);
    }
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
  let lineLength = 0;
  let lines = [ ];
  for await (const line of rl) {
    if (!lineLength) {
      lineLength = line.length;
    }
    lines.push(line.split('').map(x => Number.parseInt(x)));
  }
  let basinSizes = [ ];
  let visited = new Set();
  let basin = new Array();
  for (let row = 0; row < lines.length; ++row) {
    for (let col = 0; col < lineLength; ++col) {
      let key = `${row}:${col}`;
      if (!visited.has(key)) {
        findBasin(lines, row, col, basin, visited);
        if (basin.length) {
          basinSizes.push(basin.length);
        }
        // Reset
        basin = new Array();
      }
    }
  }
  return basinSizes.sort(function(a, b) { return b - a; }).slice(0, 3);
}

processLineByLine()
  .then(result => {
    console.log(`Largest 3 Basins: ${JSON.stringify(result)}`);
    console.log(`Multiplied: ${result.reduce((acc, curr) => {
      return acc * curr;
    }, 1)}`);
  });
