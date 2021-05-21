// const AI = 1; // 2 == game.O
// const humanPlayer = 2; // 1 == game.X

/** Intelligent Agent Class
 * Provides an interface for selecting the type of intelligent agent and getting their moves for Ultimate Tic Tac Toe.
 */
class Agent {

    type = {
        MINIMAX_ALPHA_BETA_PRUNING: 0
    }

    piece = {
        X: 1,
        O: 2
    }

    /**
     * @param {State} state                         The current 'state' of the game. 
     * @param {Agent.type|number} type              The type of agent to be initialised. Future iterations of this project should include an MCTS type agent
     * @param {Agent.piece|number} [piece=piece.X]  The type of piece to use. 
     */
    constructor(state, type, piece) {
        this.state = state;
        this.type = type;
        this.piece = piece;
    }

    /** Searches for the optimal move given the game state.
     * Uses @method miniMaxAlphaBetaPruning to find the value of each legal move up to a depth.
     * @param {State} [state=this.state] -  The current state of the game. If null, the internal reference to the game state is used.
     * @param {number} [depth=6] -          The maximum search depth, which by default is 6.
     */
    searchOptimal(state, depth) {
        if (!state)
            state = this.state;
        
        if (!depth) 
            depth = 6;

        const LONG_SEARCH = depth;
        const SHORT_SEARCH = 4;

        let bestScore = -Infinity;
        let bestMove;
        let localState = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
        console.time("ai best move reply time");

        const moves = getLegalMoves(localState);
        const _depth = (moves.length <= 9) ? LONG_SEARCH : SHORT_SEARCH;
        let i = 0;
        for (const move of moves) {
            i++;
            let truePreviousMove = localState.previousMove;
            localState.board[move.x][move.y] = this.piece;
            localState.previousMove = move;
            localState = new State(localState.board, localState.subBoardStates, localState.previousMove, localState.turn, true);
            let score = this.miniMaxAlphaBetaPruning(_depth, localState, -Infinity, Infinity, false);
            localState.board[move.x][move.y] = game.none;
            localState.previousMove = truePreviousMove;
            console.log(`Score (${i}/${moves.length}):`, score);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

        }

        // If no move has been found then just select the final move anyway as they are all leading to a loss
        if (bestScore == -Infinity) {
            bestMove = moves[moves.length - 1];
            console.log("High probability of loss detected, picking the final move.");
        }

        console.timeEnd("ai best move reply time");
        console.log("move at", bestMove, "with score", bestScore, "at depth", depth);

        state.board[bestMove.x][bestMove.y] = this.piece;
        state.previousMove = bestMove;
        state.turn = humanPlayer;   // TODO:  change this to be dynamically chosen -- i.e. the opposite of this.piece

        return bestMove;

        
    }

