// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function flash(lines, row, col, visited) {
  if (lines[row][col] === -1) {
    // already flashed!
    return 0;
  }
  lines[row][col] = -1; // flash the current entry.
  let totalFlashes = 1;
  for (let y = row - 1; y <= row + 1; ++y) {
    if (y < 0 || y >= lines.length) {
      continue;
    }
    for (let x = col - 1; x <= col + 1; ++x) {
      if (x < 0 || x >= lines[0].length || (y === row && x === col)) {
        continue;
      }
      if (lines[y][x] === -1) {
        continue; // already flashed this round. mini-optimization
      }
      lines[y][x] += 1;
      if (lines[y][x] > 9) {
        // recursion!
        totalFlashes += flash(lines, y, x, visited);
      }
    }
  }
  return totalFlashes;
}

function processStep(lines) {
  // first, increase everything by 1.
  for (let row = 0; row < lines.length; ++row) {
    for (let col = 0; col < lines[0].length; ++col) {
      lines[row][col] += 1;
    }
  }
  let totalFlashes = 0;
  let visited = new Set();
  for (let row = 0; row < lines.length; ++row) {
    for (let col = 0; col < lines[0].length; ++col) {
      if (lines[row][col] > 9) {
        let visitedKey = `${row}:${col}`;
        if (visited.has(visitedKey)) {
          continue;
        }
        visited.add(visitedKey);
        totalFlashes += flash(lines, row, col, visited);
      }
    }
  }
  let hasNonFlash = false;
  // Post flashes, change all flashed entries to 0
  for (let row = 0; row < lines.length; ++row) {
    for (let col = 0; col < lines[0].length; ++col) {
      if (lines[row][col] === -1) {
        lines[row][col] = 0;
      }
      else {
        hasNonFlash = true;
      }
    }
  }
  if (!hasNonFlash) {
    throw new Error('synchronized!');
  }
  return totalFlashes;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let lines = [ ];
  for await (const line of rl) {
    lines.push(line.split('').map(x => Number.parseInt(x)));
  }
  let totalFlashes = 0;
  let numSteps = 1000;
  for (let i = 0; i < numSteps; ++i) {
    try {
      totalFlashes += processStep(lines);
    }
    catch (err) {
      console.log(`Fully synchronized at Step ${i + 1}`);
      return;
    }
    console.log(`After step ${i + 1}:`);
    for (let row = 0; row < lines.length; ++row) {
      console.log(lines[row].join(''));
    }
    console.log('');
  }
  console.log(`There have been a total of ${totalFlashes} flashes.`);
}

processLineByLine()
  .then(result => {
  });
