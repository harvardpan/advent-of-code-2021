let positions = [ 6, 3 ];
let scores = [ 0, 0 ];

let nextValue = 1;
let numRolls = 0;

function rollDice() {
  let result = nextValue;
  nextValue = nextValue >= 100 ? 1 : nextValue + 1;
  ++numRolls;
  return result;
}

function getPlayerRolls() {
  let result = {
    rolls: [ ],
    sum: 0
  };
  for (let i = 0; i < 3; ++i) {
    result.rolls.push(rollDice());
  }
  result.sum = result.rolls.reduce((acc, curr) => { return acc + curr; }, 0);
  return result;
}

function movePlayer(playerNum) {
  let result = getPlayerRolls();
  positions[playerNum] = positions[playerNum] + result.sum;
  positions[playerNum] = positions[playerNum] % 10;
  if (positions[playerNum] === 0) {
    positions[playerNum] = 10;
  }
  scores[playerNum] = scores[playerNum] + positions[playerNum];
  console.log(`Player ${playerNum + 1} rolls ${result.rolls.join('+')} and moves to space ${positions[playerNum]} for a total score of ${scores[playerNum]}`);
  if (scores[playerNum] >= 1000) {
    return true; // they won!
  }
  return false; // they didn't win!
}

while (true) {
  let losingPlayer = 0;
  if (movePlayer(0) || movePlayer(1)) {
    losingScore = Math.min(scores[0], scores[1]);
    losingPlayer = scores.indexOf(losingScore) + 1;                       
    console.log(`Player ${losingPlayer} lost with a score of ${losingScore} and ${numRolls} dice rolls.`);
    console.log(`Answer is ${losingScore * numRolls}`);
    break;
  }
}
