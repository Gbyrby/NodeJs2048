const { createUser, getUser } = require("../models/users.js");

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
        path: "register",
        handler: async function (request, response) {
            let user = getUser(parseCookies(request).SessionID);
            const data = await getRequestBody(request);
            const username = data.username;

            if (!user) {
                user = createUser(username);
            } else {
                user.Name = username;
            }

            const cookie = [
                `SessionID=${user.SessionID}; Max-Age=1000;Path=/;`,
            ];
            response.setHeader("Set-Cookie", cookie);
            response.end(JSON.stringify(user));
        },
    },
];
