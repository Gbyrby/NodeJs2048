const http = require("http");

const router = require("./router");
const port = process.env.PORT || 3000;
http.createServer(function (request, response) {
    const start = performance.now();
    router(request, response);
    const end = performance.now();
    console.log(`Время выполнения: ${end - start} мс`);
}).listen(port, "0.0.0.0", function () {
    console.log(`Сервер начал прослушивание запросов на порту ${port}`);
});
