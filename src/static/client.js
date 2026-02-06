let keepAliveInterval;
let gameData = {};
// gameData.Board - массив 4x4 с числами
// updateBoard(board) - уже есть, вызывает обновление интерфейса
function isGameOver(board) {
    // 1️⃣ Есть пустая клетка — игра продолжается
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                return false;
            }
        }
    }

    // 2️⃣ Проверяем возможные объединения по горизонтали и вертикали
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const current = board[row][col];

            // вправо
            if (col < 3 && board[row][col + 1] === current) {
                return false;
            }

            // вниз
            if (row < 3 && board[row + 1][col] === current) {
                return false;
            }
        }
    }

    // ❌ Ходов больше нет
    return true;
}

function move(dir) {
    const board = gameData.Board.map((row) => row.slice()); // копия доски

    // вспомогательная функция для сжатия и объединения одной строки/столбца
    function slideAndCombine(line) {
        const newLine = line.filter((n) => n !== 0); // убираем нули
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                gameData.Score += newLine[i]; // увеличиваем очки
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
        gameData.Board = board;
        gameData.Moves += 1;
    }
}

function openGame(result) {
    document.querySelector(".game-form").style.display = "none";
    document.querySelector(".elements-container").style.display = "grid";
    document.querySelector(".score").style.display = "flex";

    // Обновляем UI данными от сервера
    document.querySelector(".stats p").textContent =
        `Игрок: ${result.Name} ${result.SessionID}`;
    updateScore(result.Score);
    updateBoard(result.Board);
    clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => {
        keepAlive();
    }, 1000);
}
function openForm() {
    document.querySelector(".game-form").style.display = "grid";
    document.querySelector(".elements-container").style.display = "none";
    document.querySelector(".score").style.display = "none";
    clearInterval(keepAliveInterval);
}

async function handleFormSubmit(event) {
    event.preventDefault(); // ✅ Блокирует перезагрузку

    const form = event.target;
    const username = form.Username.value;

    try {
        // ✅ Отправляем POST запрос на сервер
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }), // Отправляем имя
        });

        const result = await response.json(); // Получаем JSON ответ
        gameData = { ...gameData, ...result };
        if (response.ok) {
            console.log("✅ Сервер ответил:", result);
            // Скрываем форму, показываем игру
            openGame(result);
        } else {
            console.error("❌ Ошибка сервера:", result.error);
            alert("Ошибка: " + result.error);
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
        alert("Не удалось подключиться к серверу");
    }
}

function updateScore(score) {
    document.getElementById("scoreValue").textContent = score;
}

function updateBoard(board) {
    const blocks = document.querySelectorAll(".elements-container .block");

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const value = board[row][col]; // значение на доске
            const block = blocks[row * 4 + col]; // индекс в NodeList

            block.textContent = value === 0 ? "" : value; // пусто для 0
            block.className = "block"; // очищаем все классы
            if (value !== 0) {
                block.classList.add(`bl-${value}`); // добавляем класс
            }
        }
    }
}

// Привязываем обработчик к форме
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".game-form");
    form.addEventListener("submit", handleFormSubmit);
});

async function resync() {
    try {
        const response = await fetch("/api/resync", {
            method: "GET",
            credentials: "include",
        });

        const result = await response.json();

        if (response.ok && typeof result === "object") {
            console.log("✅ Сервер ответил:", result);
            gameData = { ...gameData, ...result };
            openGame(result);
        } else {
            openForm();
        }
    } catch (error) {}
}

async function keepAlive() {
    try {
        const response = await fetch("/api/keep-alive", {
            method: "POST",
            credentials: "include",
        });

        const result = await response.json();

        if (response.ok || typeof result.success) {
            console.log("✅ Сервер ответил:", result);
        } else {
            openForm();
            console.log("✅ Сервер ответил:", result);
        }
    } catch (error) {
        console.log("✅ Сервер не ответил:", error);
    }
}

function clearBoard() {
    return [
        // 4x4 числа
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
}
async function fetchRestart() {
    try {
        // ✅ Отправляем POST запрос на сервер
        const response = await fetch("/api/game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ restart: true }), // Отправляем имя
        });

        const result = await response.json(); // Получаем JSON ответ

        if (response.ok) {
            console.log("✅ Сервер ответил:", result);
            gameData.Board = clearBoard();
            gameData.Score = 0;
            gameData.Moves = 0;
            const Tile = result.PRNGTile;
            if (Tile) {
                const [randomRow, randomCol, newTile] = Tile;
                gameData.Board[randomRow][randomCol] = newTile;
                //gameData.Score = result.Score;
                updateBoard(gameData.Board);
                updateScore(gameData.Score);
            }
        } else {
            console.error("❌ Ошибка сервера:", result.error);
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
    }
}

async function fetchMove(dir) {
    try {
        // ✅ Отправляем POST запрос на сервер
        const response = await fetch("/api/game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ direction: dir }), // Отправляем имя
        });

        const result = await response.json(); // Получаем JSON ответ

        if (response.ok) {
            console.log("✅ Сервер ответил:", result);
            move(dir);
            const Tile = result.PRNGTile;
            if (Tile) {
                const [randomRow, randomCol, newTile] = Tile;
                gameData.Board[randomRow][randomCol] = newTile;
                //gameData.Score = result.Score;
                updateBoard(gameData.Board);
                updateScore(gameData.Score);
                if (
                    gameData.Score !== result.Score ||
                    gameData.Moves !== result.Moves
                ) {
                    resync();
                    console.log(
                        `${gameData.Score} ${result.Score} ${gameData.Moves} ${result.Moves}`,
                    );
                    console.log("РАССИНХРОНИЗЦИЯ!");
                }

                if (isGameOver(gameData.Board)) {
                    console.log("Проигрыш!");
                    fetchRestart();
                }
            }
            // Скрываем форму, показываем игру
        } else {
            console.error("❌ Ошибка сервера:", result.error);
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
    }
}

document.addEventListener("keydown", (event) => {
    let dir;

    switch (event.key) {
        case "ArrowUp":
            dir = "up";
            break;
        case "ArrowDown":
            dir = "down";
            break;
        case "ArrowLeft":
            dir = "left";
            break;
        case "ArrowRight":
            dir = "right";
            break;
        case "r":
            fetchRestart();
            break;
        case "e":
            resync();
            break;
    }
    if (dir) {
        fetchMove(dir);
    }
});

resync();
