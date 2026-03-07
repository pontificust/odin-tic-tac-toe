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

    const circleIcon = `<svg 
    fill="none" 
    width="80px" 
    height="80px" 
    viewBox="-2 -2 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="xMinYMin" >
    <path d='M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z'/>
    </svg>`;

    const crossIcon = `<svg
    width="80px" 
    height="80px"
    viewBox="0 0 16 16" 
    xmlns="http://www.w3.org/2000/svg" 
    version="1.1" 
    fill="none" 
    stroke="none" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    stroke-width="1.5">
<path d="m11.25 4.75-6.5 6.5m0-6.5 6.5 6.5"/>
</svg>`;

    const markerIcons = [circleIcon, crossIcon];

    const Player = (name, token) => {
        let moves = [];
        let wins = 0;

        function setMoves(x, y) {
            moves.push(+x + +y * 3);
        }

        function getMoves() {
            return moves;
        }

        function resetMoves() {
            moves = [];
        }

        function setWin() {
            wins += 1;
        }

        function getWin() {
            return wins;
        }

        return { name, token, setMoves, getMoves, resetMoves, setWin, getWin };
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

        const gameStats = {
            draws: 0,
            x: players[1].getWin(),
            o: players[0].getWin(),
        }

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

        function setDraw() {
            gameStats.draws += 1;
        }

        function getDraw() {
            return gameStats.draws;
        }

        function setWin(marker) {
            gameStats[marker] += 1;
        }

        function getWin(marker) {
            return gameStats[marker];
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
                    const marker = currentPlayer.token === 1 ? 'x' : 'o';
                    game.setWin(marker);
                } else if (isDraw) {
                    game.setDraw();
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

        return { playRound, getCurrentPlayer, setStart, getStart, setDraw, getDraw, setWin, getWin };
    })();

    const gameRender = (() => {

        function playerClickRender(e) {

            console.log(e.target)
            let isStart = game.getStart();
            if (e.target.dataset.id === 'start' && !isStart) {
                e.target.classList.add('click-off');
                game.setStart();
            } else if (isStart && e.target.dataset.x) {
                const markerIcon = markerIcons[game.getCurrentPlayer().token];
                const marker = game.getCurrentPlayer().token === 1 ? 'cross' : 'circle';
                e.target.innerHTML = markerIcon;
                e.target.querySelector('svg').classList.add(marker);
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

            const xScore = document.querySelector('span[data-id="x"]');
            const drawScore = document.querySelector('span[data-id="draw"]');
            const oScore = document.querySelector('span[data-id="o"]');
            const ul = document.querySelector('ul');
            const startButton = document.querySelector('button[data-id="start"]');

            ul.innerHTML = '';
            startButton.classList.remove('click-off');
            xScore.textContent = game.getWin('x');
            drawScore.textContent = game.getDraw();
            oScore.textContent = game.getWin('o');

            for (let i = 0; i < 3; i += 1) {
                for (let j = 0; j < 3; j += 1) {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.dataset.x = i;
                    button.dataset.y = j;
                    button.classList.add('main__game-cell-button');
                    li.classList.add('main__game-cell');
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