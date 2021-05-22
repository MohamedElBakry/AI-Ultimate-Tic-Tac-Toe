/**  Intelligent Systems Project - By Mohamed El Bakry, 18006086.
* An Intelligent minimax agent with alpha aeta pruning that plays UTTT (Ultimate Tic Tac Toe) versus a human.
*/

"use strict";

const game = {
  none: 0,
  X: 1,
  O: 2,
  gameOver: false,
  draw: false
};

const BOARD_LEN = 9;
const subBoard = new Array(BOARD_LEN).fill(game.none);
const subBoardStates = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
const board = subBoard.map(() => subBoard.slice(0));

const state = new State(board, subBoardStates, null, game.O, false);
const players = [game.X, game.O];

const horizontalWin = [ 
[[0, 0], [0, 1], [0, 2]], 
[[1, 0], [1, 1], [1, 2]],
[[2, 0], [2, 1], [2, 2]] ];

const verticalWin = [ 
[[0, 0], [1, 0], [2, 0]], 
[[0, 1], [1, 1], [2, 1]],
[[0, 2], [1, 2], [2, 2]] ];

const diagonalWin = [ 
[[0, 0], [1, 1], [2, 2]],
[[0, 2], [1, 1], [2, 0]] ];

const winningLines = horizontalWin.concat(verticalWin).concat(diagonalWin);

const getSymbol = (n) => (n == game.X ? "X" : "O");

// Draw the highlighting rectangle coordinates off screen initially as all moves are valid then.
const nextSubBoardToPlay = [-2, -2];
const agentX = new Agent(state, 0, Agent.piece.X);
// const agentO = new Agent(state, 0, Agent.piece.O);


function setup() {
  createCanvas(900, 900);
  // Allow the Agent to make the first move. Comment to allow the human to play first.
  // makeAIMove();

  state.turn = agentX.opponentPiece;
}


function draw() {
  background(255);
  
  const w = width / BOARD_LEN;
  const h = height / BOARD_LEN;

  strokeWeight(4);
  stroke(0);
  noFill();

  // Draw the board
  for (let x = 0; x < BOARD_LEN; x++) {
    for (let y = 0; y < BOARD_LEN; y++) {
      
      let pos = board[x][y];
      let xp = w * y + w / 2;
      let yp = h * x + h / 2;

      strokeWeight(4);
      if (pos == game.O) {
        ellipse(xp, yp, w / 2);  // Radius is w / 2 to make the circle slightly smaller than the square its in
      } 
      else if (pos == game.X) {
        // Top right to bottom left, and top left to bottom right
        drawX(w, xp, yp);
      }

      // Draw the dividing lines between, and extra thick horizontal lines if between sub-boards.
      drawDividingLines(w, x, h, y);
    }

    // Thicker/weightier vertical lines because this is a seperate sub-board.
    drawThickerVerticalLines(x, w);

  }

  highlightNextSubBoard(w, h);


  findSubBoardWins(state, true);
  const winner = boardWinCheck(state.subBoardStates);
  game.draw = isDraw(state.board);
  if (winner) {
    console.log("VICTORY FOR", getSymbol(winner));
    game.gameOver = true;
    noLoop();
  } 


}


/* Draw loop helper functions */
function highlightNextSubBoard(w, h) {
  strokeWeight(10);
  stroke(0, 125, 255);

  let [sbx, sby] = [nextSubBoardToPlay[0], nextSubBoardToPlay[1]];
  rect(w * (sbx * 3), h * sby * 3, w * 3, h * 3);
}

function drawThickerVerticalLines(x, w) {
  if ((x + 1) % 3 == 0) {
    strokeWeight(10);
    line(w * (x + 1), 0, w * (x + 1), height);
  }
}

function drawDividingLines(w, x, h, y) {
  line(w * (x + 1), 0, w * (x + 1), height); // Vertical lines
  line(0, h * (y + 1), width, h * (y + 1)); // Horizontal lines


  // Thicker/weightier because this is a seperate sub-board.
  if ((y + 1) % 3 == 0) {
    strokeWeight(10);
    line(0, h * (y + 1), width, h * (y + 1));
  }
}

function drawX(w, xp, yp) {
  let xr = w / 4;
  line(xp + xr, yp - xr, xp - xr, yp + xr);
  line(xp - xr, yp - xr, xp + xr, yp + xr);
}

/* When the mouse is clicked, if the do the move if it's valid, then let the AI reply  */
function mouseClicked() {
  const y = floor(mouseX / (width / BOARD_LEN));
  const x = floor(mouseY / (height / BOARD_LEN));

  if (!isValid(x, y, state) || game.gameOver || game.draw) {
    return;
  }

  state.board[x][y] = state.turn;
  state.previousMove = {y, x};
  state.turn = getNext(state.turn);
  let subBoardCoords = getNextSubBoard(x, y);
  nextSubBoardToPlay[0] = subBoardCoords.y;
  nextSubBoardToPlay[1] = subBoardCoords.x;

  makeAIMove();
}


function makeAIMove() {
  // Call the ai move slightly later to allow the draw loop to show the human's previous move.
  setTimeout(() => {
    const aiMove = agentX.playOptimalMove();
    const subBoardCoords = getNextSubBoard(aiMove.x, aiMove.y);
    nextSubBoardToPlay[0] = subBoardCoords.y;
    nextSubBoardToPlay[1] = subBoardCoords.x;
  }, 50);
}

// Mobile support if needed.
// touchStarted = mouseClicked;

/** Loops through the state to find winning lines within sub-boards.
 * @param {State} state - The current state of the game.
 * @param {boolean} showDrawing - Whether or not to draw the winning lines. 
 * This is used during the Agent's search to find a winning line without making an unnecessary draw call. 
 */
