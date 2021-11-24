const difficulties = {
    'easy': {
        'size': [10, 10],
        'mines': 10,
    },
    'medium': {
        'size': [16, 16],
        'mines': 40,
    },
    'hard': {
        'size': [16, 30],
        'mines': 99,
    },
};

const squareClassNames = {
    '.': 'unopened',
    'B': 'unopened',
    'F': 'unopened flag',
    'BF': 'unopened flag',
    'X': 'bomb',
    '0': 'opened empty',
    '1': 'opened one',
    '2': 'opened two',
    '3': 'opened three',
    '4': 'opened four',
    '5': 'opened five',
    '6': 'opened six',
    '7': 'opened seven',
    '8': 'opened eight',
};

const squareTexts = {
    '.': '',
    'B': '',
    'F': '<img src="assets/icons/flag.svg">',
    'BF': '<img src="assets/icons/flag.svg">',
    'X': '<img src="assets/icons/mine.png">',
    '0': '',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
};

const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
];

let board;
let size;
let mines;
let flagCount;
let timeInSeconds;
let timerInterval;
let unopenedCount;
let bombRevealInterval;
let squareListeners = {};

let isFirstClick = true;

function initializeBoard() {
    board = [];
    unopenedCount = 0;

    for (let i = 0; i < size[0]; i++) {
        const row = [];

        for (let j = 0; j < size[1]; j++) {
            row.push('.');
            unopenedCount += 1;
        }

        board.push(row);
    }
}

function generateMines(firstClickX, firstClickY) {
    let i = 0;
    while (i < mines) {
        const mineX = randomInt(0, size[0]);
        const mineY = randomInt(0, size[1]);
        console.log(mineX);
        console.log(mineY);

        if (!((mineX >= firstClickX - 1 && mineX <= firstClickX + 1 && mineY >= firstClickY - 1 && mineY <= firstClickY + 1) || board[mineX][mineY] === 'B')) {
            board[mineX][mineY] = 'B';
            i++;
            unopenedCount -= 1;
        }
    }
}

function countMinesAroundSquare(row, column) {
    let mines = 0;

    for (const direction of directions) {
        const rowToCheck = row + direction[0];
        const columnToCheck = column + direction[1];

        if (rowToCheck < 0 || rowToCheck >= size[0] || columnToCheck < 0 || columnToCheck >= size[1]) {
            continue;
        }

        if (board[rowToCheck][columnToCheck].includes('B')) {
            mines += 1;
        }
    }

    return mines;
}

function stopGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    for (const square of document.getElementsByClassName('square')) {
        const listener = squareListeners[square.id];

        square.removeEventListener('mousedown', listener);
    }

    squareListeners = {};
}

function hasWon() {
    return unopenedCount === 0;
}

function revealSquare(row, column) {
    const mineCount = countMinesAroundSquare(row, column);

    if (board[row][column] == 'F') {
        flagCount += 1;
        renderFlagsCount();
    }

    if (board[row][column] == '.') {
        unopenedCount -= 1;
    }

    board[row][column] = mineCount.toString();

    const squareElement = document.getElementById(`${row}-${column}`);

    squareElement.innerHTML = squareTexts[board[row][column]];
    squareElement.className = 'square ' + squareClassNames[board[row][column]];

    if (hasWon()) {
        stopGame();
        alert('You won!');
    }

    if (mineCount === 0) {
        for (const direction of directions) {
            const rowToOpen = row + direction[0];
            const columnToOpen = column + direction[1];
    
            if (rowToOpen < 0 || rowToOpen >= size[0] || columnToOpen < 0 || columnToOpen >= size[1]) {
                continue;
            }

            if (['.', 'F'].includes(board[rowToOpen][columnToOpen])) {
                revealSquare(rowToOpen, columnToOpen);
            }
        }
    }
}

