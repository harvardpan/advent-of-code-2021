// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function foldPaper(points, fold) {
  if (fold.axis === 'y') {
    for (let i = 0; i < points.length; ++i) {
      if (points[i].y < fold.value) {
        continue;
      }
      points[i].y = (2 * fold.value) - points[i].y;
    }
  }
  else if (fold.axis === 'x') {
    for (let i = 0; i < points.length; ++i) {
      if (points[i].x < fold.value) {
        continue;
      }
      points[i].x = (2 * fold.value) - points[i].x;
    }
  }
}

function printPoints(points, gridDimensions) {
  let ascii = [ ];
  for (let row = 0; row < gridDimensions.y; ++row) {
    ascii.push(Array(gridDimensions.x).fill(' '));
  }
  for (let i = 0; i < points.length; ++i) {
    ascii[points[i].y][points[i].x] = '#';
  }
  for (let row = 0; row < ascii.length; ++row) {
    console.log(`${ascii[row].join('')}`);
  }
}

let foldRegex = /fold along ([xy])=(\d+)/;
async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let edges = new Map();

  let gridDimensions = { x: 0, y: 0 };
  let points = [ ];
  let folds = [ ];
  for await (const line of rl) {
    let found = line.match(foldRegex);
    if (found) {
      folds.push({ axis: found[1], value: Number.parseInt(found[2]) });
      continue;
    }
    let coordinates = line.split(',');
    if (coordinates.length !== 2) {
      continue;
    }
    let x = Number.parseInt(coordinates[0]);
    let y = Number.parseInt(coordinates[1]);
    points.push({ x, y });
    gridDimensions.x = Math.max(gridDimensions.x, x);
    gridDimensions.y = Math.max(gridDimensions.y, y);
  }
  // Keep track of maximum grid
  for (let i = 0; i < folds.length; ++i) {
    foldPaper(points, folds[i]);
    gridDimensions[folds[i].axis] = folds[i].value;
  }
  // Now deduplicate them
  let exists = new Set();
  points = points.reduce((acc, curr) => {
    let key = `${curr.x}:${curr.y}`;
    if (exists.has(key)) {
      return acc;
    }
    exists.add(key);
    acc.push(curr);
    return acc;
  }, [ ]);
  printPoints(points, gridDimensions);
}

processLineByLine()
  .then(result => {
  });
