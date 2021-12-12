// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function findPaths(edges, paths, currentPath = [ 'start' ]) {
  let connections = edges.get(currentPath[currentPath.length - 1]);
  connections.forEach((connection) => {
    if (connection === 'start') {
      // don't go back to start
      return;
    }
    if (connection.toLowerCase() === connection && currentPath.includes(connection)) {
      // small cave, need to skip if already in currentPath
      return;
    }
    if (connection === 'end') {
      // reached the end. 
      paths.push(currentPath.concat('end'));
      return;
    }
    currentPath.push(connection);
    // Depth-First Search (DFS) to get all the routes using recursion
    findPaths(edges, paths, currentPath);
    currentPath.pop();
  });
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let edges = new Map();

  for await (const line of rl) {
    let vertices = line.split('-');
    // add edges for both directions
    if (!edges.has(vertices[0])) {
      edges.set(vertices[0], [ ]);
    }
    if (!edges.has(vertices[1])) {
      edges.set(vertices[1], [ ]);
    }
    edges.get(vertices[0]).push(vertices[1]);
    edges.get(vertices[1]).push(vertices[0]);
  }
  let paths = [ ];
  findPaths(edges, paths);
  console.log(`There are ${paths.length} paths.`);
  for (let i = 0; i < paths.length; ++i) {
    console.log(`${paths[i].join(',')}`);
  }
}

processLineByLine()
  .then(result => {
  });
