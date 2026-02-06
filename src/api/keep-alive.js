const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
                updateUserTime(user.SessionID);
                const cookie = [
                    `SessionID=${user.SessionID}; Max-Age=10;Path=/;`,
                ];
                response.setHeader("Set-Cookie", cookie);
                response.end(JSON.stringify({ success: true }));
            } else {
                response.end(JSON.stringify({ success: false }));
            }
        },
    },
];
