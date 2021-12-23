// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function processInstruction(instruction, space) {
  for (let x = instruction.x.low; x <= instruction.x.high; ++x) {
    if (x < -50 || x > 50) {
      continue;
    }
    for (let y = instruction.y.low; y <= instruction.y.high; ++y) {
      if (y < -50 || y > 50) {
        continue;
      }
      for (let z = instruction.z.low; z <= instruction.z.high; ++z) {
        if (z < -50 || z > 50) {
          continue;
        }
        space[x + 50][y + 50][z + 50] = instruction.command === 'on' ? true : false;
      }
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
  // create a 100x100x100 array to store all the possible points.
  let space = [ ];
  for (let x = 0; x < 101; x++) {
    let xArray = [ ];
    space.push(xArray);
    for (let y = 0; y < 101; y++) {
      let yArray = Array(101).fill(false);
      xArray.push(yArray);
    }
  }
  let inputRegex = /(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/;
  for await (const line of rl) {
    let found = line.match(inputRegex);
    if (!found) {
      continue;
    }
    let command = found[1];
    let x1 = Number.parseInt(found[2]);
    let x2 = Number.parseInt(found[3]);
    let y1 = Number.parseInt(found[4]);
    let y2 = Number.parseInt(found[5]);
    let z1 = Number.parseInt(found[6]);
    let z2 = Number.parseInt(found[7]);
    let entry = {
      command,
      x: {
        low: x1,
        high: x2,
        span: Math.abs(x2 - x1) + 1
      },
      y: {
        low: y1,
        high: y2,
        span: Math.abs(y2 - y1) + 1
      },
      z: {
        low: z1,
        high: z2,
        span: Math.abs(z2 - z1) + 1
      }
    }
    processInstruction(entry, space);
  }
  let onNodes = 0;
  for (let x = 0; x < 101; x++) {
    for (let y = 0; y < 101; y++) {
      for (let z = 0; z < 101; z++) {
        if (space[x][y][z]) {
          onNodes++;
        }
      }
    }
  }
  console.log(`There are ${onNodes} cubes on.`);
}

processLineByLine()
  .then(result => {
  });
