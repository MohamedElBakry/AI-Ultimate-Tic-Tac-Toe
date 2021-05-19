const AI = 1; // 2 == game.O
const humanPlayer = 2; // 1 == game.X

function _bestMove() {
  let bestScore = -Infinity;
  let bestMove;

  console.time("ai best move reply time");

  const moves = getLegalMoves(board);
  const depth = (moves.length <= 9) ? 6 : 4;
  for (const move of moves) {
    board[move.x][move.y] = AI;
    let score = _alphaBetaPruning(depth, board, -Infinity, Infinity, false);
    board[move.x][move.y] = game.none;
    console.log("Score:", score);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

  }
  console.timeEnd("ai best move reply time");
  console.log("move at", bestMove, "with score", bestScore, "at depth", depth);
  board[bestMove.x][bestMove.y] = AI;
  game.previousMove = bestMove;
  currentPlayer = humanPlayer;
}


// function _minimax(depth, board, isMaxing) {
//   let result = evaluation(board);

//   if (depth == 0 || result !== null)
//     return result;
  
//   if (isMaxing) {
//     let maxScore = -Infinity;
//     for (const move of getLegalMoves(board)) {
//       // board[move.x][move.y] = game.X;
//       let truePreviousMove = game.previousMove;
//       // makeMove(move, board, game.X);
//       board[move.x][move.y] = game.X;
//       game.previousMove = move;
//       let score = _minimax(depth - 1, board, false);
//       board[move.x][move.y] = game.none;
//       game.previousMove = truePreviousMove;
//       maxScore = max(maxScore, score);
//     }

//     return maxScore;
//   } else if (!isMaxing) {
//     let minScore = Infinity;
//     for (const move of getLegalMoves(board)) {
//       let truePreviousMove = game.previousMove;     // Make Move
//       board[move.x][move.y] = game.O;
//       game.previousMove = move;
//       let score = _minimax(depth - 1, board, true); // Evaluate
//       board[move.x][move.y] = game.none;
//       game.previousMove = truePreviousMove;
//       minScore = min(minScore, score);
//     }

//     return minScore;
//   }

// }

// 
function _alphaBetaPruning(depth, board, alpha, beta, isMaxing) {
  let result = evaluate();

  findSubBoardWins(board, false);
  const absoluteWinner = boardWinCheck();
  if (absoluteWinner == humanPlayer)
    return -Infinity;
  else if (absoluteWinner == AI)
    return Infinity;

  // if (result !== null)
  if (depth === 0)
    return result;
  
  if (isMaxing) {
    let maxScore = -Infinity;
    for (const move of getLegalMoves(board)) {
      let truePreviousMove = game.previousMove;
      let previousSubBoardState = subBoardStates.map((row) => row.slice(0));   // Shallow copy
      board[move.x][move.y] = AI;
      game.previousMove = move;
      let score = _alphaBetaPruning(depth - 1, board, alpha, beta, false);
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      subBoardStates = previousSubBoardState;
      maxScore = max(maxScore, score);
      alpha = max(alpha, score);
      if (beta <= alpha)
        break;
    }
    return maxScore;
  } 
  else if (!isMaxing) {
    let minScore = Infinity;
    for (const move of getLegalMoves(board)) {
      // Make move
      let previousSubBoardState = subBoardStates.map( (row) => row.slice(0));
      let truePreviousMove = game.previousMove;
      board[move.x][move.y] = humanPlayer;
      game.previousMove = move;
      // Evaluate
      let score = _alphaBetaPruning(depth - 1, board, alpha, beta, true);
      // Undo
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      subBoardStates = previousSubBoardState;
      // find minimum and prune if necessary
      minScore = min(minScore, score);
      beta = min(beta, score);
      if (beta <= alpha)
        break;
    }

    return minScore;
  }

}

function getLegalMoves(board) {
    const moves = [];
    
    for (let xs = 0; xs < boardLen; xs++) {
        for (let ys = 0; ys < boardLen; ys++) {
            if (isValid(ys, xs, board))
              moves.push({x: ys, y: xs});
        }
    }

    return moves;
}

function doMove(move, board, player) {
  board[move.x][move.y] = player;
  game.previousMove = move;
}

// function undoMove(move, board) {

// }

const lineScore = [];
lineScore[0] = 0;
lineScore[AI] = 1;
lineScore[humanPlayer] = -1;
  
// Evaluate the current state of the game.
// TODO: moves that send a player to a full sub-board are bad?#
// +Score when we are close 2/3 of completing a winning line
// -Score if enemy is 2/3 of completing a winning line.
// -Score if enemy blocked our 2/3 line
// +Score if we block enemy line
function evaluate() {
  let evalu = null;

  // For every square, if we point to a complete sub-board then -, and the enemy does then +
  for (let x = 0; x < boardLen; x++) {
    for (let y = 0; y < boardLen; y++) {
      let square = board[x][y];
      let subBoard = nextCorrespondingSubBoard(x, y);
      let subBoardPointedTo = subBoardStates[subBoard.x][subBoard.y];
      // let subBoardIsFull = getSubBoardSquares(board, subBoard.y, subBoard.x).every( (sq) => sq == game.X || sq == game.O);
      if (subBoardPointedTo != game.none) {
        // console.log(x, y, square);
        if (square == AI)
          evalu -= 20;
        else if (square == humanPlayer)
          evalu += 20;
      } 
    }
  }

  // For every sub-board, match any winning lines and modify the score accordingly
  for (let xOffset = 0; xOffset < 3; xOffset++) {
    for (let yOffset = 0; yOffset < 3; yOffset++) {
      for (const l of winningLines) {

        let winner = subBoardWinCheck(board, l, yOffset, xOffset);
        if (winner === AI) {
          evalu += 100;
        } else if (winner === humanPlayer) {
          evalu -= 100;
        } 

        // No need to evaluate line values for sub-boards that have already been won
        if (!winner) { 
          var lineP1 = board[l[0][0] + (yOffset * 3)][l[0][1] + (xOffset * 3)];
          var lineP2 = board[l[1][0] + (yOffset * 3)][l[1][1] + (xOffset * 3)];
          var lineP3 = board[l[2][0] + (yOffset * 3)][l[2][1] + (xOffset * 3)];
          var currentLineScore = lineScore[lineP1] + lineScore[lineP2] + lineScore[lineP3];
        }

        // If there's a sub-board with two or more X's or O's in a line
        if (abs(currentLineScore) > 1)
          evalu += currentLineScore;

        currentLineScore = 0;
      }
    }
  }
  return evalu;
}