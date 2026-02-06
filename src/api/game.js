const { getUser, updateUserTime } = require("../models/users.js");
const { move, clearBoard, addRandomTile } = require("../models/board.js");
const { createUser, getTopUsers } = require("../models/db.js");
function parseCookies(req) {
    const raw = req.headers.cookie || "";
    return Object.fromEntries(
        raw.split("; ").map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return [name, rest.join("=")];
        }),
    );
}

async function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", (err) => reject(err));
    });
}

module.exports = [
    {
        method: "POST",
        path: "game",
        handler: async function (request, response) {
            let user = getUser(parseCookies(request).SessionID);

            if (!user) {
                response.end(JSON.stringify({ success: false }));
                return;
            }

            const data = await getRequestBody(request);
            const dir = data.direction;
            const restart = data.restart;
            let leaderboards;
            if (dir) {
                let [board, moves, score] = move(user.Board, dir);
                if (moves) {
                    const Tile = addRandomTile(board);
                    if (Tile !== false) {
                        const [randomRow, randomCol, newTile] = Tile;
                        board[randomRow][randomCol] = newTile;
                        user.PRNGTile = Tile;
                    }
                } else {
                    user.PRNGTile = false;
                }

                user.Board = board;
                user.Moves += moves;
                user.Score += score;
            }

            if (restart) {
                await createUser(user.Name, user.Score, user.Moves);
                leaderboards = await getTopUsers();
                user.Board = clearBoard();
                user.Moves = 0;
                user.Score = 0;
                const Tile = addRandomTile(user.Board);
                if (Tile !== false) {
                    const [randomRow, randomCol, newTile] = Tile;

                    user.Board[randomRow][randomCol] = newTile;
                    user.PRNGTile = Tile;
                }
            }

            updateUserTime(user);
            response.end(
                JSON.stringify({
                    Score: user.Score,
                    Moves: user.Moves,
                    PRNGTile: user.PRNGTile,
                    Leaderboards: leaderboards,
                }),
            );
        },
    },
];
