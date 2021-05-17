/* UTTT
* 9 by 9 board -- Yay! 😀
* validation function update -- Next up! 😄
* win game function update -- Yes 😁
*/

const game = {
  none: 0,
  X: 1,
  O: 2,
  gameOver: false,
  draw: false
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

 drawSubBoardWin(board, getNext(currentPlayer));
  // game.gameOver = gameOver;

  // if (game.gameOver || game.draw) {
  //   drawSubgrid(winningLine);
  //   // noLoop();
  // }

  const isDrawn = isDraw(board); 
  game.draw = isDrawn;

}


function mouseClicked() {
  const x = floor(mouseX / (width / boardLen));
  const y = floor(mouseY / (height / boardLen));

  if (!isValid(y, x, board) || game.gameOver || game.draw) {
    print("draw:", game.draw);
    print("victory: ", game.gameOver, getSymbol(getNext(currentPlayer)));
    return;
  }

  board[y][x] = currentPlayer;

  currentPlayer = getNext(currentPlayer);
  printState(board);

  // _bestMove();

}

// Find a winning line for a specific player
// TODO: maybe split function into subBoardIsWon and drawWin(subBoard)
function drawSubBoardWin(board, player) {

  for (let xOffset = 0; xOffset < floor(boardLen / 3); xOffset++) {
    for (let yOffset = 0; yOffset < floor(boardLen / 3); yOffset++) {
      for (const _line of winningLines) {

        if (board[_line[0][0] +  (yOffset * 3)][_line[0][1] + (xOffset * 3)] == game.X 
        && board[_line[1][0]  + (yOffset * 3)][_line[1][1] + (xOffset * 3)] == game.X
        && board[_line[2][0]  + (yOffset * 3)][_line[2][1] + (xOffset * 3)] == game.X) {
          drawSubgrid(_line, xOffset * 3, yOffset * 3);
          subBoardStates[yOffset][xOffset] = game.X;
        }

        else if (board[_line[0][0] +  (yOffset * 3)][_line[0][1] + (xOffset * 3)] == game.O 
        && board[_line[1][0]  + (yOffset * 3)][_line[1][1] + (xOffset * 3)] == game.O
        && board[_line[2][0]  + (yOffset * 3)][_line[2][1] + (xOffset * 3)] == game.O) {
          drawSubgrid(_line, xOffset * 3, yOffset * 3);
          subBoardStates[yOffset][xOffset] = game.O;
        }

      }
    }
  }
  
}


function isDraw(board) {
 return board.every( (row) => row.every( (square) => square != game.none));
}


function drawSubgrid(winningLine, xOffset, yOffset) {

  if (!winningLine)
    return;

  const wh = width / boardLen;
  const wl = winningLine;
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


function isValid(movex, movey, board) {
  const pos = board[movex][movey];
  const isEmptySubBoard = subBoardStates[floor(movex / 3)][floor(movey / 3)] == game.none;

  if (pos == game.none && isEmptySubBoard) {
    return true;
  }
  
  return false;
}