function findSubBoardWins(state, showDrawing) {

  for (let xOffset = 0; xOffset < floor(BOARD_LEN / 3); xOffset++) {
    for (let yOffset = 0; yOffset < floor(BOARD_LEN / 3); yOffset++) {
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

/** Indexes all the squares of a specified sub-board with the coordinates of a winning line to discover a win or not.
 * @param {number[][]} board - A 2D number array which represents the current board state. 
 * @param {number[][]} wLine - A 2D number array that contains the coordinates of a winning line. (Horizontal, Vertical, Diagonal)  
 * @param {number} xOffset - A number indicating the x offset by which to index the board to only target a particular sub-board
 * @param {*} yOffset - Like xOffset, but is the y offset for indexing the board.
 * @returns {number} - Either @var game.X or, @var game.O to indicate if that piece has won that sub-board. 
 */
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


/** Check if there's a winner across all boards for any of the 2 players.
 * @param {number[][]} subBoardStates - A 2D numerical array representation of the win/loss state of each sub-board. 
 * @returns {number} - The player that has won the game considering the @param subBoardStates. 
 */
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


/** Gives back all the squares that belong to a specific sub-board.
 * @param {number[][]} board - 2D number array which represents the full game board state.
 * @param {number} yOffset - The y offset to index the sub-board by.  
 * @param {number} xOffset - The x offset to index the sub-board by.
 * @returns {number[]} - A number array of squares that belong to the sub-board indexed by @param yOffset and @param xOffset
 */
function getSubBoardSquares(board, yOffset, xOffset) {
  const x = xOffset * 3;
  const y = yOffset * 3;
  let subBoardSquares = [];

  for (const subBoard of board.filter( (_, i) => i == x || i == x + 1 || i == x + 2))
    subBoardSquares = subBoardSquares.concat(subBoard.filter( (_, i) => {return i >= y && i < y + 3}));
  
  return subBoardSquares;
}


/** Checks if every square is filled by an X or O.
 * @param {number[][]} board - The board that contains the position of every piece.
 * @returns {boolean} true if the game is drawn as every square in @param board contains a piece.
 */
function isDraw(board) {
 return board.every( (row) => row.every( (square) => square == game.X || square == game.O));
}


/** Draws a green line to match the winning line that is achieved by either player in a sub-board.
 * @param {number[][]} wLine - The winning line coordinates to draw the line with.
 * @param {number} xOffset - The sub-board's x coordinate. 
 * @param {number} yOffset - The sub-board's y coordinate.
 * @returns {undefined} If @param wLine is not passed, the function returns nothing as an error check.
 */
function drawSubBoardWin(wLine, xOffset, yOffset) {

  if (!wLine)
    return;

  const wh = width / BOARD_LEN;
  const wl = wLine;
  const xoffset = 0.5;
  const yoffset = 0.5;

  strokeWeight(7);
  stroke(0, 220, 0);
  line(wh * (wl[0][1] + xoffset + xOffset), wh * (wl[0][0] + yoffset + yOffset),
  wh * (wl[2][1] + xoffset + xOffset), wh * (wl[2][0] + yoffset + yOffset));
}


/** Gets the player who should play the next turn
 * @param {number} player - The player of the current turn. 
 * @returns {number} The number of the next turn's player.  
 */
function getNext(player) {
  if (player == game.X)
    return game.O
  
  return game.X;
}


/** Checks if a move at a given square is valid or not.
 * @param {number} movex - The picked square's x coordinate. 
 * @param {number} movey - The picked square's y coordinate. 
 * @param {State} state - The current state of the game.
 * @returns {boolean} True if the move is valid, false if not.
 */
function isValid(movex, movey, state) {

  // previousMove has not been set yet, so it's the first move of the game and is always valid
  if (state.previousMove === null)
    return true;
  
  const pickedSquare = state.board[movex][movey];
  if (pickedSquare != game.none)  // If the square isn't empty it's always false -- so we make this check first.
    return false;

  const pickedSubBoard = getParentSubBoard(movex, movey);

  const subBoardToPlay = getNextSubBoard(state.previousMove.x, state.previousMove.y);
  const isPickedCorrectSubBoard = (pickedSubBoard.x == subBoardToPlay.x) && (pickedSubBoard.y == subBoardToPlay.y);
  const isPickedSubBoardEmpty = state.subBoardStates[pickedSubBoard.x][pickedSubBoard.y] == game.none;

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


/** Return the coordinates of the move's/square's sub-board.
 * @param {number} movex - The move's x coordinate. 
 * @param {number} movey - The move's y coordinate.
 * @returns {object} returns the parent sub-board coordinates in an object with an x and y component.
 */
function getParentSubBoard(movex, movey) {
  const x = floor(movex / 3);
  const y = floor(movey / 3);
  return {x, y};
}


/** Return which sub-board the next move should be played in.
 * @param {number} movex - The move's x coordinate
 * @param {number} movey - The move's y coordinate.
 * @returns {object} The coordinates of sub-board that the next move should be in. Inside an object with an x and y component.
 */
function getNextSubBoard(movex, movey) {
  const x = movex % 3;
  const y = movey % 3;

  return {x, y};
}

/** Mainly used for debugging purposes, this logs to the console a basic text representation of the board.
 * @param {number[][]} board - The 2D numerical representation of the board. 
 */
function printStateOf(board) {
  console.log("\n");
  let rowStr = "";

  for (let x = 0; x < BOARD_LEN; x++) {
    rowStr = "";
    for (let y = 0; y < BOARD_LEN; y++) {
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
