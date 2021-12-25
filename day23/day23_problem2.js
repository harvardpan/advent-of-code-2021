// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MinPriorityQueue } = require('@datastructures-js/priority-queue');
const { serialize } = require('v8');

// different types of rooms
// hallways rooms (h1...h11)
// side rooms (a1..a4, b1..b4, ...)
const rooms = {
  h1: { exits: [ 'h2' ], content: null },
  h2: { exits: [ 'h1', 'h3' ], content: null },
  h3: { exits: [ 'h2', 'a1', 'h4' ], content: null },
  h4: { exits: [ 'h3', 'h5' ], content: null },
  h5: { exits: [ 'h4', 'b1', 'h6' ], content: null },
  h6: { exits: [ 'h5', 'h7' ], content: null },
  h7: { exits: [ 'h6' , 'c1', 'h8'], content: null },
  h8: { exits: [ 'h7', 'h9' ], content: null },
  h9: { exits: [ 'h8' , 'd1', 'h10'], content: null },
  h10: { exits: [ 'h9', 'h11' ], content: null },
  h11: { exits: [ 'h10' ], content: null },
  a1: { exits: [ 'h3', 'a2' ], content: null },
  a2: { exits: [ 'a1', 'a3' ], content: null },
  a3: { exits: [ 'a2', 'a4' ], content: null },
  a4: { exits: [ 'a3' ], content: null },
  b1: { exits: [ 'h5', 'b2' ], content: null },
  b2: { exits: [ 'b1', 'b3' ], content: null },
  b3: { exits: [ 'b2', 'b4' ], content: null },
  b4: { exits: [ 'b3' ], content: null },
  c1: { exits: [ 'h7', 'c2' ], content: null },
  c2: { exits: [ 'c1', 'c3' ], content: null },
  c3: { exits: [ 'c2', 'c4' ], content: null },
  c4: { exits: [ 'c3' ], content: null },
  d1: { exits: [ 'h9', 'd2' ], content: null },
  d2: { exits: [ 'd1', 'd3' ], content: null },
  d3: { exits: [ 'd2', 'd4' ], content: null },
  d4: { exits: [ 'd3' ], content: null },
};

const costs = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000
};

function serializeRooms() {
  let positions = Object.keys(rooms).reduce((acc, curr) => {
    if (rooms[curr].content === null) {
      acc.push('.');
      return acc;
    }
    acc.push(rooms[curr].content);
    return acc;
  }, [ ]);
  return positions.join('');
}

function deserializeRooms(state) {
  let positions = state.split('');
  let roomNames = Object.keys(rooms);
  for (let i = 0; i < positions.length; ++i) {
    let content = positions[i] === '.' ? null : positions[i];
    rooms[roomNames[i]].content = content;
  }
}

function findPath(startRoom, endRoom) {
  let shortestPath = [ ];
  let visited = new Set();
  let queue = new MinPriorityQueue();
  queue.enqueue({ 
    path: shortestPath,
    exit: startRoom
  }, 0);
  while (queue.size()) {
    let item = queue.dequeue();
    let room = item.element.exit;
    if (room === endRoom) {
      return { 
        path: item.element.path.slice(1).concat(endRoom), 
        distance: item.priority
      };
    }
    if (visited.has(room)) {
      continue;
    }
    visited.add(room);
    for (let i = 0; i < rooms[room].exits.length; ++i) {
      queue.enqueue({ 
        path: item.element.path.concat(room), 
        exit: rooms[room].exits[i] 
      }, item.priority + 1);
    }
  }
  return null;
}

function isClearPath(startRoom, endRoom) {
  let path = findPath(startRoom, endRoom);
  if (!path) {
    return false;
  }
  for (const room of path.path) {
    if (rooms[room].content !== null) {
      return false;
    }
  }
  return true;
}

function cost(startRoom, endRoom, stepMultiplier) {
  let path = findPath(startRoom, endRoom);
  if (!path) {
    return null;
  }
  return path.distance * stepMultiplier;
}

function getAmphipodSideRoom(amphipod) {
  let firstEmptyRoom = null;
  // something in a hallway room can only move into side room, and only if it only contains only other amphipods of same type
  for (let i = 4; i > 0; --i) {
    let amphipodInRoom = rooms[`${amphipod.toLowerCase()}${i}`].content;
    if (amphipodInRoom === null && firstEmptyRoom === null) {
      firstEmptyRoom = i;
    }
    if (amphipodInRoom !== null && amphipodInRoom !== amphipod) {
      return null; // can't move into the room if there are any amphipods not the same type in there
    }
  }
  // at this point, determined that we can move in to the first empty room, as long as there's nothing
  // blocking our path there.
  return `${amphipod.toLowerCase()}${firstEmptyRoom}`;
}

