function move(oldboard, dir) {
    let addMoves = 0;
    let addScore = 0;
    const board = oldboard.map((row) => row.slice()); // копия доски

    // вспомогательная функция для сжатия и объединения одной строки/столбца
    function slideAndCombine(line) {
        const newLine = line.filter((n) => n !== 0); // убираем нули
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                addScore += newLine[i]; // увеличиваем очки
                newLine[i + 1] = 0;
            }
        }
        return [
            ...newLine.filter((n) => n !== 0),
            ...Array(line.length - newLine.filter((n) => n !== 0).length).fill(
                0,
            ),
        ];
    }

    function transpose(mat) {
        return mat[0].map((_, i) => mat.map((row) => row[i]));
    }

    let moved = false;

    switch (dir) {
        case "left":
            for (let i = 0; i < 4; i++) {
                const newRow = slideAndCombine(board[i]);
                if (!moved && newRow.some((v, idx) => v !== board[i][idx]))
                    moved = true;
                board[i] = newRow;
            }
            break;

        case "right":
            for (let i = 0; i < 4; i++) {
                const newRow = slideAndCombine(
                    board[i].slice().reverse(),
                ).reverse();
                if (!moved && newRow.some((v, idx) => v !== board[i][idx]))
                    moved = true;
                board[i] = newRow;
            }
            break;

        case "up":
            let transposed = transpose(board);
            for (let i = 0; i < 4; i++) {
                const newRow = slideAndCombine(transposed[i]);
                if (!moved && newRow.some((v, idx) => v !== transposed[i][idx]))
                    moved = true;
                transposed[i] = newRow;
            }
            board.splice(0, 4, ...transpose(transposed));
            break;

        case "down":
            let t = transpose(board);
            for (let i = 0; i < 4; i++) {
                const newRow = slideAndCombine(
                    t[i].slice().reverse(),
                ).reverse();
                if (!moved && newRow.some((v, idx) => v !== t[i][idx]))
                    moved = true;
                t[i] = newRow;
            }
            board.splice(0, 4, ...transpose(t));
            break;

        default:
            console.error("Invalid direction:", dir);
            return;
    }

    // если доска изменилась
    if (moved) {
        addMoves += 1;
    }
    return [board, addMoves, addScore];
}

function clearBoard() {
    let board = [
        // 4x4 числа
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    return board;
}

function addRandomTile(board) {
    const emptyCells = [];

    // 1️⃣ Собираем все пустые клетки
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }

    // ❌ Нет свободных клеток
    if (emptyCells.length === 0) {
        return false;
    }

    // 2️⃣ Выбираем случайную пустую клетку
    const { row, col } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // 3️⃣ 90% → 2, 10% → 4

    const newTile = Math.random() < 0.9 ? 2 : 4;
    return [row, col, newTile];
}

module.exports = {
    move,
    clearBoard,
    addRandomTile,
};
