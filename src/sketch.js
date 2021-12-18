/**  Intelligent Systems Project — By Mohamed El Bakry.
* An Intelligent minimax agent with alpha aeta pruning that plays UTTT (Ultimate Tic Tac Toe) versus a human.
*/

"use strict";

const agentX = new Agent(state, Agent.type.MINIMAX_ALPHA_BETA_PRUNING, Agent.piece.X);
let depth;

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
                ellipse(xp, yp, w / 2);  // Radius is w / 2 to make the circle slightly smaller than the square its in.
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
        const p = document.createElement("p");
        p.style.fontSize = "xxx-large";
        p.innerText = `${getSymbol(winner)} wins!!!`;
        document.querySelector("main").appendChild(p);
        console.log("VICTORY FOR", getSymbol(winner));
        game.gameOver = true;
        noLoop();
    }
}

/* When the mouse is clicked, if the do the move if it's valid, then let the AI reply  */
function mouseClicked() {
    const y = Math.floor(mouseX / (width / BOARD_LEN));
    const x = Math.floor(mouseY / (height / BOARD_LEN));

    if (!isValid(x, y, state) || game.gameOver || game.draw) {
        return;
    }

    state.board[x][y] = state.turn;
    state.previousMove = { y, x };
    state.turn = getNext(state.turn);
    let subBoardCoords = getNextSubBoard(x, y);
    nextSubBoardToPlay[0] = subBoardCoords.y;
    nextSubBoardToPlay[1] = subBoardCoords.x;

    makeAIMove();
}

// /* Draw loop helper functions */
function highlightNextSubBoard(w, h) {
    strokeWeight(10);
    stroke(0, 125, 255);

    const [sbx, sby] = [nextSubBoardToPlay[0], nextSubBoardToPlay[1]];
    const nextSubBoardIsFull = sbx !== -2 && state.subBoardStates[sby][sbx] !== game.none;
    if (state.previousMove === null || nextSubBoardIsFull) {
        rect(0, 0, w * BOARD_LEN, w * BOARD_LEN);
        return;
    }
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

function makeAIMove() {
    // if (depth === undefined) {
    //   depth = +prompt("How many turns ahead do you want the AI to look? (higher -> more challenging) — 6 is recommended.");
    //   depth = depth ? depth : 6;
    // }
    // Call the ai move slightly later to allow the draw loop to show the human's previous move.
    setTimeout(async () => {
        const aiMove = await agentX.playOptimalMove(depth);
        const subBoardCoords = getNextSubBoard(aiMove.x, aiMove.y);
        nextSubBoardToPlay[0] = subBoardCoords.y;
        nextSubBoardToPlay[1] = subBoardCoords.x;
    }, 100);
}

// Mobile support if needed.
// touchStarted = mouseClicked;