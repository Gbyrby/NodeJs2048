const http = require("http");
const url = require('url');
const { parse } = require('querystring');
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

const router = require('./router')

const sessions = [];

http.createServer(function (request, response) {
    router(request,response)
  })
  .listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
  });
