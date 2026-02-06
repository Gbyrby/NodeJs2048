const { getUser } = require("../models/users.js");
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
        handler(request, response) {
            let user = getUser(parseCookies(request).SessionID);

            if (user) {
                response.end(JSON.stringify(user));
            } else {
                response.end(JSON.stringify("No found user"));
            }
        },
    },
];
