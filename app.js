const http = require("http");
const url = require('url');
const { parse } = require('querystring');

http.createServer(function(request,response){
    const path = url.parse(request.url,true).pathname;

    response.end(path);


    
}).listen(3000, "127.0.0.1",function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});