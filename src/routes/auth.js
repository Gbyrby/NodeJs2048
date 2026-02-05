const http = require("http");
const url = require("url");
const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = [
  {
    method: "POST",
    path: "/auth",
    handler(request, response) {
      const uuid = crypto.randomUUID();
              const cookie = 'session=' + uuid+'; Max-Age=14400; HttpOnly';
              response.setHeader('Set-Cookie', cookie);
              response.end(JSON.stringify(uuid));
    },
  },
];
