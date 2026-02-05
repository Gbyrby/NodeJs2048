const users = new Map();

//подобие на CRUD
function createUser(Name) {
    const SessionID = crypto.randomUUID();
    users.set(SessionID, {
        SessionID,
        Name,
        Time: Date.now(),
        Board: [
            // 4x4 числа
            [0, 2, 0, 2],
            [0, 0, 4, 0],
            [0, 8, 0, 0],
            [0, 0, 0, 16],
        ],
        Moves: 0, // число
        Score: 0,
    });
    return users.get(SessionID);
}

function getUser(SessionID) {
    return users.get(SessionID);
}

function updateUserTime(SessionID) {
    const user = users.get(SessionID);
    if (!user) return; // пользователь не найден

    users.set(SessionID, {
        ...user,
        Time: Date.now(),
    });
}

function deleteUser(SessionID) {
    users.delete(SessionID);
}

console.log(users);

createUser(123, "Test");
console.log(users);

setInterval(
    () => {
        const time = Date.now();
        for (const [id, user] of users) {
            if (time - user.Time.getTime() > 10000) {
                users.delete(id);
            }
        }
    },
    1000 * 60 * 10,
);

module.exports = {
    createUser,
    getUser,
    updateUserTime,
    deleteUser,
};
