/* UTTT
* 9 by 9 board -- Yay! 😀
* validation function update -- Done! 😄
* win game function update -- Yes 😁
*
* Minimax 😎.
* * DrawCheck on subBoard
* * Monte Carlo Tree Search 😅
*/

class State {
    
  /** Create a deep copy of the board and subBoardStates to allow for modification during simulation
   *  without the need for proper undoing of moves/actions
   * @param {number[][]} board 
   * @param {number[][]} subBoardStates 
   * @param {{y, x}} previousMove         // This is just an object with an x and y component.
   * @param {number} turn
   * @param {boolean} doCopy              // To create a deep copy board and subBoardStates or not.
   */
  constructor(board, subBoardStates, previousMove, turn, doCopy) {
      this.board = (doCopy) ? board.map((row) => [...row]) : board;
      this.subBoardStates = (doCopy) ? subBoardStates.map((row) => [...row]) : subBoardStates;
      this.previousMove = previousMove;
      this.turn = turn;
  }
}

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

let subBoardStates = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

// Create a 9 by 9 board
// by copying the subBoard 9 times to create 9 rows and columns.
const board = subBoard.map(() => [...subBoard] );

// const board = subBoardStates;

const boardLen = board[0].length;

const state = new State(board, subBoardStates, null, humanPlayer, false);

const players = [game.X, game.O];
let currentPlayer;
const getSymbol = (n) => (n == game.X ? "X" : "O");

const horizontalWin = [ [[0, 0], [0, 1], [0, 2]], 
                      [[1, 0], [1, 1], [1, 2]],
                      [[2, 0], [2, 1], [2, 2]] ];

const verticalWin = [ [[0, 0], [1, 0], [2, 0]], 
                    [[0, 1], [1, 1], [2, 1]],
                    [[0, 2], [1, 2], [2, 2]] ];

const diagonalWin = [ [[0, 0], [1, 1], [2, 2]],
                    [[0, 2], [1, 1], [2, 0]] ];

const winningLines = horizontalWin.concat(verticalWin).concat(diagonalWin);

// Draw the highlighting rectangle coordinates off screen initially as all moves are valid then.
const nextSubBoardToPlay = [-2, -2];

function setup() {
  createCanvas(600, 600);
  // currentPlayer = random(players);
  state.turn = humanPlayer;
  currentPlayer = humanPlayer;
}


