// Read File line-by-line taken from StackOverflow
// https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let rowRegex = /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;

class BingoBoard {
  constructor() {
    this.board = Array(5).fill().map(row => { 
      return Array(5).fill().map(column => {
        return { num: null, marked: false };
      });
    });
  }

  addRow(rowString, rowIndex) {
    let found = rowString.match(rowRegex);
    if (!found) {
      return false;
    }
    [found[1], found[2], found[3], found[4], found[5]].reduce((acc, curr, columnIndex) => {
      acc[columnIndex].num = Number.parseInt(curr);
      return acc;
    }, this.board[rowIndex]);
    return true;
  }

  markNumber(calledNumber) {
    for (let row = 0; row < 5; ++row) {
      for (let column = 0; column < 5; ++column) {
        if (this.board[row][column].num !== calledNumber) {
          continue;
        }
        this.board[row][column].marked = true;
        return true;
      }
    }
    return false;
  }

  unmarkedSum() {
    return this.board.reduce((acc, curr) => {
      for (let column = 0; column < 5; ++column) {
        if (curr[column].marked) {
          continue;
        }
        acc += curr[column].num;
      }
      return acc;
    }, 0);
  }

  bingo() {
    // have we won on rows
    for (let row = 0; row < 5; ++row) {
      let hasBingo = true;
      for (let column = 0; column < 5; ++column) {
        if (this.board[row][column].marked === false) {
          hasBingo = false;
          break; // next row
        }
      }
      if (hasBingo) {
        return { row: row, values: this.board[row] };
      }
    }
    // have we won on columns
    for (let column = 0; column < 5; ++column) {
      let hasBingo = true;
      let values = [ ];
      for (let row = 0; row < 5; ++row) {
        if (this.board[row][column].marked === false) {
          hasBingo = false;
          break; // next column
        }
        values.push(this.board[row][column]);
      }
      if (hasBingo) {
        return { column: column, values: values };
      }
    }
    return false;
  }
}

async function processLineByLine() {
  const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'bingo.txt'));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let calledNumbers = [ ];
  let bingoBoards = [ ];
  let currentBoard = null;
  let currentBoardRowIndex = 0;
  for await (const line of rl) {
    if (line.includes(',')) {
      // calledNumbers line
      calledNumbers = line.split(',');
      continue;
    }
    if (line.match(/^\s*$/)) {
      currentBoard = new BingoBoard();
      currentBoardRowIndex = 0;
      continue;
    }
    if (line.match(rowRegex)) {
      currentBoard.addRow(line, currentBoardRowIndex++);
      if (currentBoardRowIndex === 5) {
        bingoBoards.push(currentBoard);
        currentBoard = null;
        currentBoardRowIndex = 0;        
      }
      continue;
    }
  }

  for (let calledNumberString of calledNumbers) {
    let calledNumber = Number.parseInt(calledNumberString);
    for (let board of bingoBoards) {
      if (board.markNumber(calledNumber) && board.bingo()) {
        return { winningNumber: calledNumber, winningBoard: board, unmarkedSum: board.unmarkedSum() };
      }
    }
  }
  throw new Error('boom!!!! no winners.');
}

processLineByLine()
  .then(result => {
    console.log(`Winning Number: ${result.winningNumber}, UnmarkedSum: ${result.unmarkedSum}, Score: ${result.winningNumber * result.unmarkedSum}`);
  });
