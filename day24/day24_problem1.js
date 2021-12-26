// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const registerKeys = [ 'w', 'x', 'y', 'z' ];
function processInstruction(instruction, registers, inputArray) {
  let targetRegister = instruction.arguments[0];
  let secondArgumentValue = instruction.arguments[1];
  if (registerKeys.includes(secondArgumentValue)) {
      // second argument can be an number or a register
      secondArgumentValue = registers[secondArgumentValue];
  }
  else {
    secondArgumentValue = Number.parseInt(secondArgumentValue);
  }
  switch (instruction.operation) {
    case 'inp':
      registers[targetRegister] = inputArray.shift();
      break;

    case 'add':
      registers[targetRegister] += secondArgumentValue;
      break;

    case 'mul':
      registers[targetRegister] *= secondArgumentValue;
      break;

    case 'div':
      registers[targetRegister] = Math.floor(registers[targetRegister] / secondArgumentValue);
      break;

    case 'mod':
      registers[targetRegister] %= secondArgumentValue;
      break;

    case 'eql':
      registers[targetRegister] = registers[targetRegister] === secondArgumentValue ? 1 : 0;
      break;
    
    default:
      throw new Error('boom!');
  }
  console.log(`Processing ${instruction.operation} ${instruction.arguments.join(' ')}`);
  console.log(`Registers: ${JSON.stringify(registers)}`);
}

function processInstructions(instructions, inputArray) {
  let registers = {
    w: 0,
    x: 0,
    y: 0,
    z: 0
  };
  let inputIndex = 1;
  for (let i = 0; i < instructions.length; ++i) {
    if (instructions[i].operation === 'inp') {
      console.log(`\nProcessing Input ${inputIndex++}\n`);
    }
    processInstruction(instructions[i], registers, inputArray);
  }
  return registers;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let instructions = [ ];
  for await (const line of rl) {
    let instruction = {
      operation: null,
      arguments: [ ]
    };
    let parts = line.split(' ');
    if (parts.length < 2) {
      continue; // invalid
    }
    instruction.operation = parts[0];
    instruction.arguments.push(...parts.slice(1));
    instructions.push(instruction);
  }
  // Key Insight is that there are 7 increases and 7 potential decreases that very much depend on
  // the values of the "X" and "Y" values.
  // When mod x 26 is followed by add x <negative>, it ends up reducing the originally added values.
  // the modulo that's left over is the amount added in the previous "increase" instruction
  let modelNumber = Array(14).fill(null);
  let stack = [ ];
  for (let i = 0; i < 14; ++i) {
    let increaseOrDecreaseInstruction = Number.parseInt(instructions[i * 18 + 4].arguments[1]);
    let xIncreaseOrDecrease = Number.parseInt(instructions[i * 18 + 5].arguments[1]);
    let yIncrease = Number.parseInt(instructions[i * 18 + 15].arguments[1]);
    if (increaseOrDecreaseInstruction === 1) { // this is an increase
      stack.push({ z: increaseOrDecreaseInstruction, x: xIncreaseOrDecrease, y: yIncrease, index: i });
    }
    else { // this is a decrease
       let matchingInstruction = stack.pop();
       modelNumber[matchingInstruction.index] = 9 - matchingInstruction.y - xIncreaseOrDecrease; // maximize this number
       if (modelNumber[matchingInstruction.index] > 9) {
         modelNumber[matchingInstruction.index] = 9;
       }
       modelNumber[i] = modelNumber[matchingInstruction.index] + matchingInstruction.y + xIncreaseOrDecrease;
    }
  }
  console.log(`Maximum model number: ${modelNumber.join('')}`);
  
  // Verify the final number
  let inputArray = modelNumber;
  let registers = processInstructions(instructions, inputArray);
  console.log(`Final registers: ${JSON.stringify(registers, null, 2)}`);
}

processLineByLine()
  .then(result => {
  });
