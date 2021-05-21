/** Basic MCTS Algorithm 
 * Begin at S_0 (initial State 0)
 * If this is a leaf node:
 *      if this is the first visit then:
 *           we do a @method rollout
 * 
 *      otherwise: for each available:
 *          action add a new state to the tree, thus, creating state child nodes
 *          let current = first new child node
 *          @method rollout
 *      
 * Otherwise: 
 *      let current node = child node that maximises the UCB1(State_i) -- maximises the current state
 * 
 */
class MCTSNode {

    constructor(parent) {
        this.parent = parent;


        this.valueT = 0;
        this.visitsN = 0;
    }

    /** Based on the following criteria, a child node is selected:
     * 
     */
    selectChildNode() {

    }

    /** The simulation of randomly chosen actions until a terminal state is reached
     * i.e., until the game is over.  
     * This is followed by @method backPropagate which sends the values and visits
     * back up the tree to the parent nodes.
     */
    rollout(state) {

        while (true) {
            if (state === game.gameOver)
                return value(state);                        // Add valuation +1 if win -1 if loss, 0 if draw

            let moveActions = random(getLegalMoves(state))      // Change getLegalMoves parameters
            state = simulate(moveActions, state)
        }
            
    }

    backPropagate() {
        if (!this.parent)
            return;
        
        this.parent.visitsN += 1; 
    }

    calculateUCB1() {

        return 
    }
}

class State {
    
    /** Create a copy of the board and subBoardStates to allow for modification during simulation
     *  without the need for proper undoing of moves/actions
     * @param {number[][]} board 
     * @param {number[][]} subBoardStates 
     * @param {{y: number, x: number}} previousMove         // This is just an object with an x and y number component.
     * @param {number} turn 
     */
    constructor(board, subBoardStates, previousMove, turn, doCopy) {
        // this.board = (doCopy) ? board.map((row) => [...row]) : board;
        // this.subBoardStates = (doCopy) ? subBoardStates.map((row) => [...row]) : subBoardStates;
        // Array.prototype.slice is more performant than the spread operator ([...Array]), so the former is now used
        this.board = (doCopy) ? board.map((row) => row.slice(0)) : board;
        this.subBoardStates = (doCopy) ? subBoardStates.map((row) => row.slice(0)) : subBoardStates;
        this.previousMove = previousMove;
        this.turn = turn;
    }
}
