// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TAKEN = [ '>', 'v', 'o' ];
const HERD_TYPES = [ '>', 'v' ];
function step(seafloor, herdType) {
  let moved = false;
  // > - east moving
  // v - south moving
  // o - previously occupied, will become '.'
  // e - next position for east moving, will become '>'
  // s - next position for south moving, will become 'v'
  for (let row = 0; row < seafloor.length; ++row) {
    for (let col = 0; col < seafloor[0].length; ++col) {
      if (!TAKEN.includes(seafloor[row][col])) {
        continue; // empty space, just proceed!
      }
      let nextRow = row;
      let nextCol = col;
      if (herdType === '>') {
        if (seafloor[row][col] !== '>') {
          continue;
        }
        nextCol = col === seafloor[0].length - 1 ? 0 : col + 1;
      }      
      else if (herdType === 'v') {
        if (seafloor[row][col] !== 'v') {
          continue;
        }
        nextRow = row === seafloor.length - 1 ? 0 : row + 1;
      }
      // at this point, we have the right sea cucumber
      if (TAKEN.includes(seafloor[nextRow][nextCol])) {
        // space already occupied, stay put
        continue;
      }
      // At this point, we know we can move it to the next space
      seafloor[row][col] = 'o';
      seafloor[nextRow][nextCol] = herdType === '>' ? 'e' : 's';
      moved = true;
    }
  }
  for (let row = 0; row < seafloor.length; ++row) {
    for (let col = 0; col < seafloor[0].length; ++col) {
      if (seafloor[row][col] === 'o') {
        seafloor[row][col] = '.';
      }
      else if (seafloor[row][col] === 'e') {
        seafloor[row][col] = '>';
      }
      else if (seafloor[row][col] === 's') {
        seafloor[row][col] = 'v';
      }
    }
  }
  return moved; // whether we moved any or not
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let seafloor = [ ];
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) {
    let row = line.split('');
    seafloor.push(row);
  }
  let steps = 0;
  let move = true;
  while (move) {
    let numMoves = 0;
    numMoves += step(seafloor, HERD_TYPES[steps++ % 2]);
    numMoves += step(seafloor, HERD_TYPES[steps++ % 2]);
    console.log(`After ${(steps / 2)} step(s):`);
    for (let row = 0; row < seafloor.length; ++row) {
        console.log(`${seafloor[row].join('')}`);
    }
    console.log(''); // extra newline
    if (numMoves === 0) {
      console.log(`Finished after ${Math.floor(steps / 2)} steps.`);
      break;
    }
  }
}

processLineByLine()
  .then(result => {
  });
