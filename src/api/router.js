const { URL } = require("url");

const registerRoutes = require("./register.js");
const resyncRoutes = require("./resync.js");
const keepAliveRoutes = require("./keep-alive.js");
const gameRoutes = require("./game.js");

const routes = [
    ...registerRoutes,
    ...resyncRoutes,
    ...keepAliveRoutes,
    ...gameRoutes,
];

module.exports = [
    {
        path: "api",
        handler(request, response) {
            let pathname = new URL(request.url, "http://127.0.0.1").pathname;

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

            response.end(JSON.stringify("Error in API router"));
        },
    },
];