function switchFlag(row, column) {
    const squareValue = board[row][column];
    if (['.', 'B'].includes(squareValue)) {
        board[row][column] = squareValue === 'B' ? 'BF' : 'F';

        flagCount -= 1;
        renderFlagsCount();

        const squareElement = document.getElementById(`${row}-${column}`);

        squareElement.innerHTML = squareTexts[squareValue === 'B' ? 'BF' : 'F'];
        squareElement.className = 'square ' + squareClassNames[squareValue === 'BF' ? 'B' : '.'];
    } else if (['BF', 'F'].includes(squareValue)) {
        board[row][column] = squareValue === 'BF' ? 'B' : '.';
        
        flagCount += 1;
        renderFlagsCount();

        const squareElement = document.getElementById(`${row}-${column}`);

        squareElement.innerHTML = squareTexts[squareValue === 'BF' ? 'B' : '.'];
        squareElement.className = 'square ' + squareClassNames[squareValue === 'BF' ? 'B' : '.'];
    }
}

function hasLost() {
    const bombPositions = [];

    for (let i = 0; i < size[0]; i++) {
        for (let j = 0; j < size[1]; j++) {
            if (['B', 'BF'].includes(board[i][j])) {
                bombPositions.push(`${i}-${j}`);
            }
        }
    }

    bombRevealInterval = setInterval(() => {
        if (bombPositions.length == 0) {
            clearInterval(bombRevealInterval);

            alert('dead');
        } else {
            const squareElement = document.getElementById(bombPositions.shift());
            
            squareElement.innerHTML = squareTexts['X'];
            squareElement.className = 'square ' + squareClassNames['X'];
        }
    }, 100);
}

function configureSquareClickEvent(square) {
    const onClick = event => {
        const row = parseInt(square.id.split('-')[0]);
        const column = parseInt(square.id.split('-')[1]);

        if (event.which == 3) {
            switchFlag(row, column);
        } else {
            if (isFirstClick) {
                isFirstClick = false;
    
                generateMines(row, column);
            }
    
            const squareValue = board[row][column];
    
            switch (squareValue) {
                case '.':
                case 'F':
                    revealSquare(row, column);

                    break;
                case 'B':
                case 'BF':
                    hasLost();
                    stopGame();
                    break;
            }
        }
    }

    squareListeners[square.id] = onClick;

    square.addEventListener('mousedown', onClick);
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';

    for (const row in board) {
        const rowElement = document.createElement('div');
        
        rowElement.classList.add('row');

        for (const column in board[row]) {
            const squareValue = board[row][column];
            const squareElement = document.createElement('div');

            squareElement.id = `${row}-${column}`;
            squareElement.className = `square ${squareClassNames[squareValue]}`;
            squareElement.innerHTML = squareTexts[squareValue];

            configureSquareClickEvent(squareElement);

            rowElement.appendChild(squareElement);
        }

        boardElement.appendChild(rowElement);
    }
    
    boardElement.classList.remove('hide');
}

function renderFlagsCount() {
    const flagsCountContainerElement = document.getElementById('flags-count-container');
    const flagsCountElement = document.getElementById('flags-count');

    flagsCountElement.innerText = flagCount;
    flagsCountContainerElement.classList.remove('hide');
}

function startTimer() {
    timeInSeconds = 0;

    const timer = document.getElementById('timer');

    timer.innerText = '00:00';

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(function() {
        timeInSeconds += 1;
        
        const hours = Math.floor(timeInSeconds / 3600).toString();
        const minutes = Math.floor((timeInSeconds % 3600) / 60).toString();
        const seconds = (timeInSeconds % 60).toString();
        
        let timerText = `${hours > 0 ? hours.padStart(2, '0') + ':' : ''}${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;

        timer.innerText = timerText;
    }, 1000);
}

function loadGame() {
    isFirstClick = true;

    initializeBoard();
    renderBoard();
    renderFlagsCount();
    startTimer();
}

document.getElementById('start-game').addEventListener('click', function() {
    const difficulty = difficulties[document.getElementById('difficulty').value];

    console.log(difficulty);

    size = difficulty['size'];
    mines = difficulty['mines'];
    flagCount = mines;

    if (bombRevealInterval) {
        clearInterval(bombRevealInterval);
    }

    loadGame();
});

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}

document.getElementById('board').addEventListener('contextmenu', function(e) {
    e.preventDefault();

    return false;
})
