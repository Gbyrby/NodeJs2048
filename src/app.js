const http = require("http");

const router = require("./router");
const port = process.env.PORT || 3000;
http.createServer(function (request, response) {
    router(request, response);
}).listen(port, "0.0.0.0", function () {
    console.log(`Сервер начал прослушивание запросов на порту ${port}`);
});