function draw() {
  background(255);
  
  const w = width / boardLen;
  const h = height / boardLen;

  strokeWeight(4);
  stroke(0);
  noFill();

  // Draw box around corresponding sub-board here! :D

  // Draw the board
  for (let x = 0; x < boardLen; x++) {
    for (let y = 0; y < boardLen; y++) {
      
      let xp = w * y + w / 2;
      let yp = h * x + h / 2;

      let pos = board[x][y];
      
      strokeWeight(4);
      if (pos == game.O) {
        ellipse(xp, yp, w / 2);
      } 
      else if (pos == game.X) {
        let xr = w / 4;
        // Top right to bottom left, and top left to bottom right
        line(xp + xr, yp - xr, xp - xr, yp + xr);
        line(xp - xr, yp - xr, xp + xr, yp + xr);
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

  strokeWeight(10);
  stroke(0, 125, 255);
  
  let [sbx, sby] = [nextSubBoardToPlay[0], nextSubBoardToPlay[1]];

  rect(w * (sbx * 3), h * sby * 3, w * 3, h * 3);

  findSubBoardWins(state, true);

  const winner = boardWinCheck(state.subBoardStates);
  if (winner) {
    print("VICTORY FOR", getSymbol(winner));
    game.gameOver = true;
    noLoop();
  }

  const isDrawn = isDraw(board);
  game.draw = isDrawn;
}


function mouseClicked() {
  const y = floor(mouseX / (width / boardLen));
  const x = floor(mouseY / (height / boardLen));

  if (!isValid(x, y, state) || game.gameOver || game.draw) {
    return;
  }

  state.board[x][y] = state.turn;
  state.previousMove = {y, x};
  state.turn = getNext(state.turn);
  let subBoardCoords = getNextSubBoard(x, y);
  nextSubBoardToPlay[0] = subBoardCoords.y;
  nextSubBoardToPlay[1] = subBoardCoords.x;

  // Call the ai move slightly later to allow the draw loop to show the human's previous move.
  setTimeout(() => {
      const aiMove = _bestMove();
      subBoardCoords = getNextSubBoard(aiMove.x, aiMove.y);
      nextSubBoardToPlay[0] = subBoardCoords.y;
      nextSubBoardToPlay[1] = subBoardCoords.x;
    }, 50);
      
}

// Mobile support
// function touchStarted() {
//   mouseClicked();
// }

// Find winning line(s)
function findSubBoardWins(state, showDrawing) {

  for (let xOffset = 0; xOffset < floor(boardLen / 3); xOffset++) {
    for (let yOffset = 0; yOffset < floor(boardLen / 3); yOffset++) {
      state.subBoardStates[yOffset][xOffset] = game.none;
      for (const wLine of winningLines) {

        let winner = subBoardWinCheck(state.board, wLine, xOffset, yOffset);
        if (!winner) continue;

        state.subBoardStates[yOffset][xOffset] = winner;
        if (showDrawing) drawSubBoardWin(wLine, xOffset * 3, yOffset * 3);
        if (winner != game.none) break;     // Only draw one winning line per sub-board
      }
    }
  }
}


function subBoardWinCheck(board, wLine, xOffset, yOffset) {
  let winner = null;

  if (board[wLine[0][0] + (yOffset * 3)][wLine[0][1] + (xOffset * 3)] == game.X
  && board[wLine[1][0] + (yOffset * 3)][wLine[1][1] + (xOffset * 3)] == game.X
    && board[wLine[2][0] + (yOffset * 3)][wLine[2][1] + (xOffset * 3)] == game.X) {
      winner = game.X;
  }
  else if (board[wLine[0][0] + (yOffset * 3)][wLine[0][1] + (xOffset * 3)] == game.O
    && board[wLine[1][0] + (yOffset * 3)][wLine[1][1] + (xOffset * 3)] == game.O
    && board[wLine[2][0] + (yOffset * 3)][wLine[2][1] + (xOffset * 3)] == game.O) {
      winner = game.O;
  }

  return winner;
}


// Check if there's a winner across all boards
function boardWinCheck(subBoardStates) {

  for (const player of players) {
    for (let wLine = 0; wLine < winningLines.length; wLine++) {
      if (subBoardStates[winningLines[wLine][0][0]][winningLines[wLine][0][1]] == player 
        && subBoardStates[winningLines[wLine][1][0]][winningLines[wLine][1][1]] == player 
        && subBoardStates[winningLines[wLine][2][0]][winningLines[wLine][2][1]] == player) {
          return player;
      }
    }
  }

}

function getSubBoardSquares(board, yOffset, xOffset) {
  const x = xOffset * 3;
  const y = yOffset * 3;
  let subBoardSquares = [];

  for (const subBoard of board.filter( (_, i) => i == x || i == x + 1 || i == x + 2))
    subBoardSquares = subBoardSquares.concat(subBoard.filter( (_, i) => {return i >= y && i < y + 3}));
  
  return subBoardSquares;
}


function isDraw(board) {
 return board.every( (row) => row.every( (square) => square == game.X || square == game.O));
}


function drawSubBoardWin(_line, xOffset, yOffset) {

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



function isValid(movex, movey, state) {

  // previousMove has not been set yet, so it's the first move of the game and is always valid
  if (state.previousMove === null)
    return true;
  
  const pickedSquare = state.board[movex][movey];
  const pickedSubBoard = getParentSubBoard(movex, movey);

  const subBoardToPlay = getNextSubBoard(state.previousMove.x, state.previousMove.y);
  const isPickedCorrectSubBoard = (pickedSubBoard.x == subBoardToPlay.x) && (pickedSubBoard.y == subBoardToPlay.y);
  const isPickedSubBoardEmpty = state.subBoardStates[pickedSubBoard.x][pickedSubBoard.y] == game.none;
  if (pickedSquare != game.none)  // If the square isn't empty it's always false
    return false;

  // if sub-board to play in is full, then we can play anywhere
  if (getSubBoardSquares(state.board, subBoardToPlay.y, subBoardToPlay.x).every( (square) => square == game.X || square == game.O))
    return true;
  // Special condition where a player is sent to a won/drawn subgrid
  // the picked sub-board is empty, and it isn't the sub-board to play in, the sub-board-to play in is won/drawn
  const isCorrectSubBoardLegal = state.subBoardStates[subBoardToPlay.x][subBoardToPlay.y] == game.none;

  if (isPickedSubBoardEmpty && !isPickedCorrectSubBoard && !isCorrectSubBoardLegal) 
    return true;

  if (!isPickedSubBoardEmpty)   // If the picked sub-board isn't empty -- false
    return false;
  
  if (!isPickedCorrectSubBoard)      
    return false;
  
  return true;
}


// Return the coordinates of the move's/square's sub-board.
function getParentSubBoard(movex, movey) {
  const x = floor(movex / 3);
  const y = floor(movey / 3);
  return {x, y};
}


// Return which sub-board the next move should be played in.
function getNextSubBoard(movex, movey) {
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