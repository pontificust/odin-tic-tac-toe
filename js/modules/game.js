export const game = () => {
    const winCombinations = [
        '012',
        '345',
        '678',
        '036',
        '147',
        '258',
        '048',
        '246'
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
        let board = Array(3).fill(Array(3).fill(Cell()));

        function getBoard() {
            return board;
        };

        function setToken(player, x, y) {
            board[x][y].setToken(player);
            console.log(board[x][y].getToken())
        }

        function resetBoard() {
            board = Array(3).fill(Array(3).fill(Cell()));
        }

        function printBoard() {
            board.forEach(row => {
                // row.forEach(cell => console.log(cell.getToken()));
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
            isWin: false,
            isDraw: false,
            resetState() {
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
            const playerMoves = currentPlayer.getMoves().sort().join('');
            console.log(playerMoves)
            if (playerMoves.length === 3) {
                if (winCombinations.some(val => playerMoves === val)) {
                    gameState.isWin = true;
                }
            } else if (movesCounter === 9) {
                gameState.isDraw = true;
            }
        }

        function playRound(x, y) {

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

        return { playRound, getCurrentPlayer };
    })();

    const gameRender = (() => {

        function playerClickRender(e) {
            const marker = game.getCurrentPlayer().token === 0 ? 'o' : 'x';
            e.target.textContent = marker;
            if(!game.playRound(e.target.dataset.x, e.target.dataset.y)){
                setTimeout(() => {
                    boardRender();
                }, 5000)
            };
        }

        function boardRender() {
            document.body.innerHTML = ''
            const ul = document.createElement('ul');

            const board = gameBoard.getBoard();

            for (let i = 0; i < board.length; i += 1) {
                for (let j = 0; j < board.length; j += 1) {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.dataset.x = i;
                    button.dataset.y = j;
                    li.appendChild(button);
                    ul.appendChild(li);
                }
            }
            document.body.appendChild(ul);
        }

        return { boardRender, playerClickRender };
    })();

    gameRender.boardRender();

    document.addEventListener('click', gameRender.playerClickRender);

}