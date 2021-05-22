/** Intelligent Agent Class
 * Provides a way for selecting the type of agent and getting their moves for Ultimate Tic Tac Toe.
 */
class Agent {

    static type = {
      MINIMAX_ALPHA_BETA_PRUNING: 0
    }

    static piece = {
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
        this.opponentPiece = getNext(piece);
    }


    /** Generates an array of {x, y} object legal moves given the board state.
     * @param {State} state The current state of the game.
     * @returns {object[]} An array of objects with X and Y components representing a list of legal moves given the state.
     */
    static getLegalMoves(state) {
      const moves = [];

      for (let xs = 0; xs < state.board.length; xs++) {
          for (let ys = 0; ys < state.board.length; ys++) {
              if (isValid(ys, xs, state))
                moves.push({x: ys, y: xs});
          }
      }

      return moves;
  }

    /** Searches for the optimal move given the game state.
     * Uses @method miniMaxAlphaBetaPruning to find the value of each legal move up to a depth.
     * @param {number} [depth=6] -          The maximum search depth, which by default is 6.
     * @param {State} [state=this.state] -  The current state of the game. If null, the internal reference to the game state is used.
     */
    playOptimalMove(depth, state) {
      if (!depth)
        depth = 6;

      if (!state)
        state = this.state;

        const LONG_SEARCH = depth;
        const SHORT_SEARCH = 4;

        let bestScore = -Infinity;
        let bestMove;
        let localState = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);
        console.time("ai best move reply time");

        const moves = Agent.getLegalMoves(localState);
        const _depth = (moves.length <= 9) ? LONG_SEARCH : SHORT_SEARCH;
        let i = 0;
        for (const move of moves) {
            i++;
            localState.board[move.x][move.y] = this.piece;
            localState.previousMove = move;
            localState = new State(localState.board, localState.subBoardStates, localState.previousMove, localState.turn, true);
            const score = this.miniMaxAlphaBetaPruning(_depth, localState, -Infinity, Infinity, false);
            localState.board[move.x][move.y] = game.none;
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
        state.turn = this.opponentPiece;

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

        const nearWinEnemySubBoards = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
          ];

        const lineScore = [];
        const lineUnit = 2;
        lineScore[0] = 0;
        lineScore[this.piece] = lineUnit;
        lineScore[this.opponentPiece] = -lineUnit;

        // For every sub-board, match any winning lines and modify the score accordingly
        for (let xOffset = 0; xOffset < 3; xOffset++) {
          for (let yOffset = 0; yOffset < 3; yOffset++) {
            for (const l of winningLines) {

                let winner = subBoardWinCheck(state.board, l, yOffset, xOffset);
                if (winner === this.piece) {
                    evalu += 100;
                // if (xOffset == 1 && yOffset == 1)   // Extra reward for winning the centre sub-board
                //   evalu += 100;
                } else if (winner === this.opponentPiece) {
                    evalu -= 100;
                }

                var lineP1 = state.board[l[0][0] + (yOffset * 3)][l[0][1] + (xOffset * 3)];
                var lineP2 = state.board[l[1][0] + (yOffset * 3)][l[1][1] + (xOffset * 3)];
                var lineP3 = state.board[l[2][0] + (yOffset * 3)][l[2][1] + (xOffset * 3)];
                var currentLineScore = lineScore[lineP1] + lineScore[lineP2] + lineScore[lineP3];

              // If there's a sub-board with two or more X's or O's in a line inside it
                if (abs(currentLineScore) > lineScore[this.piece]) {
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

          if (abs(currentSBLineScore) > lineScore[this.piece]) {
            evalu += currentSBLineScore;
          }
          currentSBLineScore = 0;
        }

        // For every square, if we point to a complete sub-board then -score, and if the enemy does the same +score.
        // If we point to a near completed sub-board then - points again, and vice versa.
        for (let x = 0; x < BOARD_LEN; x++) {
          for (let y = 0; y < BOARD_LEN; y++) {
            const square = state.board[x][y];
            const subBoard = getNextSubBoard(x, y);
            const subBoardPointedTo = state.subBoardStates[subBoard.x][subBoard.y];
            const isNearWonEnemySubBoard = nearWinEnemySubBoards[subBoard.x][subBoard.y];
            // let subBoardIsFull = getSubBoardSquares(board, subBoard.y, subBoard.x).every( (sq) => sq == game.X || sq == game.O);
            if (subBoardPointedTo != game.none || isNearWonEnemySubBoard) {
              if (square == this.piece)
                evalu -= 50;
              else if (square == this.opponentPiece)
                evalu += 50;
            }
          }
        }

        return evalu;
      }


      /**
       * Given a game state, state, the algorithm gives each side a turn to generate a the legal moves.
       * Cycling through every move and the board permutation (up to a max depth), and its legal moves based on that in a branching manner.
       * This process continues until the depth which is decremented each time reaches 0.
       * The parameters alpha and beta are used to prune the search as this algorithm assumes that both parties are playing optimally.
       * Hence, the minimising player is assumed to play moves which 'negatively' impact or decrease the score of the maxing player by as much as possible.
       * Therefore, the most minimising move is stored in beta and compared with the scores / utilities of other moves branches.
       * The result on average is a significant decrease in the moves searched for or to.
       * @param {number} depth The maximum depth to search to before returning the value result.
       * @param {State} [state=this.state] The current state of the game.
       * @param {number} alpha The alpha value which is the best alternative (score or utility) for the maxing player (agent).
       * @param {number} beta Likewise, the beta value which is the the best alternative for the min player.
       * @param {boolean} isMaxing Indicates whether the it's the maxing player's turn or not.
       * Moves are generated for them if isMaxing is true. The opposite applies.
       */
      miniMaxAlphaBetaPruning(depth, state, alpha, beta, isMaxing) {

        findSubBoardWins(state, false);
        const absoluteWinner = boardWinCheck(state.subBoardStates);
        if (absoluteWinner === this.opponentPiece)
          return -Infinity;
        else if (absoluteWinner === this.piece)
          return Infinity;

        const utilityScore = this.evaluate(state);
        if (depth === 0)
          return utilityScore;

        state = new State(state.board, state.subBoardStates, state.previousMove, state.turn, true);

        if (isMaxing) {
            let maxScore = -Infinity;
            for (const move of Agent.getLegalMoves(state)) {
                // Make move
                state.board[move.x][move.y] = this.piece;
                state.previousMove = move;
                // Evaluate
                const score = this.miniMaxAlphaBetaPruning(depth - 1, state, alpha, beta, false);
                // Undo
                state.board[move.x][move.y] = game.none;
                // Get max the max utility and prune if necessary
                maxScore = max(maxScore, score);
                alpha = max(alpha, score);
                if (beta <= alpha)
                    break;
            }
            return maxScore;
        }
        else if (!isMaxing) {
            let minScore = Infinity;
            for (const move of Agent.getLegalMoves(state)) {
                // Make move
                state.board[move.x][move.y] = this.opponentPiece;
                state.previousMove = move;
                // Evaluate
                const score = this.miniMaxAlphaBetaPruning(depth - 1, state, alpha, beta, true);
                // Undo
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
