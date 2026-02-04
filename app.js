const http = require("http");
const url = require('url');
const { parse } = require('querystring');
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

const sessions = [];

http.createServer(function (request, response) {

    const pathparam = url.parse(request.url, true).pathname;
    console.log(request.method + ' ' + pathparam + ' ' + request.headers.cookie)

    // For main page, get html
    if (request.method == "GET" && pathparam == "/") {
        const filePath = path.join(__dirname, 'index.html');


        if(sessions.indexOf(request.headers.cookie)){
          console.log("YOU IN GAME! reconnect....maybe")
        }



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
    }
    
    if (request.method == "GET" && pathparam == "/style.css") {
        const filePath = path.join(__dirname, 'style.css');
    
      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.statusCode = 500;
          response.end("Server error");
          return;
        }
        response.setHeader('Content-Type','text/css'+ '; charset=utf-8');
        response.end(data);
      });
      return;
    }
    
     if (request.method == "GET" && pathparam == "/client.js") {
        const filePath = path.join(__dirname, 'client.js');
    
      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.statusCode = 500;
          response.end("Server error");
          return;
        }
        response.setHeader('Content-Type','application/json'+ '; charset=utf-8');
        response.end(data);
      });
      return;
    }
    else
    {
        const uuid = crypto.randomUUID();
        const cookie = 'session=' + uuid+'; Max-Age=14400; HttpOnly';
        sessions.push(uuid);
        console.log(sessions);
        setTimeout(()=>{
          sessions.shift();
          console.log(sessions);
        },14400000);
        response.setHeader('Set-Cookie', cookie);
        response.end(JSON.stringify(uuid));
    }
  })
  .listen(3000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 3000");
  });
