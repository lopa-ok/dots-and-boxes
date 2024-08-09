document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const scoreDisplay = document.getElementById("score");
    const winnerDisplay = document.getElementById("winner");
    const menu = document.getElementById("menu");
    const game = document.getElementById("game");

    let boardSize = 5;
    let lineCoordinates = {};
    let boxColors = {};
    let numRed = 0;
    let numBlue = 0;
    let turn = "red";
    let isAI = false;

    function createBoard(size) {
        board.innerHTML = "";
        lineCoordinates = {};
        boxColors = {};
        numRed = 0;
        numBlue = 0;
        scoreDisplay.textContent = `Red: ${numRed} Blue: ${numBlue}`;
        winnerDisplay.textContent = "";

        for (let i = 0; i < 2 * size + 1; i++) {
            const row = document.createElement("div");
            row.className = "row";
            for (let j = 0; j < 2 * size + 1; j++) {
                if (i % 2 === 0) {
                    if (j % 2 === 0) {
                        const dot = document.createElement("div");
                        dot.className = "dot";
                        row.appendChild(dot);
                    } else {
                        const horizLine = document.createElement("div");
                        horizLine.className = "horizContainer";
                        horizLine.dataset.coord = `0,${Math.floor(i / 2)},${Math.floor(j / 2)}`;
                        horizLine.addEventListener("click", fillLine);
                        row.appendChild(horizLine);
                    }
                } else {
                    if (j % 2 === 0) {
                        const vertLine = document.createElement("div");
                        vertLine.className = "vertContainer";
                        vertLine.dataset.coord = `1,${Math.floor(j / 2)},${Math.floor(i / 2)}`;
                        vertLine.addEventListener("click", fillLine);
                        row.appendChild(vertLine);
                    } else {
                        const box = document.createElement("div");
                        box.className = "box";
                        boxColors[`${Math.floor(i / 2)},${Math.floor(j / 2)}`] = "white";
                        row.appendChild(box);
                    }
                }
            }
            board.appendChild(row);
        }
    }

    function fillLine(event) {
        const coord = event.target.dataset.coord;
        if (!lineCoordinates[coord]) {
            lineCoordinates[coord] = turn;
            event.target.style.backgroundColor = turn === "red" ? "red" : "blue";
            let madeSquare = 0;

            const [i, j, k] = coord.split(",").map(Number);

            if (i === 0) {
                if (checkSquare(j, k)) madeSquare++;
                if (checkSquare(j - 1, k)) madeSquare++;
            } else {
                if (checkSquare(k, j)) madeSquare++;
                if (checkSquare(k, j - 1)) madeSquare++;
            }

            if (madeSquare > 0) {
                turn === "red" ? numRed++ : numBlue++;
                scoreDisplay.textContent = `Red: ${numRed} Blue: ${numBlue}`;
                checkGameOver();
            } else {
                turn = turn === "red" ? "blue" : "red";
                if (isAI && turn === "blue") {
                    setTimeout(aiMove, 500); // Delay AI move
                }
            }
        }
    }

    function checkSquare(j, k) {
        if (j < 0 || k < 0 || j >= boardSize || k >= boardSize) return false;
        const horiz1 = lineCoordinates[`0,${j},${k}`];
        const horiz2 = lineCoordinates[`0,${j + 1},${k}`];
        const vert1 = lineCoordinates[`1,${k},${j}`];
        const vert2 = lineCoordinates[`1,${k + 1},${j}`];

        if (horiz1 && horiz2 && vert1 && vert2) {
            boxColors[`${j},${k}`] = turn;
            board.querySelector(`.row:nth-child(${2 * j + 2}) .box:nth-child(${2 * k + 2})`).style.backgroundColor = turn === "red" ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)";
            return true;
        }
        return false;
    }

    function checkGameOver() {
        if (numRed + numBlue === boardSize * boardSize) {
            if (numRed > numBlue) {
                winnerDisplay.textContent = "Red wins!";
            } else if (numRed < numBlue) {
                winnerDisplay.textContent = "Blue wins!";
            } else {
                winnerDisplay.textContent = "It's a draw!";
            }
        }
    }

    function aiMove() {
        const availableMoves = Object.keys(lineCoordinates).filter(coord => !lineCoordinates[coord]);
        const bestMove = findBestMove(availableMoves);
        if (bestMove) {
            const lineElement = document.querySelector(`[data-coord="${bestMove}"]`);
            if (lineElement) {
                lineElement.click();
            }
        }
    }

    function findBestMove(availableMoves) {
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of availableMoves) {
            const tempLineCoordinates = { ...lineCoordinates, [move]: "blue" };
            const tempBoxColors = { ...boxColors };
            let score = evaluateMove(move, tempLineCoordinates, tempBoxColors);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    function evaluateMove(move, tempLineCoordinates, tempBoxColors) {
        const [i, j, k] = move.split(",").map(Number);
        let score = 0;

        if (i === 0) {
            if (checkSquareScore(j, k, tempLineCoordinates, tempBoxColors)) score++;
            if (checkSquareScore(j - 1, k, tempLineCoordinates, tempBoxColors)) score++;
        } else {
            if (checkSquareScore(k, j, tempLineCoordinates, tempBoxColors)) score++;
            if (checkSquareScore(k, j - 1, tempLineCoordinates, tempBoxColors)) score++;
        }

        return score;
    }

    function checkSquareScore(j, k, tempLineCoordinates, tempBoxColors) {
        if (j < 0 || k < 0 || j >= boardSize || k >= boardSize) return false;
        const horiz1 = tempLineCoordinates[`0,${j},${k}`];
        const horiz2 = tempLineCoordinates[`0,${j + 1},${k}`];
        const vert1 = tempLineCoordinates[`1,${k},${j}`];
        const vert2 = tempLineCoordinates[`1,${k + 1},${j}`];

        if (horiz1 && horiz2 && vert1 && vert2) {
            tempBoxColors[`${j},${k}`] = "rgba(0,0,255,0.5)";
            return true;
        }
        return false;
    }

    function startGame(vsAI) {
        isAI = vsAI;
        menu.style.display = "none";
        game.style.display = "block";
        createBoard(boardSize);
    }

    document.getElementById("startPlayerVsPlayer").addEventListener("click", () => startGame(false));
    document.getElementById("startPlayerVsAI").addEventListener("click", () => startGame(true));

    document.getElementById("small").addEventListener("click", () => createBoard(5));
    document.getElementById("medium").addEventListener("click", () => createBoard(8));
    document.getElementById("large").addEventListener("click", () => createBoard(11));
});
