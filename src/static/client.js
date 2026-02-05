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

        if (response.ok) {
            console.log("✅ Сервер ответил:", result);
            // Скрываем форму, показываем игру
            document.querySelector(".game-form").style.display = "none";
            document.querySelector(".elements-container").style.display =
                "grid";
            document.querySelector(".score").style.display = "flex";

            // Обновляем UI данными от сервера
            document.querySelector(".stats p").textContent =
                `Игрок: ${username} ${result.SessionID}`;
            updateScore(result.Score);
            updateBoard(result.Board);
            setInterval(() => {
                keepAlive();
            }, 1000);
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

async function checkAuth() {
    try {
        const response = await fetch("/api/auth", {
            method: "GET",
            credentials: "include",
        });

        const result = await response.json();

        if (response.ok && typeof result === "object") {
            console.log("✅ Сервер ответил:", result);

            document.querySelector(".game-form").style.display = "none";
            document.querySelector(".elements-container").style.display =
                "grid";
            document.querySelector(".score").style.display = "flex";
            // Обновляем UI данными от сервера
            document.querySelector(".stats p").textContent =
                `Игрок: ${result.Name} ${result.SessionID}`;
            updateScore(result.Score);
            updateBoard(result.Board);
            setInterval(() => {
                keepAlive();
            }, 1000);
        } else {
            document.querySelector(".game-form").style.display = "block";
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

        if (response.ok && typeof result.success === "true") {
            console.log("✅ Сервер ответил:", result);
        }
    } catch (error) {}
}

checkAuth();
