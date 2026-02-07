const { getTopUsers } = require("../models/db.js");
const { getUser } = require("../models/users.js");
let leaderboards;
function parseCookies(req) {
    const raw = req.headers.cookie || "";
    return Object.fromEntries(
        raw.split("; ").map((cookie) => {
            const [name, ...rest] = cookie.split("=");
            return [name, rest.join("=")];
        }),
    );
}

module.exports = [
    {
        method: "GET",
        path: "resync",
        handler: async function (request, response) {
            let user = getUser(parseCookies(request).SessionID);
            try {
                leaderboards = await getTopUsers();
            } catch {}

            if (user) {
                response.end(
                    JSON.stringify({ user, Leaderboards: leaderboards }),
                );
            } else {
                response.end(JSON.stringify({ Leaderboards: leaderboards }));
            }
        },
    },
];
