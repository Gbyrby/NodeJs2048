const { getUser, updateUserTime } = require("../models/users.js");

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
        method: "POST",
        path: "keep-alive",
        handler(request, response) {
            let user = getUser(parseCookies(request).SessionID);

            if (user) {
                updateUserTime(user);
                const cookie = [
                    `SessionID=${user.SessionID}; Max-Age=1000;Path=/;`,
                ];
                response.setHeader("Set-Cookie", cookie);
                response.end(JSON.stringify({ success: true }));
            } else {
                response.end(JSON.stringify({ success: false }));
            }
        },
    },
];
