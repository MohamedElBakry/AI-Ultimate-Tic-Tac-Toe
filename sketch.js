/* UTTT
* 9 by 9 board -- Yay! 😀
* validation function update -- Done! 😄
* win game function update -- Yes 😁
*
* Minimax 😎.
* * DrawCheck on subBoard
*/


const game = {
  none: 0,
  X: 1,
  O: 2,
  gameOver: false,
  draw: false,
  previousMove: null
};

const subBoard = [
  0, 0, 0,
  0, 0, 0,
  0, 0, 0
];

const subBoardStates = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

// Create a 9 by 9 board
// by copying the subBoard 9 times to create 9 rows and columns.
const board = subBoard.map( () => [...subBoard] );

// const board = subBoardStates;

const boardLen = board[0].length; 

const players = [game.X, game.O];
let currentPlayer;
const getSymbol = (n) => (n == game.X ? "X" : "O");


function setup() {
  createCanvas(700, 700);
  // currentPlayer = random(players);
  currentPlayer = game.O;
  // _bestMove();
  // board[1][1] = game.X;
  // Ai is X;
}


function draw() {
  background(255);  
  
  const w = width / boardLen;
  const h = height / boardLen;

  strokeWeight(4);
  stroke(0);
  noFill();

  // Draw the board
  for (let x = 0; x < boardLen; x++) {
    for (let y = 0; y < boardLen; y++) {
      
      let xp = w * y + w / 2;
      let yp = h * x + h / 2;

      let pos = board[x][y];
      
      strokeWeight(4);
      if (pos == game.X) {
        let xr = w / 4;
        // Top right to bottom left, and top left to bottom right
        line(xp + xr, yp - xr, xp - xr, yp + xr);
        line(xp - xr, yp - xr, xp + xr, yp + xr);

      } else if (pos == game.O) {
        ellipse(xp, yp, w / 2);
      }

      // Draw the dividing lines between, extra thick if between sub-boards.
      strokeWeight(4);
      line(w * (x + 1), 0, w * (x + 1), height);
      line(0, h * (y + 1), width, h * (y + 1));
      
      // Thicker/weightier because this is a seperate sub-board.
      if ( (y + 1) % 3 == 0) {
        strokeWeight(10);
        line(0, h * (y + 1), width, h * (y + 1));
      }
    }

    // Thicker/weightier because this is a seperate sub-board.
    if ((x + 1) % 3 == 0) {
      strokeWeight(10);
      line(w * (x + 1), 0, w * (x + 1), height);
    }

  }

  drawSubBoardWins(board, getNext(currentPlayer));

  const winner = boardWinCheck();
  if (winner) {
    print("VICTORY FOR", getSymbol(winner));
    noLoop();
    game.gameOver = true;
  }

  const isDrawn = isDraw(board);
  game.draw = isDrawn;
}


function mouseClicked() {
  const y = floor(mouseX / (width / boardLen));
  const x = floor(mouseY / (height / boardLen));

  if (!isValid(x, y, board) || game.gameOver || game.draw) {
    print("draw:", game.draw);
    print("victory: ", game.gameOver, getSymbol(getNext(currentPlayer)));
    return;
  }

  board[x][y] = currentPlayer;
  game.previousMove = {y, x};
  currentPlayer = getNext(currentPlayer);
  // printState(board);
  // print(x, y);
  print(nextCorrespondingSubBoard(x, y));

  // _bestMove(); 

}

// Mobile support
// function touchStarted() {
//   mouseClicked();
// }

// Find winning line(s)
function drawSubBoardWins(board) {

  for (let xOffset = 0; xOffset < floor(boardLen / 3); xOffset++) {
    for (let yOffset = 0; yOffset < floor(boardLen / 3); yOffset++) {
      for (const _line of winningLines) {

        let winner = subBoardWinCheck(board, _line, yOffset, xOffset);
        if (!winner) continue; 

        subBoardStates[yOffset][xOffset] = winner;
        drawSubgridWin(_line, xOffset * 3, yOffset * 3);
      }
    }
  }
}


