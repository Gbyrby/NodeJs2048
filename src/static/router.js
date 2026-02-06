const { URL } = require("url");

const fs = require("fs");
const path = require("path");

module.exports = [
    {
        path: "static",
        handler(request, response) {
            if (request.method !== "GET") {
                response.end(JSON.stringify("Wrong metod"));
                return;
            }

            let pathname = new URL(request.url, "http://127.0.0.1").pathname;
            if (pathname === "/") {
                pathname = "/static/index.html";
            }
            const ext = path.extname(pathname);
            const contentTypeMap = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".svg": "image/svg+xml",
            };

            const filePath = path.join(__dirname, `../${pathname}`);
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    response.statusCode = 500;
                    response.end("Server error");
                    return;
                }
                response.setHeader(
                    "Content-Type",
                    contentTypeMap[ext] + "; charset=utf-8",
                );
                response.end(data);
            });
            return;
        },
    },
];
