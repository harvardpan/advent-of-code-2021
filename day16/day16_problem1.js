// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function processNextPacket(binary, adjustForHex = true) {
  let bitCount = 0;
  let version = Number.parseInt(binary.splice(0, 3).join(''), 2);
  bitCount += 3;
  let type = Number.parseInt(binary.splice(0, 3).join(''), 2);
  bitCount += 3;
  if (type === 4) {
    let literal = [ ];
    // literal - each group of 5 bits. leading bit 0 means last packet
    let lastPacket = false;
    while (lastPacket === false) {
      let leadBit = binary.shift();
      bitCount += 1;
      literal.push(...binary.splice(0, 4));
      bitCount += 4;
      if (leadBit === '0') {
        lastPacket = true;
      }
    }
    let final = Number.parseInt(literal.join(''), 2);
    console.log(`Literal value of ${final}`);
    if (adjustForHex) {
      // Need to shift the remaining bits for the hexadecimal
      let remainingBits = 4 - bitCount % 4;
      binary.splice(0, remainingBits);
      bitCount += remainingBits;
    }
    return { 
      version,
      type,
      bitCount,
      value: final
    };
  }
  else {
    // Operator type - has sub-packets
    let subpackets = [ ];
    let lengthType = binary.shift();
    bitCount += 1;
    if (lengthType === '0') {
      let totalLength = Number.parseInt(binary.splice(0, 15).join(''), 2);
      bitCount += 15;
      while (totalLength > 0) {
        let result = processNextPacket(binary, false /* don't adjust for hex */);
        subpackets.push(result);
        bitCount += result.bitCount;
        totalLength -= result.bitCount;
      }
    }
    else if (lengthType === '1') {
      let numberOfSubpackets = Number.parseInt(binary.splice(0, 11).join(''), 2);
      bitCount += 11;
      for (let i = 0; i < numberOfSubpackets; ++i) {
        let result = processNextPacket(binary, false /* don't adjust for hex */);
        bitCount += result.bitCount;
        subpackets.push(result);
      }
    }
    return {
      version,
      type,
      bitCount,
      subpackets
    };
  }
}

function calculateVersionSum(results) {
  let sum = results.version;
  if (results.subpackets && results.subpackets.length) {
    sum = results.subpackets.reduce((acc, curr) => {
      return acc + calculateVersionSum(curr);
    }, sum);
  }
  return sum;
}

function processPackets(input) {
  // first, convert the entire input from hex to binary
  let binary = input.split('').reduce((acc, curr) => {
    let binaryString = Number.parseInt(curr, 16).toString(2).padStart(4, '0');
    acc.push(...binaryString.split(''));
    return acc;
  }, [ ]);
  console.log(`${input} becomes ${binary.join('')}`);
  while (binary.length && binary.find(x => x === '1')) {
    let results = processNextPacket(binary);
    console.log(JSON.stringify(results, null, 2));
    let versionSum = calculateVersionSum(results);
    console.log(`Version Sum: ${versionSum}`);
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
  for await (const line of rl) {
    processPackets(line);
  }
}

processLineByLine()
  .then(result => {
  });
