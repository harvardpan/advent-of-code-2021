// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

function rotationFunctions() {
  let functions = [ ];

  let axisPermutations = [
    (p) => { return { x: p.x, y: p.y, z: p.z }; },
    (p) => { return { x: p.x, y: p.z, z: p.y }; },
    (p) => { return { x: p.y, y: p.x, z: p.z }; },
    (p) => { return { x: p.y, y: p.z, z: p.x }; },
    (p) => { return { x: p.z, y: p.x, z: p.y }; },
    (p) => { return { x: p.z, y: p.y, z: p.x }; },
  ];
  let directionPermutations = [
    (p) => { return { x: p.x, y: p.y, z: p.z }; },
    (p) => { return { x: p.x, y: -p.y, z: p.z }; },
    (p) => { return { x: p.x, y: p.y, z: -p.z }; },
    (p) => { return { x: p.x, y: -p.y, z: -p.z }; },
    (p) => { return { x: -p.x, y: p.y, z: p.z }; },
    (p) => { return { x: -p.x, y: -p.y, z: p.z }; },
    (p) => { return { x: -p.x, y: p.y, z: -p.z }; },
    (p) => { return { x: -p.x, y: -p.y, z: -p.z }; },
  ];
  for (let i = 0; i < axisPermutations.length; ++i) {
    for (let j = 0; j < directionPermutations.length; ++j) {
      functions.push(p => {
        return directionPermutations[j](axisPermutations[i](p));
      });
    }
  }
  return functions;
}

function rotations(beacons) {
  let rotations = [ ];
  let functions = rotationFunctions();
  for (let i = 0; i < functions.length; ++i) {
    rotations.push(beacons.map(functions[i]));  
  }
  return rotations;
}

function findRotation(baseBeacons, beacons) {
  let allRotations = rotations(beacons);
  let functions = rotationFunctions();
  for (let r = 0; r < allRotations.length; ++r) {
    let firstRotation = {
      x: baseBeacons[0].x - allRotations[r][0].x,
      y: baseBeacons[0].y - allRotations[r][0].y,
      z: baseBeacons[0].z - allRotations[r][0].z
    };
    let badRotation = false;
    for (let i = 1; i < baseBeacons.length; ++i) {
      let rotation = {
        x: baseBeacons[i].x - allRotations[r][i].x,
        y: baseBeacons[i].y - allRotations[r][i].y,
        z: baseBeacons[i].z - allRotations[r][i].z
      };
      if (rotation.x !== firstRotation.x || rotation.y !== firstRotation.y || rotation.z !== firstRotation.z) {
        badRotation = true;
        break;
      }
    }
    if (!badRotation) {
      // found it!
      console.log(`${JSON.stringify(firstRotation, null, 2)}`);
      return {
        scanner: firstRotation,
        rotation: functions[r]
      };
    }
  }
}      

function rotateBeacons(beacons, rotation) {
  let rotatedBeacons = [ ];
  for (let i = 0; i < beacons.length; ++i) {
    let rotatedBeacon = rotation.rotation(beacons[i]);
    rotatedBeacon.x += rotation.scanner.x;
    rotatedBeacon.y += rotation.scanner.y;
    rotatedBeacon.z += rotation.scanner.z;
    rotatedBeacons.push(rotatedBeacon);
  }
  return rotatedBeacons;
}

function allDistances(beacons) {
  let distances = [ ];
  for (let i = 0; i < beacons.length; ++i) {
    distances[i] = [ ];
    for (let j = 0; j < beacons.length; ++j) {
      if (i === j) {
        distances[i].push(0);
        continue;
      }
      distances[i].push(distance(beacons[i], beacons[j]));
    }
  }
  return distances;
}

function findOverlappingDistances(a, b) {
  let matchingBeacons = new Map();
  for (let i = 0; i < a.length; ++i) {
    for (let j = 0; j < b.length; ++j) {
      let intersection = a[i].filter(x => b[j].includes(x));
      if (intersection.length >= 12) {
        // first match is from i => j
        matchingBeacons.set(i, j);
        for (let k = 0; k < intersection.length; ++k) {
          if (intersection[k] === 0) {
            continue;
          }
          let iIndex = a[i].indexOf(intersection[k]);
          let jIndex = b[j].indexOf(intersection[k]);
          matchingBeacons.set(iIndex, jIndex);
        }
        return matchingBeacons;
      }
    }
  }
  return matchingBeacons;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let scanners = [ ];
  let currentScanner = null;
  let currentBeacons = null;
  for await (const line of rl) {
    if (line.trim().length === 0) {
      continue; // don't bother with blank lines
    }
    let found = line.match(/--- scanner (\d+) ---/);
    if (found) {
      currentScanner = found[1];
      if (currentBeacons) {
        scanners.push(currentBeacons);
      }
      currentBeacons = [ ];
      continue;
    }
    found = line.match(/(-?\d+),(-?\d+),(-?\d+)/);
    if (found) {
      currentBeacons.push({ x: Number.parseInt(found[1]), y: Number.parseInt(found[2]), z: Number.parseInt(found[3]) });
    }
  }
  // Process the last scanner
  if (currentBeacons) {
    scanners.push(currentBeacons);
  }
  let finishedScanners = new Set();
  finishedScanners.add(0); // the scanner 0 is the reference scanner
  let unfinishedScanners = new Set();
  let beaconDistances = [ ];
  let scannerLocations = [ ];
  for (let i = 0; i < scanners.length; ++i) {
    beaconDistances.push(allDistances(scanners[i]));
    if (i !== 0) {
      unfinishedScanners.add(i);
      scannerLocations.push(null);
    }
    else {
      scannerLocations.push({ x: 0, y: 0, z: 0 });
    }
  }
  while (unfinishedScanners.size > 0) {
    for (let j of unfinishedScanners) {
      for (let i of finishedScanners) {
        let overlaps = findOverlappingDistances(beaconDistances[i], beaconDistances[j]);
        console.log(`Scanner ${i} => Scanner ${j}`);
        if (overlaps.size === 0) {
          console.log(`Not enough overlaps`);
          continue;
        }
        let iMatches = [ ];
        let jMatches = [ ];
        for (let [iIndex, jIndex] of overlaps.entries()) {
          console.log(`${JSON.stringify(scanners[i][iIndex])} => ${JSON.stringify(scanners[j][jIndex])}`);
          iMatches.push(scanners[i][iIndex]);
          jMatches.push(scanners[j][jIndex]);
        }
        let rotation = findRotation(iMatches, jMatches); 
        scanners[j] = rotateBeacons(scanners[j], rotation);
        scannerLocations[j] = rotation.scanner;
        finishedScanners.add(j); // add to the finished
        unfinishedScanners.delete(j); // don't re-process again
        break;
      }
      if (!unfinishedScanners.has(j)) {
        break; // break out of this for-loop and back to the while
      }
    }
  }
  let maximumDistance = Number.MIN_SAFE_INTEGER;
  // Calculate the maximum Manhattan distances
  for (let i = 0; i < scannerLocations.length; ++i) {
    for (let j = 0; j < scannerLocations.length; ++j) {
      if (i >= j) {
        continue;
      }
      let distance = Math.abs(scannerLocations[i].x - scannerLocations[j].x) + Math.abs(scannerLocations[i].y - scannerLocations[j].y) + Math.abs(scannerLocations[i].z - scannerLocations[j].z);
      if (distance > maximumDistance) {
        maximumDistance = distance;
      }
    }
  }
  console.log(`Maximum Manhattan Distance is ${maximumDistance}`);
}

processLineByLine()
  .then(result => {
  });
