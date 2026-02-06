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
