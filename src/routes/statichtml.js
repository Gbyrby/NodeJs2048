const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = [
  {
    method: "GET",
    path: "/",
    handler(request, response) {
      const filePath = path.join(__dirname, "..", "index.html");
      fs.readFile(filePath, (err, data) => {
        if (err) {
          response.statusCode = 500;
          response.end("Server error");
          return;
        }
        response.setHeader("Content-Type", "text/html" + "; charset=utf-8");
        response.end(data);
      });
      return;
    },
  },
];
