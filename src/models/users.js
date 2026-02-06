const { clearBoard, addRandomTile } = require("./board.js");

const users = new Map();

//подобие на CRUD
function createUser(Name) {
    const SessionID = crypto.randomUUID();
    let board = clearBoard();
    const Tile = addRandomTile(board);
    if (Tile !== false) {
        const [randomRow, randomCol, newTile] = Tile;

        board[randomRow][randomCol] = newTile;
        let PRNGTile = Tile;
    }
    users.set(SessionID, {
        SessionID,
        Name,
        Time: Date.now(),
        Board: board,
        Moves: 0, // число
        Score: 0,
        PRNGTile: Tile,
    });
    return users.get(SessionID);
}

function getUser(SessionID) {
    return users.get(SessionID);
}

function updateUserTime(user) {
    if (!user) return; // пользователь не найден

    user.Time = Date.now();
}

function deleteUser(SessionID) {
    users.delete(SessionID);
}

setInterval(() => {
    const time = Date.now();
    for (const [id, user] of users) {
        if (time - user.Time > 1000 * 60) {
            users.delete(id);
        }
    }
}, 1000 * 60);

module.exports = {
    createUser,
    getUser,
    updateUserTime,
    deleteUser,
};