function possibleMoves(room) {
  if (rooms[room].content === null) {
    return null; // nothing in the room, no possible move here.
  }
  let amphipod = rooms[room].content;
  if (room.startsWith('h')) {
    let nextRoom = getAmphipodSideRoom(amphipod);
    if (!nextRoom) {
      return null;
    }
    if (isClearPath(room, nextRoom)) {
      return [ nextRoom ];
    }
    return null; // no clear path. cannot move.
  }
  // Side rooms left
  let roomIndex = Number.parseInt(room.charAt(1));
  if (rooms[room].content.toLowerCase() === room.charAt(0)) {
    // already in the right side room. need to check if all amphipods below are correct too
    let foundIncorrectAmphipod = false;
    for (let i = roomIndex + 1; i <= 4; ++i) {
      if (rooms[`${room.charAt(0)}${i}`].content !== rooms[room].content) {
        foundIncorrectAmphipod = true;
        break;
      }
    }
    if (!foundIncorrectAmphipod) {
      return null; // already correctly placed, no need to move anywhere.
    }
  }
  let moves = [ ];
  // Amphipod can move into a hallway room or their target side room
  let targetSideRoom = getAmphipodSideRoom(amphipod);
  if (targetSideRoom && isClearPath(room, targetSideRoom)) {
    moves.push(targetSideRoom);
  }
  let possibleHallwayRooms = [ 'h1', 'h2', 'h4', 'h6', 'h8', 'h10', 'h11' ].reduce((acc, curr) => {
    if (!isClearPath(room, curr)) {
      return acc;
    }
    acc.push(curr);
    return acc;
  }, [ ]);
  if (possibleHallwayRooms.length) {
    moves.push(...possibleHallwayRooms);
  }
  if (moves.length === 0) {
    return null;
  }
  return moves;
}

function moveAmphipod(startRoom, targetRoom) {
  rooms[targetRoom].content = rooms[startRoom].content;
  rooms[startRoom].content = null;
}

// All amphipods are in the right place
function done() {
  for (let i = 1; i <= 4; ++i) {
    for (const amphipod of ['A', 'B', 'C', 'D']) {
      if (rooms[`${amphipod.toLowerCase()}${i}`].content !== amphipod) {
        return false;
      }
    }
  }
  return true;
}

function findOptimalSolution() {
  let currentBoardState = serializeRooms();
  let visited = new Set();
  let queue = new MinPriorityQueue();
  queue.enqueue({ 
    board: currentBoardState,
    cost: 0
  }, 0);
  while (queue.size()) {
    let item = queue.dequeue();
    let state = item.element.board;
    if (visited.has(state)) {
      continue;
    }
    visited.add(state);
    deserializeRooms(state);
    if (done()) {
      console.log('Found a solution!');
      return item.element.cost;
    }
    // Calculate all possible moves from this board position
    let allMoves = [ ];
    Object.keys(rooms).forEach((room) => {
      let targetRooms = possibleMoves(room);
      if (!targetRooms) {
        return;
      }
      allMoves.push(...(targetRooms.map((target) => {
        return `${room}:${target}`;
      })));
    });
    for (const move of allMoves) {
      let moveParts = move.split(':');
      let moveCost = cost(moveParts[0], moveParts[1], costs[rooms[moveParts[0]].content]);
      moveAmphipod(moveParts[0], moveParts[1]);
      let newBoardState = serializeRooms();
      moveAmphipod(moveParts[1], moveParts[0]);
      queue.enqueue({ board: newBoardState, cost: item.element.cost + moveCost }, item.element.cost + moveCost);
    }
  }
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'problem2_input.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let roomRegex = /[# ]{2}#([ABCD])#([ABCD])#([ABCD])#([ABCD])#[# ]{0,2}/;
  let roomCounter = 1;
  for await (const line of rl) {
    let found = line.match(roomRegex);
    if (!found) {
      continue;
    }
    rooms[`a${roomCounter}`].content = found[1];
    rooms[`b${roomCounter}`].content = found[2];
    rooms[`c${roomCounter}`].content = found[3];
    rooms[`d${roomCounter}`].content = found[4];
    ++roomCounter;
  }
  let result = findOptimalSolution();
  console.log(`Optimal solution found with cost: ${result}`);
}

processLineByLine()
  .then(result => {
  });