    /** Evaluates the current state of the game by assessing a number of criteria.
     * These criteria include a basic sum of sub-boards won by the agent, and its opponent.
     * Also whether pieces point towards sub-boards that are won, or almost won. This is discouraged as such moves allow the opponent to play anywhere they want.
     * If pieces of the same type are almost forming a winning line (e.g. horizontal, vertical or diagonal).
     * @param {State} [state=this.state] Optional - The current state of the game. If not passed as an argument, the Agent's reference when initialised will be used. 
     * @returns {number} A numerical evaluation of the current state of the game. Higher means the state favours the Agent.
     */
    evaluate(state) {
        let evalu = null;
        
        // Make state a default parameter.
        if (!state)
            state = this.state;

        let nearWinEnemySubBoards = [
            [false, false, false],   
            [false, false, false],
            [false, false, false],
          ];
      
        // For every sub-board, match any winning lines and modify the score accordingly
        for (let xOffset = 0; xOffset < 3; xOffset++) {
          for (let yOffset = 0; yOffset < 3; yOffset++) {
            for (const l of winningLines) {
      
                let winner = subBoardWinCheck(state.board, l, yOffset, xOffset);
                if (winner === AI) {
                    evalu += 100;
                // if (xOffset == 1 && yOffset == 1)   // Extra reward for winning the centre sub-board
                //   evalu += 100;
                } else if (winner === humanPlayer) {
                    evalu -= 100;
                } 
      
                var lineP1 = state.board[l[0][0] + (yOffset * 3)][l[0][1] + (xOffset * 3)];
                var lineP2 = state.board[l[1][0] + (yOffset * 3)][l[1][1] + (xOffset * 3)];
                var lineP3 = state.board[l[2][0] + (yOffset * 3)][l[2][1] + (xOffset * 3)];
                var currentLineScore = lineScore[lineP1] + lineScore[lineP2] + lineScore[lineP3];
      
              // If there's a sub-board with two or more X's or O's in a line inside it
                if (abs(currentLineScore) > lineScore[AI]) {
                    evalu += currentLineScore;
                    nearWinEnemySubBoards[yOffset][xOffset] = true;
              }
              // Reset the score for the next winning line
              currentLineScore = 0;
            }
          }
        }
      
        /* Do the same as above for sub-boards in the context of the full board
        Thus, we favour won sub-boards that are within proximity each other for us, and spread out for the opponent
        So a game winning line can be more easily found for us and less so for the opponent if given the option.
        Add up each sub-board line point (x, y) based on whose piece is there.  */
        for (let sbLine = 0; sbLine < winningLines.length; sbLine++) {
          let subBoardLinePoint1 = state.subBoardStates[winningLines[sbLine][0][0]][winningLines[sbLine][0][1]];
          let subBoardLinePoint2 = state.subBoardStates[winningLines[sbLine][1][0]][winningLines[sbLine][1][1]];
          let subBoardLinePoint3 = state.subBoardStates[winningLines[sbLine][2][0]][winningLines[sbLine][2][1]];
          let currentSBLineScore = lineScore[subBoardLinePoint1] + lineScore[subBoardLinePoint2] + lineScore[subBoardLinePoint3];
      
          if (abs(currentSBLineScore) > lineScore[AI]) {
            evalu += currentSBLineScore;
          }
          currentSBLineScore = 0;
        }
      
        // For every square, if we point to a complete sub-board then -score, and if the enemy does the same +score.
        // If we point to a near completed sub-board then - points again, and vice versa.
        for (let x = 0; x < boardLen; x++) {
          for (let y = 0; y < boardLen; y++) {
            const square = state.board[x][y];
            const subBoard = getNextSubBoard(x, y);
            const subBoardPointedTo = state.subBoardStates[subBoard.x][subBoard.y];
            const isNearWonEnemySubBoard = nearWinEnemySubBoards[subBoard.x][subBoard.y];
            // let subBoardIsFull = getSubBoardSquares(board, subBoard.y, subBoard.x).every( (sq) => sq == game.X || sq == game.O);
            if (subBoardPointedTo != game.none || isNearWonEnemySubBoard) {
              if (square == AI)
                evalu -= 50;
              else if (square == humanPlayer)
                evalu += 50;
            } 
          }
        }
      
        return evalu;
      }

      /** 
       * @param {number} depth The maximum depth to search to before returning the value result.
       * @param {State} [state=this.state] The current state of the game.
       * @param {number} alpha The alpha value which is the best alternative (score or utility) for the maxing player (agent).
       * @param {number} beta Likewise, the beta value which is the the best alternative for the min player.
       * @param {boolean} isMaxing Indicates whether the it's the maxing player's turn or not. Moves are generated for them if isMaxing is true. The opposite applies. 
       * Given a game state, state, the algorithm gives each side a turn to generate a the legal moves. 
       * Cycling through every move and the board permutations, and its legal moves based on that in a branching manner. 
       * This process continues until the depth which is decremented each time reaches 0.
       * The parameters alpha and beta are used to prune the search as this algorithm assumes that both parties are playing optimally.
       * Hence, the minimising player is assumed to play moves which 'negatively' impact or decrease the score of the maxing player by as much as possible.
       * Therefore, the most minimising move is stored in beta and compared with the scores / utilities of other moves branches.
       * The result on average is a significant decrease in the moves searched for or to.
       */
      miniMaxAlphaBetaPruning(depth, state, alpha, beta, isMaxing) {

        findSubBoardWins(state, false);
        const absoluteWinner = boardWinCheck(state.subBoardStates);
        if (absoluteWinner === humanPlayer)
          return -Infinity;
        else if (absoluteWinner === AI)
          return Infinity;
        
        const utilityScore = evaluate(state);
        if (depth === 0)
          return utilityScore;
        
        state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
          
        if (isMaxing) {
            let maxScore = -Infinity;
            for (const move of getLegalMoves(state)) {
            let truePreviousMove = state.previousMove;
            // state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
            state.board[move.x][move.y] = AI;
            state.previousMove = move;
        
            let score = _alphaBetaPruning(depth - 1, state, alpha, beta, false);
            // state.previousMove = truePreviousMove;
            state.board[move.x][move.y] = game.none;
            maxScore = max(maxScore, score);
            alpha = max(alpha, score);
            if (beta <= alpha)
                break;
            }
            return maxScore;
        } 
        else if (!isMaxing) {
            let minScore = Infinity;
            for (const move of getLegalMoves(state)) {
            // Make move
            // let previousSubBoardState = subBoardStates.map( (row) => row.slice(0));
            let truePreviousMove = state.previousMove;
            // state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
            state.board[move.x][move.y] = humanPlayer;
            state.previousMove = move;
            // Evaluate
            let score = _alphaBetaPruning(depth - 1, state, alpha, beta, true);
            // Undo
            // state.previousMove = truePreviousMove;
            state.board[move.x][move.y] = game.none;
            // find minimum and prune if necessary
            minScore = min(minScore, score);
            beta = min(beta, score);
            if (beta <= alpha)
                break;
            }
            return minScore;
        }
    }

    
}

