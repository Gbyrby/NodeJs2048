const http = require("http");

const router = require("./router");

http.createServer(function (request, response) {
    router(request, response);
}).listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
});
