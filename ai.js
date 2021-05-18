const horizontalWin = [ [[0, 0], [0, 1], [0, 2]], 
                      [[1, 0], [1, 1], [1, 2]],
                      [[2, 0], [2, 1], [2, 2]] ];

const verticalWin = [ [[0, 0], [1, 0], [2, 0]], 
                    [[0, 1], [1, 1], [2, 1]],
                    [[0, 2], [1, 2], [2, 2]] ];

const diagonalWin = [ [[0, 0], [1, 1], [2, 2]],
                    [[0, 2], [1, 1], [2, 0]] ];

const winningLines = horizontalWin.concat(verticalWin).concat(diagonalWin);

function _bestMove() {
  let bestScore = -Infinity;
  let bestMove;

  for (const move of getLegalMoves(board)) {
    board[move.x][move.y] = game.X;
    let score = _alphaBetaPruning(3, board, -Infinity, Infinity, false);
    board[move.x][move.y] = game.none;
    print("Score:", score);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

  }
  
  board[bestMove.x][bestMove.y] = game.X;
  game.previousMove = bestMove;
  currentPlayer = game.O;
}

// alpha beta pruning
function _minimax(depth, board, isMaxing) {
  let result = evaluation(board);
  // if (subBoardWinCheck() === game.X)
  //   return Infinity;
  // else if (subBoardWinCheck() === game.O)
  //   return -Infinity;

  if (depth == 0 || result !== null)
    return result;
  
  if (isMaxing) {
    let maxScore = -Infinity;
    for (const move of getLegalMoves(board)) {
      // board[move.x][move.y] = game.X;
      let truePreviousMove = game.previousMove;
      // makeMove(move, board, game.X);
      board[move.x][move.y] = game.X;
      game.previousMove = move;
      let score = _minimax(depth - 1, board, false);
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      maxScore = max(maxScore, score);
    }

    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of getLegalMoves(board)) {
      let truePreviousMove = game.previousMove;
      board[move.x][move.y] = game.O;
      game.previousMove = move;
      let score = _minimax(depth - 1, board, true);
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      minScore = min(minScore, score);
    }

    return minScore;
  }

}

function _alphaBetaPruning(depth, board, alpha, beta, isMaxing) {
  let result = evaluation(board);
  // print(result);

  // const absoluteWinner = subBoardWinCheck();
  // if (absoluteWinner === game.X)
  //   return Infinity;
  // else if (absoluteWinner === game.O)
  //   return -Infinity;


  if (depth == 0 || result !== null)
    return result;
  
  if (isMaxing) {
    let maxScore = -Infinity;
    for (const move of getLegalMoves(board)) {
      let truePreviousMove = game.previousMove;
      board[move.x][move.y] = game.X;
      game.previousMove = move;
      let score = _alphaBetaPruning(depth - 1, board, alpha, beta, false);
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      maxScore = max(maxScore, score);
      alpha = max(alpha, score);
      if (beta <= alpha)
        break;
    }

    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of getLegalMoves(board)) {
      let truePreviousMove = game.previousMove;
      board[move.x][move.y] = game.O;
      game.previousMove = move;
      let score = _alphaBetaPruning(depth - 1, board, alpha, beta, true);
      board[move.x][move.y] = game.none;
      game.previousMove = truePreviousMove;
      minScore = min(minScore, score);
      beta = min(beta, score);
      if (beta <= alpha)
        break;
    }

    return minScore;
  }

}

function getLegalMoves(board) {
    let moves = [];
    for (let x = 0; x < boardLen; x++) {
        for (let y = 0; y < boardLen; y++) {
            if (isValid(x, y, board))
                moves.push({x, y});
        }
    }

    return moves;
}

function makeMove(move, board, player) {
  board[move.x][move.y] = player;
  game.previousMove = move;
}


// TODO: Update evaluation function as drawSubBoardWin's functionallity has changed.
// As has the game.

// Evaluate the current state of the game.
function evaluation(board) {
  let evalu = null;

  //  subBoardIsFull(board, 0, 0).every( (sq) => sq != game.none);
  for (let xOffset = 0; xOffset < 3; xOffset++) {
    for (let yOffset = 0; yOffset < 3; yOffset++) {
      for (const _line of winningLines) {

        let winner = subBoardWinCheck(board, _line, yOffset, xOffset);
        if (winner === game.X) {
          evalu += 1;
        } else if (winner === game.O) {
          evalu -= 1;
        } else if (getSubBoardSquares(board, xOffset, yOffset).every( (sq) => sq != game.none)) {
          evalu += 0;
        }

      }
    }
  }

  return evalu;
}
