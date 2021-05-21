const MCTS_CHOSEN_CONSTANT = 2;

class MCTS_Node {

    // Init
    constructor(State, parent) {
        this.State = State;
        this.parent = parent;

        // MCTS values
        this.hits = 0;              // Wins
        this.misses = 0;            // Losses
        this.samples = 0;           // Total Samples
    }

    /* Methods */
    chooseChild() {
        // If this node has no children, create them
        // I.e., get all legal moves from this node's board state
        if (!this.children)
            this.children = getChildren(this.State, this);

        // If this node is a leaf node, run a simulation and back-propagate the results/score
        if (this.children.length === 0)
            this.runSimulation();
        
        else {
            // Get any unexplored/unvisited children
            let unexplored = [];
            for (let i = 0; i < this.children.length; i++) 
                if (this.children[i].totalTrails === 0)
                    unexplored.push(this.children[i]);

            // for (const child of this.children)
            //     if (child.totalTrails === 0)
            //         unexplored.push(child);

            // Pick a unexplored child node and run a simulation on it
            if (unexplored.length > 0)
                random(unexplored).runSimulation();     // P5.js function which randomly selects an array element
            
            else {
                // Find the best child
                let bestChild = this.children
                let bestPotential = childPotential(this, this.children[0])
                let potential;

                for (const child of this.children) {
                    potential = childPotential(this, child);
                    if (potential > bestPotential) {
                        bestPotential = potential;
                        bestChild = child;
                    }
                }
                bestChild.chooseChild();
            }    
        }
    }

    runSimulation() {
        this.backPropagate(simulate(this.State));
    }

    backPropagate(simulation) {
        if (simulation > 0)
            this.hits++;
        else if (simulation < 0)
            this.misses++;
        
        this.samples++;

        // If the opponent played the previous turn then negate the simulation
        if (this.parent)
            this.parent.backPropagate(-simulation);
    }
}

/**
 * Returns a childs potential
 * @param {MCTS_Node} parent 
 * @param {MCTS_Node} child 
 * In Ultimate Tic Tac Toe, the legal moves changes on turn-by-turn basis
 */
function childPotential(parent, child) {
    let w = child.misses - child.hits;
    let n = child.samples;
    let c = sqrt(2);
    let t = parent.samples;

    return w / n + c * sqrt(log(t) / n);
}

// Rename
let getPossibleMoves = getLegalMoves;

function getChildren(state, parent) {
    // Create a deep copy of the board
    let tempBoard = board.map((row) => [...row]);
    let turn = state.turn;
    let possibleMoves = getPossibleMoves(state);
    let possibleChildren = new Array(possibleMoves.length);

    for (let i = 0; i < possibleMoves.length; i++) {
        playMove(tempBoard, possibleMoves[i]);

        possibleChildren[i] = new MCTS_Node(new State(tempBoard, !turn, possibleMoves[i]),
         parent);

        tempBoard = state.board.slice(0);
    }

    return possibleChildren;
}

function simulate(state) {
    let tempState = JSON.parse(JSON.stringify(state));
    let possibleMoves;

    // Repeat until it is game over
    while(!gameOver(tempState)) {     // boardWinCheck()
        possibleMoves = getPossibleMoves(tempState);

        // Make a move
        playMove(tempState.board, random(possibleMoves));

        // Change the turn
        tempState.turn = !tempState.turn;
    }

    // positive if person won, negative if they lost
    return gameResult(state, tempState);
}

function createMctsRoot() {
    return new MCTS_Node(new State(board, currentPlayer, null), null);
}

// Helpers

function playMove(board, move) {
    board[move.x][move.y]; // = ____
}


class State {
    constructor(board, turn, lastMove=null) {
        this.board = board;
        this.turn = turn;
        this.lastMove = lastMove;
    }
}