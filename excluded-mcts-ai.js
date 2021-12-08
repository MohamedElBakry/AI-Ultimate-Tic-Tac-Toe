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

        return;
    }
}