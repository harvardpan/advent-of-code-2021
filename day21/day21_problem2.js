function constructStates() {
  let states = [ ];
  for (let p1pos = 0; p1pos < 10; ++p1pos) {
    let p2posArray = [ ];
    for (let p2pos = 0; p2pos < 10; ++p2pos) {
      let p1scoreArray = [ ];
      for (let p1score = 0; p1score < 30; ++p1score) {
        let p2scoreArray = new Array(30).fill(0);
        p1scoreArray.push(p2scoreArray);
      }
      p2posArray.push(p1scoreArray);
    }
    states.push(p2posArray);
  }
  return states;
}

function add(states, p1position, p2position, p1score, p2score, amount = 1) {
  states[p1position - 1][p2position - 1][p1score][p2score] += amount;
}

function calculate(position, score, input) {
  let newPosition = (position + input) % 10;
  if (newPosition === 0) {
    newPosition = 10;
  }
  let newScore = score + newPosition;
  return { position: newPosition, score: newScore };
}

let player1wins = 0;
let player2wins = 0;

function addWinner(player, input) {
  if (player === 1) {
    player1wins += input;
  }
  else {
    player2wins += input;
  }
}

function rollDice(player) {
  let newStates = constructStates();
  for (let p1pos = 1; p1pos <= 10; ++p1pos) {
    for (let p2pos = 1; p2pos <= 10; ++p2pos) {
      for (let p1score = 0; p1score < 30; ++p1score) {
        for (let p2score = 0; p2score < 30; ++p2score) {
          let numUniverses = allStates[p1pos - 1][p2pos - 1][p1score][p2score];
          if (numUniverses === 0) {
            continue;
          }
          let currentPosition = player === 1 ? p1pos : p2pos;
          let currentScore = player === 1 ? p1score : p2score;
          // Add 27 universes for all possible outcomes (one 3, three 4, six 5, seven 6, six 7, three 8, one 9)
          let result = null;
          result = calculate(currentPosition, currentScore, 3);
          if (result.score >= 21) { 
            addWinner(player, numUniverses); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses);
          }

          result = calculate(currentPosition, currentScore, 4);
          if (result.score >= 21) { 
            addWinner(player, numUniverses * 3); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses * 3);
          }

          result = calculate(currentPosition, currentScore, 5);
          if (result.score >= 21) { 
            addWinner(player, numUniverses * 6); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses * 6);
          }

          result = calculate(currentPosition, currentScore, 6);
          if (result.score >= 21) { 
            addWinner(player, numUniverses * 7); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses * 7);
          }

          result = calculate(currentPosition, currentScore, 7);
          if (result.score >= 21) { 
            addWinner(player, numUniverses * 6); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses * 6);
          }

          result = calculate(currentPosition, currentScore, 8);
          if (result.score >= 21) { 
            addWinner(player, numUniverses * 3); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses * 3);
          }
          
          result = calculate(currentPosition, currentScore, 9);
          if (result.score >= 21) { 
            addWinner(player, numUniverses); 
          } 
          else {
            add(newStates, player === 1 ? result.position : p1pos, player === 2 ? result.position : p2pos, player === 1 ? result.score : p1score, player === 2 ? result.score: p2score, numUniverses);
          }
        }
      }
    }
  }
  allStates = newStates;
}

function allZeroes() {
  for (let p1pos = 1; p1pos <= 10; ++p1pos) {
    for (let p2pos = 1; p2pos <= 10; ++p2pos) {
      for (let p1score = 0; p1score < 30; ++p1score) {
        for (let p2score = 0; p2score < 30; ++p2score) {
          let numUniverses = allStates[p1pos - 1][p2pos - 1][p1score][p2score];
          if (numUniverses !== 0) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

let allStates = constructStates();
add(allStates, 6, 3, 0, 0);
while (!allZeroes()) {
  rollDice(1);
  rollDice(2);
}
console.log(`Player 1: ${player1wins}, Player 2: ${player2wins}`);