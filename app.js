const http = require("http");
const url = require('url');
const { parse } = require('querystring');
const fs = require("fs");
const path = require("path");


http.createServer(function (request, response) {
    const pathparam = url.parse(request.url, true).pathname;

    if (request.method == "GET" && pathparam == "/") {
        const filePath = path.join(__dirname, 'index.html');

      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.statusCode = 500;
          response.end("Server error");
          return;
        }
        response.setHeader('Content-Type','text/html'+ '; charset=utf-8');
        response.end(data);
      });
      return;
    }else{
        response.end(request.method+' '+pathparam);
    }
  })
  .listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
  });