function subBoardWinCheck(board, _line, yOffset, xOffset) {
  let winner = null;

  if (board[_line[0][0] + (yOffset * 3)][_line[0][1] + (xOffset * 3)] == game.X
    && board[_line[1][0] + (yOffset * 3)][_line[1][1] + (xOffset * 3)] == game.X
    && board[_line[2][0] + (yOffset * 3)][_line[2][1] + (xOffset * 3)] == game.X) {
      winner = game.X;
  }
  else if (board[_line[0][0] + (yOffset * 3)][_line[0][1] + (xOffset * 3)] == game.O
    && board[_line[1][0] + (yOffset * 3)][_line[1][1] + (xOffset * 3)] == game.O
    && board[_line[2][0] + (yOffset * 3)][_line[2][1] + (xOffset * 3)] == game.O) {
      winner = game.O;
  }

  return winner;
}


// Check if there's a winner across all boards
function boardWinCheck() {

  for (const player of players) {
    for (let _line = 0; _line < winningLines.length; _line++) {
      if (subBoardStates[winningLines[_line][0][0]][winningLines[_line][0][1]] == player 
        && subBoardStates[winningLines[_line][1][0]][winningLines[_line][1][1]] == player 
        && subBoardStates[winningLines[_line][2][0]][winningLines[_line][2][1]] == player) {
          return player;
      }
    }
  }

}

function getSubBoardSquares(board, xOffset, yOffset) {
  const x = xOffset * 3;
  const y = yOffset * 3;
  let subBoardSquares = [];
  
  for (const sb of board.filter( (_, i) => i == x || i == x + 1 || i == x + 2))
    subBoardSquares = subBoardSquares.concat(sb.filter( (_, i) => {return i >= y && i < y + 3}));
  
  return subBoardSquares;
}


function isDraw(board) {
 return board.every( (row) => row.every( (square) => square != game.none));
}


function drawSubgridWin(_line, xOffset, yOffset) {

  if (!_line)
    return;

  const wh = width / boardLen;
  const wl = _line;
  const xoffset = 0.5;
  const yoffset = 0.5;

  strokeWeight(7);
  stroke(0, 220, 0);
  line(wh * (wl[0][1] + xoffset + xOffset), wh * (wl[0][0] + yoffset + yOffset),
  wh * (wl[2][1] + xoffset + xOffset), wh * (wl[2][0] + yoffset + yOffset));
}


function getNext(player) {
  if (player == game.X)
    return game.O
  
  return game.X;
}

function isValid(movex, movey, board) {

  // previousMove has not been set yet, so it's the first move of the game and is always valid
  if (game.previousMove === null) {
    return true;
  }

  const square = board[movex][movey];
  const pickedSubBoard = getParentSubBoard(movex, movey);
  const subBoardToPlay = nextCorrespondingSubBoard(game.previousMove.x, game.previousMove.y);
  const isCorrectSubBoard = pickedSubBoard.x == subBoardToPlay.x && pickedSubBoard.y == subBoardToPlay.y;
  const isEmptySubBoard = subBoardStates[pickedSubBoard.x][pickedSubBoard.y] == game.none;

  if (square == game.none && isEmptySubBoard && isCorrectSubBoard) {
    return true;
  } 

  // If a player is sent to a won or **drawn** sub-board, they can play anywhere
  // todo: apply if drawn sub-board 
  if (subBoardStates[subBoardToPlay.x][subBoardToPlay.y] != game.none && !isCorrectSubBoard && square == game.none)
    return true;
  
  return false;
}


// Return the coordinates of the move's/square's sub-board.
function getParentSubBoard(movex, movey) {
  const x = floor(movex / 3);
  const y = floor(movey / 3);
  return {x, y};
}


// Return which sub-board the next move should be played in.
function nextCorrespondingSubBoard(movex, movey) {
  const x = movex % 3;
  const y = movey % 3;

  return {x, y};
}


function printState(board) {
  console.log("\n");
  let rowStr = "";

  for (let x = 0; x < boardLen; x++) {
    rowStr = "";
    for (let y = 0; y < boardLen; y++) {
      let pos = board[x][y];
      if (pos == game.X)
        rowStr += "X, ";
      else if(pos == game.O)
        rowStr += "O, ";
      else
        rowStr += "_, ";

      if ( (y + 1) % 3 == 0)
        rowStr += "| ";
    }

    console.log(rowStr);
  }

}