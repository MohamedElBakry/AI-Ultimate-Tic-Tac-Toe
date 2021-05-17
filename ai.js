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
  for (const move of getMoves(board)) {
    board[move.x][move.y] = game.X;
    let score = _minimax(1, board, false);
    board[move.x][move.y] = game.none;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (game.gameOver || game.draw)
    return;
    
  board[bestMove.x][bestMove.y] = game.X;
  currentPlayer = game.O;
}

function _minimax(depth, board, isMaxing) {
  let result = evaluation(board);
  if (result !== null)
    return result;
  
  if (isMaxing) {
    let maxScore = -Infinity;
    for (const move of getMoves(board)) {
      board[move.x][move.y] = game.X;
      let score = _minimax(depth, board, false);
      board[move.x][move.y] = game.none;
      maxScore = max(maxScore, score);
    }

    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of getMoves(board)) {
      board[move.x][move.y] = game.O;
      let score = _minimax(depth, board, true);
      board[move.x][move.y] = game.none;
      minScore = min(minScore, score);
    }

    return minScore;
  }

}

function getMoves(board) {
    let moves = [];
    for (let x = 0; x < boardLen; x++) {
        for (let y = 0; y < boardLen; y++) {
            if (isValid(x, y, board))
                moves.push({x, y});
        }
    }

    return moves;
}

// TODO: Update evaluation function as drawSubBoardWin's functionallity has changed.
// As has the game.
function evaluation(board) {
    let evalu = null;
    const player = game.X;

    if (drawSubBoardWin(board, player)[0])
        evalu = 1;
    else if (isDraw(board)) 
        evalu = 0;
    else if (drawSubBoardWin(board, getNext(player))[0])
        evalu = -1;

    return evalu;
}
