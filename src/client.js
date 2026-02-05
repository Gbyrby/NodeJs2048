async function handleFormSubmit(event) {
    event.preventDefault();  // ✅ Блокирует перезагрузку
    
    const form = event.target;
    const username = form.Username.value;
    
    try {
        // ✅ Отправляем POST запрос на сервер
        const response = await fetch('/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username })  // Отправляем имя
        });
        
        const result = await response.json();  // Получаем JSON ответ
        
        if (response.ok) {
            console.log('✅ Сервер ответил:', result);
            alert('✅ Сервер ответил:'+ result);
            // Скрываем форму, показываем игру
            document.querySelector('.game-form').style.display = 'none';
            document.querySelector('.elements-container').style.display = 'grid';
            document.querySelector('.score').style.display = 'flex';
            
            // Обновляем UI данными от сервера
            document.querySelector('.stats p').textContent = `Игрок: ${result.playerName || username}`;
            updateScore(result.initialScore || 0);
            
        } else {
            console.error('❌ Ошибка сервера:', result.error);
            alert('Ошибка: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        alert('Не удалось подключиться к серверу');
    }
}

function updateScore(score) {
    document.getElementById('scoreValue').textContent = score;
}

// Привязываем обработчик к форме
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.game-form');
    form.addEventListener('submit', handleFormSubmit);
});