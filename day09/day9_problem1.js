// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function isLowPoint(data, rowNumber, colNumber) {
  let totalRows = data.length;
  let totalColumns = data[0].length;
  let up = rowNumber === 0 ? null : { row: rowNumber - 1, column: colNumber };
  let down = rowNumber === totalRows - 1 ? null : { row: rowNumber + 1, column: colNumber };
  let left = colNumber === 0 ? null : { row: rowNumber, column: colNumber - 1 };
  let right = colNumber === totalColumns - 1 ? null : { row: rowNumber, column: colNumber + 1 };
  if (up && data[up.row][up.column] <= data[rowNumber][colNumber]) {
    return false;
  }
  if (down && data[down.row][down.column] <= data[rowNumber][colNumber]) {
    return false;
  }
  if (left && data[left.row][left.column] <= data[rowNumber][colNumber]) {
    return false;
  }
  if (right && data[right.row][right.column] <= data[rowNumber][colNumber]) {
    return false;
  }
  return true;
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
  let riskLevel = 0;
  for (let row = 0; row < lines.length; ++row) {
    for (let col = 0; col < lineLength; ++col) {
      if (isLowPoint(lines, row, col)) {
        riskLevel += (1 + lines[row][col]);
      }
    }
  }
  return riskLevel;
}

processLineByLine()
  .then(result => {
    console.log(`Risk Level: ${result}`);
  });
