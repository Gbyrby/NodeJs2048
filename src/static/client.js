let keepAliveInterval;
let gameData = {};
let inGame = false;
let waitServer = false;
let queueMoves = [];
let gameOver = false;
// gameData.Board - массив 4x4 с числами
// updateBoard(board) - уже есть, вызывает обновление интерфейса
function updateMoves(moves) {
    document.getElementById("movesValue").textContent = moves;
}
function handleGameOver() {
    if (gameOver) return;

    gameOver = true;
    console.log("💀 GAME OVER");
    // ⏱ через 3 секунды — затемнение
    queueMoves.length = 0;

    setTimeout(() => {
        document.getElementById("gameover").classList.add("dark");
    }, 1000);
    setTimeout(() => {
        fetchRestart();
    }, 1500);
    // ⏱ через 6 секунд — рестарт
    setTimeout(() => {
        document.getElementById("gameover").classList.remove("dark");
        gameOver = false;
    }, 3000);
}
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
function updateLeaderboard(leaderboards) {
    const tbody = document.getElementById("leaderboardBody");
    if (!leaderboards?.length) {
        tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
        return;
    }

    tbody.innerHTML = leaderboards
        .map(
            (user, index) => `
            <tr class="rank-${index + 1 > 3 ? "normal" : index + 1}">
                <td>${index + 1}.</td>
                <td></td><td></td><td></td>  <!-- пустые ячейки -->
            </tr>
        `,
        )
        .join("");

    // Заполняем безопасно ПОСЛЕ создания DOM
    leaderboards.forEach((user, index) => {
        const row = tbody.children[index];
        row.cells[1].textContent = user.name || user.Name || "Без имени";
        row.cells[2].textContent = user.score || user.Score || 0;
        row.cells[3].textContent = user.moves || user.Moves || 0;
    });
}

function openGame(result) {
    inGame = true;
    document.querySelector(".game-form").style.display = "none";
    document.querySelector(".right-section").style.display = "flex";

    // Обновляем UI данными от сервера
    document.getElementById("name").textContent = result.Name;
    updateScore(result.Score);
    updateBoard(result.Board);
    updateMoves(result.Moves);
    clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => {
        keepAlive();
    }, 10000);
}
function openForm(FormText) {
    inGame = false;
    document.querySelector(".game-form").style.display = "grid";
    document.querySelector(".right-section").style.display = "none";

    const startBtn = document.getElementById("startBtn");
    startBtn.value = FormText;
}
async function register(username) {
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
        gameData = { ...gameData, ...result.user };
        if (response.ok) {
            console.log("✅ Сервер ответил:", result);
            // Скрываем форму, показываем игру
            openGame(result.user);

            if (result.Leaderboards) {
                updateLeaderboard(result.Leaderboards);
            }
        } else {
            console.error("❌ Ошибка сервера:", result.error);
            alert("Ошибка: " + result.error);
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
        alert("Не удалось подключиться к серверу");
    }
}
async function handleFormSubmit(event) {
    event.preventDefault(); // ✅ Блокирует перезагрузку

    const form = event.target;
    const username = form.Username.value;
    register(username);
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
function handleFormChangeName(event) {
    openForm("Продолжить игру");
}
// Привязываем обработчик к форме
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".game-form");
    form.addEventListener("submit", handleFormSubmit);

    const NameButton = document.querySelector(".change-name-button");
    NameButton.addEventListener("click", handleFormChangeName);

    const restartButton = document.querySelector(".restart-button");
    restartButton.addEventListener("click", handleGameOver);
});

