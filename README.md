# NodeJs2048

Clone of 2048 game, using Node.js

Это учебный проект клон игры 2028 для практики написания сервера на Node.js

# TODO:

- ~~идентификация пользователей~~
- ~~считывание нажатие пользователя и отправка нажатий на сервер~~
- ~~расчет логики игры на клиенте~~
- ~~расчет логики игры на сервере~~
- ~~подсчет очков на сервере\клиенте~~
- ~~выполнение синхронизации с сервером(при несовпадении количества ходов или очков)~~
- сохранение очков в таблицу лидеров (имени,очков,дату)
- добавить кнопку смены имени
- добавить кнопку сброса

# EndPoints

## GET / or /static/[index.html, style.css, client.js]

for static pages

## GET /api/register

### for create new user

- Set-cookie: SessionID
- Create user in server data
- get all data of user(?) (need only PRNGTile!)

## GET /api/resync

### return all information from user to browser for sync data
- Update Max-age for cookie

## POST /api/keep-alive

### Update Max-age for cookie
- check connection
- Check if a user is in the list of users

## POST /api/game

### for game logic

- move up , down , left, right
- restart game
