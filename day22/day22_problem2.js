// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function getOverlapAxis(a, b, axis) {
  let axisObj = { };
  if (a[axis].low <= b[axis].low && a[axis].high >= b[axis].high) {
    // b[axis] is fully contained in a[axis]
    axisObj.low = b[axis].low;
    axisObj.high = b[axis].high;
    axisObj.span = Math.abs(b[axis].high - b[axis].low) + 1;
  }
  else if (b[axis].low <= a[axis].low && b[axis].high >= a[axis].high) {
    // a[axis] is fully contained in b[axis]
    axisObj.low = a[axis].low;
    axisObj.high = a[axis].high;
    axisObj.span = Math.abs(a[axis].high - a[axis].low) + 1;
  }
  else if (a[axis].low <= b[axis].low && a[axis].high >= b[axis].low && b[axis].high >= a[axis].high) {
    // a[axis] overlaps b[axis], with a before b
    axisObj.low = b[axis].low;
    axisObj.high = a[axis].high;
    axisObj.span = Math.abs(a[axis].high - b[axis].low) + 1;
  }
  else if (b[axis].low <= a[axis].low && b[axis].high >= a[axis].low && a[axis].high >= b[axis].high) {
    // a[axis] overlaps b[axis], with b before a
    axisObj.low = a[axis].low;
    axisObj.high = b[axis].high;
    axisObj.span = Math.abs(b[axis].high - a[axis].low) + 1;
  }
  else {
    return null; // no overlap at all in one dimension means no overlap overall
  }
  return axisObj;
}

function getOverlap(a, b) {
  let overlap = { };
  overlap.x = getOverlapAxis(a, b, 'x');
  overlap.y = getOverlapAxis(a, b, 'y');
  overlap.z = getOverlapAxis(a, b, 'z');
  if (!overlap.x || !overlap.y || !overlap.z) {
    return null;
  }
  return overlap;
}

function getNonOverlaps(a, b) {
  let overlap = getOverlap(a, b);
  if (overlap === null) {
    return null; // since they don't overlap, nothing new to create
  }
  // Can build up to 6 additional instructions. "a" is the current instruction that we'll be splitting up.
  let replacementInstructions = [ ];
  if (a.x.low < overlap.x.low) {
    replacementInstructions.push({
      command: a.command,
      x: {
        low: a.x.low,
        high: overlap.x.low - 1,
        span: Math.abs(overlap.x.low - 1 - a.x.low) + 1
      },
      y: a.y,
      z: a.z
    });
  }
  if (a.x.high > overlap.x.high) {
    replacementInstructions.push({
      command: a.command,
      x: {
        low: overlap.x.high + 1,
        high: a.x.high,
        span: Math.abs(a.x.high - overlap.x.high - 1) + 1
      },
      y: a.y,
      z: a.z
    });
  }
  if (a.y.low < overlap.y.low) {
    replacementInstructions.push({
      command: a.command,
      x: overlap.x,
      y: {
        low: a.y.low,
        high: overlap.y.low - 1,
        span: Math.abs(overlap.y.low - 1 - a.y.low) + 1
      },
      z: a.z
    });
  }
  if (a.y.high > overlap.y.high) {
    replacementInstructions.push({
      command: a.command,
      x: overlap.x,
      y: {
        low: overlap.y.high + 1,
        high: a.y.high,
        span: Math.abs(a.y.high - overlap.y.high - 1) + 1
      },
      z: a.z
    });
  }
  if (a.z.low < overlap.z.low) {
    replacementInstructions.push({
      command: a.command,
      x: overlap.x,
      y: overlap.y,
      z: {
        low: a.z.low,
        high: overlap.z.low - 1,
        span: Math.abs(overlap.z.low - 1 - a.z.low) + 1
      }
    });
  }
  if (a.z.high > overlap.z.high) {
    replacementInstructions.push({
      command: a.command,
      x: overlap.x,
      y: overlap.y,
      z: {
        low: overlap.z.high + 1,
        high: a.z.high,
        span: Math.abs(a.z.high - overlap.z.high - 1) + 1
      }
    });
  }
  return replacementInstructions;
}

function processInstruction(instruction) {
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
  let instructions = [ ];
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
    let instruction = {
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
    if (instruction.command === 'on') {
      let pendingInstructions = [ instruction ];
      while (pendingInstructions.length) {
        let pendingInstruction = pendingInstructions.shift();
        let changedInstruction = false;
        for (let i = 0; i < instructions.length; ++i) {
          let replacementInstructions = getNonOverlaps(pendingInstruction, instructions[i]);
          if (!replacementInstructions) {
            // no overlaps - can just add directly
            continue;
          }
          changedInstruction = true;
          pendingInstructions.push(...replacementInstructions);
          break;
        }
        if (!changedInstruction) {
          // Only add instructions that have no overlaps
          instructions.push(pendingInstruction);
          console.log(`Instruction: ${JSON.stringify(pendingInstruction, null, 2)}`);
        }
      }
    }
    else if (instruction.command === 'off') {
      let newInstructions = [ ];
      for (let i = 0; i < instructions.length; ++i) {
        let replacementInstructions = getNonOverlaps(instructions[i], instruction);
        if (!replacementInstructions) {
          // no overlaps - can just add directly
          newInstructions.push(instructions[i]);
          continue;
        }
        instructions.push(...replacementInstructions);
      }
      instructions = newInstructions;
    }
  }
  // To see how many are on, we just add up their dimensions
  let onCubes = instructions.reduce((acc, curr) => {
    return acc + curr.x.span * curr.y.span * curr.z.span;
  }, 0)
  console.log(`Total Cubes On: ${onCubes}`);
}

processLineByLine()
  .then(result => {
  });
