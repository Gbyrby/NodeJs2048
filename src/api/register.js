const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { createUser } = require("../models/users.js");

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
        path: "register",
        handler(request, response) {
            const user = createUser("TestName");

            const cookie = [`SessionID=${user.SessionID}; Max-Age=10;Path=/;`];
            response.setHeader("Set-Cookie", cookie);
            response.end(JSON.stringify(user));
        },
    },
];
