const { URL } = require("url");

const staticRoutes = require("./static/router.js");
const apiRoutes = require("./api/router.js");

const routes = [...staticRoutes, ...apiRoutes];

module.exports = (req, res) => {
    let pathname = new URL(req.url, "http://127.0.0.1").pathname;
    if (pathname === "/") {
        pathname = "/static/index.html";
    }

    pathname = pathname.split("/")[1];
    const route = routes.find((r) => r.path === pathname);

    if (route) {
        return route.handler(req, res);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
};
