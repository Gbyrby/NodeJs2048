const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const registerRoutes = require("./register.js");
const resyncRoutes = require("./resync.js");

const routes = [...registerRoutes, ...resyncRoutes];

module.exports = [
    {
        path: "api",
        handler(request, response) {
            let { pathname } = url.parse(request.url);

            const route = routes.find((route) => {
                return (
                    request.method === route.method &&
                    route.path === pathname.split("/").splice(-1).join("")
                );
            });

            if (route) {
                route.handler(request, response);
                return 0;
            }

            response.end(JSON.stringify("Error"));
        },
    },
];
