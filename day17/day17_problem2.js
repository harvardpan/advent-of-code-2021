// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function step(position, velocity) {
  position.x += velocity.x;
  position.y += velocity.y;
  if (velocity.x > 0) {
    velocity.x -= 1;
  }
  else if (velocity.x < 0) {
    velocity.x += 1;
  }
  velocity.y -= 1; // gravity
}

function quadraticRoot(x) {
  let a = 1;
  let b = 1;
  let c = x * (-2); // based on n * (n + 1) / 2. need to multiply by -2.
  // calculate discriminant
  let discriminant = b * b - 4 * a * c;

  if (discriminant > 0) {
      root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      root2 = (-b - Math.sqrt(discriminant)) / (2 * a);

      return Math.max(root1, root2);
  }  
  return undefined;
}

function isPositionInTargetArea(position, topLeft, bottomRight) {
  if (position.x >= topLeft.x && position.x <= bottomRight.x
      && position.y <= topLeft.y && position.y >= bottomRight.y) {
    return true;
  }
  return false;
}

function cannotReachTargetArea(position, velocity, topLeft, bottomRight) {
  if (isPositionInTargetArea(position, topLeft, bottomRight)) {
    return false; // already reached!
  }
  // check if target X range is between starting point and position.x
  if (Math.abs(position.x) > Math.abs(topLeft.x) && Math.abs(position.x) > Math.abs(bottomRight.x)) {
    return true;
  }
  // check if target Y range is above position.y and velocity is negative
  if (velocity.y < 0 && position.y < topLeft.y && position.y < bottomRight.y) {
    return true;
  }
  return false;
}

function findAllVelocities(topLeft, bottomRight) {
  let lowX = Math.ceil(quadraticRoot(topLeft.x));
  let highX = bottomRight.x; // can straight shot it there in one step
  let lowY = bottomRight.y;
  let highY = Math.abs(bottomRight.y);
  let velocities = [ ];
  for (let x = lowX; x <= highX; ++x) {
    for (let y = lowY; y <= highY; ++y) {
      let velocity = { x: x, y: y };
      let originalVelocity = { ...velocity };
      let result = testVelocity(velocity, topLeft, bottomRight);
      if (result.result === 'cannot reach target area') {
        continue;
      }
      velocities.push(originalVelocity);
    }
  }
  console.log(`There are ${velocities.length} different initial velocities.`);
}

function testVelocity(velocity, topLeft, bottomRight) {
  let originalVelocity = { ...velocity };
  console.log(`Testing velocity: ${JSON.stringify(velocity)}`);
  let position = { x: 0, y: 0 }; // default starting position
  let currentStep = 1;
  let highestPosition = { x: 0, y: 0 };
  while (true) {
    step(position, velocity);
    // console.log(`After step ${currentStep++}, Position: ${JSON.stringify(position)}, Velocity: ${JSON.stringify(velocity)}`);
    if (position.y > highestPosition.y) {
      highestPosition = { ...position };
    }
    if (isPositionInTargetArea(position, topLeft, bottomRight)) {
      return {
        position,
        velocity: originalVelocity,
        steps: currentStep - 1,
        highest: highestPosition,
        result: 'reached target area'
      };
    }
    if (cannotReachTargetArea(position, velocity, topLeft, bottomRight)) {
      return {
        position,
        velocity: originalVelocity,
        steps: currentStep - 1,
        highest: highestPosition,
        result: 'cannot reach target area'
      }
    }
  }
}

let inputRegex = /target area: x=(-?\d+)\.\.(-?\d+), y=(-?\d+)\.\.(-?\d+)/;
async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  for await (const line of rl) {
    let found = line.match(inputRegex);
    if (!found) {
      continue;
    }
    let x1 = Number.parseInt(found[1]);
    let x2 = Number.parseInt(found[2]);
    let y1 = Number.parseInt(found[3]);
    let y2 = Number.parseInt(found[4]);
    let topLeft = { x: Math.min(x1, x2), y: Math.max(y1, y2) };
    let bottomRight = { x: Math.max(x1, x2), y: Math.min(y1, y2) };
    findAllVelocities(topLeft, bottomRight);
  }
}

processLineByLine()
  .then(result => {
  });
