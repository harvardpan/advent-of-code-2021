// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'directions.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let regex = /^(up|down|forward) (\d+)$/;
  let depth = 0;
  let horizontal = 0;
  for await (const line of rl) {
    let found = line.match(regex);
    if (!found) {
        continue;
    }
    let direction = found[1];
    let units = Number(found[2]);
    switch (direction) {
      case 'up':
        depth -= units;
        break;
      case 'down':
        depth += units;
        break;
      case 'forward':
        horizontal += units;
        break;
    }
  }
  return { depth, horizontal };
}

processLineByLine()
  .then(result => {
    console.log(`Horizontal: ${result.horizontal}, Depth: ${result.depth}. Total: ${result.horizontal * result.depth}.`);
  });