function _bestMove() {
  let bestScore = -Infinity;
  let bestMove;
  let localState = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
  console.time("ai best move reply time");

  const moves = getLegalMoves(localState);
  const depth = (moves.length <= 9) ? 6 : 4;
  let i = 0;
  for (const move of moves) {
    i++;
    let truePreviousMove = localState.previousMove;
    localState.board[move.x][move.y] = AI;
    localState.previousMove = move;
    localState = new State(localState.board, localState.subBoardStates, localState.previousMove, localState.turn, true);
    let score = _alphaBetaPruning(depth, localState, -Infinity, Infinity, false);
    localState.board[move.x][move.y] = game.none;
    localState.previousMove = truePreviousMove;
    console.log(`Score (${i}/${moves.length}):`, score);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

  }

  // If no move has been found then just select the final move anyway as they are all leading to a loss
  if (bestScore == -Infinity) {
    bestMove = moves[moves.length - 1];
    console.log("High probability of loss detected, picking the final move.");
  }

  console.timeEnd("ai best move reply time");
  console.log("move at", bestMove, "with score", bestScore, "at depth", depth);

  state.board[bestMove.x][bestMove.y] = AI;
  state.previousMove = bestMove;
  state.turn = humanPlayer;

  return bestMove;
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

function _alphaBetaPruning(depth, state, alpha, beta, isMaxing) {
  
  findSubBoardWins(state, false);
  let absoluteWinner = boardWinCheck(state.subBoardStates);
  if (absoluteWinner === humanPlayer)
    return -Infinity;
  else if (absoluteWinner === AI)
    return Infinity;
  
  let result = evaluate(state);
  // if (result !== null)
  if (depth === 0)
    return result;
  
    state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
    
    if (isMaxing) {
      let maxScore = -Infinity;
    for (const move of getLegalMoves(state)) {
      let truePreviousMove = state.previousMove;
      // state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
      state.board[move.x][move.y] = AI;
      state.previousMove = move;

      let score = _alphaBetaPruning(depth - 1, state, alpha, beta, false);
      // state.previousMove = truePreviousMove;
      state.board[move.x][move.y] = game.none;
      maxScore = max(maxScore, score);
      alpha = max(alpha, score);
      if (beta <= alpha)
        break;
    }
    return maxScore;
  } 
  else if (!isMaxing) {
    let minScore = Infinity;
    for (const move of getLegalMoves(state)) {
      // Make move
      // let previousSubBoardState = subBoardStates.map( (row) => row.slice(0));
      let truePreviousMove = state.previousMove;
      // state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
      state.board[move.x][move.y] = humanPlayer;
      state.previousMove = move;
      // Evaluate
      let score = _alphaBetaPruning(depth - 1, state, alpha, beta, true);
      // Undo
      // state.previousMove = truePreviousMove;
      state.board[move.x][move.y] = game.none;
      // find minimum and prune if necessary
      minScore = min(minScore, score);
      beta = min(beta, score);
      if (beta <= alpha)
        break;
    }

    return minScore;
  }

}

function getLegalMoves(state) {
    const moves = [];
    
    for (let xs = 0; xs < boardLen; xs++) {
        for (let ys = 0; ys < boardLen; ys++) {
            if (isValid(ys, xs, state))
              moves.push({x: ys, y: xs});
        }
    }

    return moves;
}

function doMove(move, board, player) {
  board[move.x][move.y] = player;
  game.previousMove = move;
}

const lineScore = [];
const lineUnit = 2;
lineScore[0] = 0;
lineScore[AI] = lineUnit;
lineScore[humanPlayer] = -lineUnit;
  
// Evaluate the current state of the game.
// TODO: moves that send a player to a full sub-board are bad?#
// +Score when we are close 2/3 of completing a winning line
// -Score if enemy is 2/3 of completing a winning line.
// -Score if enemy blocked our 2/3 line
// +Score if we block enemy line
let nearWinEnemySubBoards = [
  [false, false, false],   
  [false, false, false],
  [false, false, false],
];
function evaluate(state) {
  let evalu = null;
  nearWinEnemySubBoards.map((row) => row.fill(false));

  // For every sub-board, match any winning lines and modify the score accordingly
  for (let xOffset = 0; xOffset < 3; xOffset++) {
    for (let yOffset = 0; yOffset < 3; yOffset++) {
      for (const l of winningLines) {

        let winner = subBoardWinCheck(state.board, l, yOffset, xOffset);
        if (winner === AI) {
          evalu += 100;
          // if (xOffset == 1 && yOffset == 1)   // Extra reward for winning the centre sub-board
          //   evalu += 100;
        } else if (winner === humanPlayer) {
          evalu -= 100;
        } 

        // No need to evaluate line values for sub-boards that have already been won
        // if (!winner) { 
          var lineP1 = state.board[l[0][0] + (yOffset * 3)][l[0][1] + (xOffset * 3)];
          var lineP2 = state.board[l[1][0] + (yOffset * 3)][l[1][1] + (xOffset * 3)];
          var lineP3 = state.board[l[2][0] + (yOffset * 3)][l[2][1] + (xOffset * 3)];
          var currentLineScore = lineScore[lineP1] + lineScore[lineP2] + lineScore[lineP3];
        // }

        // If there's a sub-board with two or more X's or O's in a line inside it
        if (abs(currentLineScore) > lineScore[AI]) {
          evalu += currentLineScore;
          
          // If the line score is negative then this is an enemy sub-board
          // nearWinEnemySubBoards[yOffset][xOffset] = (currentLineScore < -1) ? true : false;
          nearWinEnemySubBoards[yOffset][xOffset] = true;
        }
        currentLineScore = 0;

      }
    }
  }

  // Do the same for sub-boards in the context of the full board
  // This way, we favour won sub-boards that are within proximity each other for us, and spread out for the opponent
  // So a game winning line can be more easily found for us and less so for the opponent.
  for (let sbLine = 0; sbLine < winningLines.length; sbLine++) {
    let sbLineP1 = state.subBoardStates[winningLines[sbLine][0][0]][winningLines[sbLine][0][1]];
    let sbLineP2 = state.subBoardStates[winningLines[sbLine][1][0]][winningLines[sbLine][1][1]];
    let sbLineP3 = state.subBoardStates[winningLines[sbLine][2][0]][winningLines[sbLine][2][1]];
    let currentSBLineScore = lineScore[sbLineP1] + lineScore[sbLineP2] + lineScore[sbLineP3];

    if (abs(currentSBLineScore) > lineScore[AI]) {
      evalu += currentSBLineScore;
    }
    currentSBLineScore = 0;
  }

  // For every square, if we point to a complete sub-board then -, and the enemy does then +
  // If we point to a near completed sub-board then - points again.
  for (let x = 0; x < boardLen; x++) {
    for (let y = 0; y < boardLen; y++) {
      let square = state.board[x][y];
      let subBoard = getNextSubBoard(x, y);
      let subBoardPointedTo = state.subBoardStates[subBoard.x][subBoard.y];
      let isNearWonEnemySubBoard = nearWinEnemySubBoards[subBoard.x][subBoard.y];
      // let subBoardIsFull = getSubBoardSquares(board, subBoard.y, subBoard.x).every( (sq) => sq == game.X || sq == game.O);
      if (subBoardPointedTo != game.none || isNearWonEnemySubBoard) {
        // console.log(x, y, square);
        if (square == AI)
          evalu -= 50;
        else if (square == humanPlayer)
          evalu += 50;
      } 
    }
  }

  return evalu;
}