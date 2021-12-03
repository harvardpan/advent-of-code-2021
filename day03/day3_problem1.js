// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let numBits = 12;

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'power_readings.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let frequency = Array(numBits).fill(0);
  for await (const line of rl) {
    for (let position = 0; position < numBits; ++position) {
      if (line.charAt(position) === '1') {
        frequency[position] += 1;
      }
      else {
        frequency[position] -= 1;
      }
    }
  }
  // Now build up gamma and epsilon
  let gamma = 0;
  let epsilon = 0;
  for (let position = 0; position < numBits; ++position) {
    let gammaMask = frequency[position] > 0 ? 1 : 0;
    let epsilonMask = gammaMask === 1 ? 0 : 1;
    gamma = gamma << 1;
    gamma = gamma | gammaMask;
    epsilon = epsilon << 1;
    epsilon = epsilon | epsilonMask;
  }
  return { gamma, epsilon };
}

processLineByLine()
  .then(result => {
    console.log(`Gamma: ${result.gamma} (${result.gamma.toString(2).padStart(numBits, '0')}), Epsilon: ${result.epsilon} (${result.epsilon.toString(2).padStart(numBits, '0')}), Power: ${result.gamma * result.epsilon}`);
  });
