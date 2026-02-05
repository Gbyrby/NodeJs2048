const url = require("url");

const htmlRoutes = require("./routes/statichtml");
const cssRoutes = require("./routes/staticcss")
const jsRoutes = require("./routes/staticjs")
const authRoutes = require("./routes/auth")

const routes = [
    ...htmlRoutes,
    ...cssRoutes,
    ...jsRoutes,
    ...authRoutes
];

module.exports = (req, res) => {
    const { pathname } = url.parse(req.url);

    const route = routes.find(r =>
        r.method === req.method && r.path === pathname
    );

    if (route) {
        return route.handler(req, res);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
};
