export const game = () => {
    const winCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const Player = (name, token) => {
        let moves = [];

        function setMoves(x, y) {
            moves.push(+x + +y * 3);
        }

        function getMoves() {
            return moves;
        }

        function resetMoves() {
            moves = [];
        }

        return { name, token, setMoves, getMoves, resetMoves };
    }


    const gameBoard = (() => {
        let board = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => Cell()));
        console.log(board)

        function getBoard() {
            return board;
        };

        function setToken(player, x, y) {
            board[x][y].setToken(player);
            console.log(board[x][y].getToken())
        }

        function resetBoard() {
            board = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => Cell()));
        }

        function printBoard() {
            board.forEach(row => {
                row.forEach(cell => console.log(cell, cell.getToken()));
            });
        }

        return {
            getBoard,
            setToken,
            resetBoard,
            printBoard
        }
    })();

    function Cell() {
        let token = 0;

        function setToken(player) {
            token = player.token
        };

        function getToken() {
            return token;
        }

        return { setToken, getToken }
    }

    const game = (() => {
        let movesCounter = 0;
        const gameState = {
            isStarted: false,
            isWin: false,
            isDraw: false,
            resetState() {
                this.isStarted = false;
                this.isDraw = false;
                this.isWin = false;
            }
        }
        const players = Array.from(Array(2), (x, idx) => Player(`player${idx}`, idx));

        let currentPlayer = players[1];

        function switchPlayer() {
            currentPlayer = currentPlayer === players[1] ? players[0] : players[1];
        }

        function getCurrentPlayer() {
            return currentPlayer;
        }

        function resetGame() {
            gameBoard.resetBoard();
            gameState.resetState();
            players.forEach(player => player.resetMoves());
            currentPlayer = players[1];
            movesCounter = 0;
        }

        function printRound() {
            gameBoard.printBoard();
            console.log(`Current player is ${currentPlayer}.`);
        }

        function checkWinner() {
            movesCounter += 1;
            const playerMoves = currentPlayer.getMoves();
            console.log(playerMoves)
            if (winCombinations.some(combination => combination.every(val => playerMoves.includes(val)))) {
                gameState.isWin = true;
            } else if (movesCounter === 9 && !gameState.isWin) {
                gameState.isDraw = true;
            }
        }

        function playRound(x, y) {

            if (!gameState.isStarted) {
                return;
            }

            console.log(`Dropping ${currentPlayer.name}'s marker into the ${x},${y} cell...`);
            currentPlayer.setMoves(x, y);
            gameBoard.setToken(currentPlayer, x, y);

            checkWinner();

            let { isWin, isDraw } = gameState;

            if (isWin || isDraw) {
                if (isWin) {
                    console.log(`Dear, ${currentPlayer.name}, you win!`);
                } else if (isDraw) {
                    console.log("It's a draw!");
                }
                resetGame();
                return false;
            }
            switchPlayer();
            printRound();

            return true;
        }

        function setStart() {
            gameState.isStarted = true;
        }

        function getStart() {
            return gameState.isStarted;
        }

        return { playRound, getCurrentPlayer, setStart, getStart };
    })();

    const gameRender = (() => {

        function playerClickRender(e) {

            let isStart = game.getStart();
            if (e.target.dataset.id === 'start' && !isStart) {
                e.target.classList.add('click-off');
                game.setStart();
            } else if (isStart && e.target.dataset.x) {
                const marker = game.getCurrentPlayer().token === 0 ? 'o' : 'x';
                e.target.textContent = marker;
                if (!game.playRound(e.target.dataset.x, e.target.dataset.y)) {
                    setTimeout(() => {
                        if (!document.startViewTransition) {
                            boardRender();
                            return;
                        }

                        document.startViewTransition(() => {
                            boardRender();
                        });
                    }, 5000)
                };
            }
        }

        function boardRender() {
            const ul = document.querySelector('ul');
            const startButton = document.querySelector('button[data-id="start"]');

            ul.innerHTML = '';
            startButton.classList.remove('click-off');

            for (let i = 0; i < 3; i += 1) {
                for (let j = 0; j < 3; j += 1) {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.dataset.x = i;
                    button.dataset.y = j;
                    li.appendChild(button);
                    ul.appendChild(li);
                }
            }
        }

        return { boardRender, playerClickRender };
    })();

    gameRender.boardRender();

    document.addEventListener('click', (e) => {

        if (!document.startViewTransition) {
            gameRender.playerClickRender(e);
            return;
        }

        document.startViewTransition(() => {
            gameRender.playerClickRender(e);
        });
    });

}