async function resync() {
    try {
        const response = await fetch("/api/resync", {
            method: "GET",
            credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
            if (result.Leaderboards) {
                updateLeaderboard(result.Leaderboards);
            }
            if (result.user) {
                console.log("✅ Сервер ответил:", result);
                gameData = { ...gameData, ...result.user };
                openGame(result.user);
            } else {
                openForm("Начать игру");
            }
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

        if (response.ok && result.success === true) {
            document.getElementById("overlay").classList.remove("dark");
            console.log("✅ Сервер ответил:", result);
        } else {
            document.getElementById("overlay").classList.remove("dark");
            if (gameData.Name) {
                register(gameData.Name);
            } else {
                openForm("Начать игру");
            }

            console.log("✅ Сервер ответил:", result);
        }
    } catch (error) {
        console.log("✅ Сервер не ответил:", error);
        document.getElementById("overlay").classList.add("dark");
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
            if (result.Leaderboards) {
                updateLeaderboard(result.Leaderboards);
            }
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
                updateMoves(gameData.Moves);
            }
        } else {
            console.error("❌ Ошибка сервера:", result.error);
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
    }
}

async function fetchMove(dir) {
    if (gameOver) return; // ⛔ игра окончена
    if (waitServer) {
        //console.log("Ждем");
        document.getElementById("overlay").classList.add("dark");
        return 1;
    }

    waitServer = true;
    move(dir);
    updateBoard(gameData.Board);
    updateScore(gameData.Score);
    updateMoves(gameData.Moves);
    if (isGameOver(gameData.Board)) {
        handleGameOver();
    }
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
            document.getElementById("overlay").classList.remove("dark");
            waitServer = false;
            queueMoves.shift();

            const Tile = result.PRNGTile;
            if (Tile) {
                const [randomRow, randomCol, newTile] = Tile;
                gameData.Board[randomRow][randomCol] = newTile;
                //gameData.Score = result.Score;
                updateBoard(gameData.Board);
                updateScore(gameData.Score);
                updateMoves(gameData.Moves);
                if (isGameOver(gameData.Board)) {
                    handleGameOver();
                }
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
            }
            // Скрываем форму, показываем игру
        } else {
            console.error("❌ Ошибка сервера:", result.error);
            document.getElementById("overlay").classList.add("dark");
        }
    } catch (error) {
        console.error("❌ Ошибка сети:", error);
        document.getElementById("overlay").classList.add("dark");
    }
}

document.addEventListener("keydown", (event) => {
    if (!inGame) {
        return;
    }
    let dir;

    switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
        case "й":
        case "Й":
            dir = "up";
            break;
        case "ArrowDown":
        case "s":
        case "S":
        case "ы":
        case "Ы":
            dir = "down";
            break;
        case "ArrowLeft":
        case "a":
        case "A":
        case "ф":
        case "Ф":
            dir = "left";
            break;
        case "ArrowRight":
        case "d":
        case "D":
        case "в":
        case "В":
            dir = "right";
            break;
        case "r":
            handleGameOver();
            break;
        case "e":
            resync();
            break;
    }

    if (dir) {
        if (queueMoves.length < 3) {
            queueMoves.push(dir);
        }
    }
});
// 🖐️ ПРОСТО СКОПИРУЙ И ВСТАВЬ В КОНЕЦ ФАЙЛА (перед resync())

// 📱 СВАЙПЫ ТОЛЬКО НА БЛОКАХ ИГРЫ
let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 40;

// 🎯 Находим контейнер с блоками игры
const gameBlocks = document.querySelector(".elements-container");

gameBlocks.addEventListener(
    "touchstart",
    function (e) {
        if (!inGame) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    },
    { passive: true },
);

gameBlocks.addEventListener(
    "touchend",
    function (e) {
        if (!inGame) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) {
            return;
        }

        let dir;
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? "right" : "left";
        } else {
            dir = dy > 0 ? "down" : "up";
        }
        if (queueMoves.length < 3) {
            queueMoves.push(dir);
        }
    },
    { passive: true },
);

// ❌ БЛОКИРУЕМ ПРОКРУТКУ ТОЛЬКО НА БЛОКАХ
gameBlocks.addEventListener(
    "touchmove",
    function (e) {
        e.preventDefault();
    },
    { passive: false },
);
resync();

setInterval(() => {
    if (queueMoves.length > 0) {
        fetchMove(queueMoves[0]);
    }
    if (gameOver) {
        queueMoves = [];
    }
}, 5);
