// variables and stuff
var onlineObj = {};
var onlineList = [];

// requirements
var socket_io = require('socket.io');
var express = require('express');
var Timer = require('timrjs');
var http = require('http');

// convert cards json to variables then send them to the front end
var cards = require('./cards.json');
console.log(cards.blackCards[0]);

// timer stuff
var timer = Timer(30);

var app = express();

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function(socket){
  console.log('client connected');
  io.emit('cardList', cards);
  socket.on('message', function(message){
    console.log('message recieved', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('userReg', function(nickname){
    onlineObj[nickname] = socket;
    console.log(nickname);
    socket.nickname = nickname;
    onlineList.push(nickname);
    socket.broadcast.emit('message', nickname + "<em>" + ' has just logged in' + "</em>");
    if (!timer.isRunning()){
      console.log(timer);
      timer.ticker(function(formattedTime, percentDone, currentTime, startTime, self){
        io.emit('tick', formattedTime);
      });
      timer.finish(function(){
        io.emit('gameStart');
        io.emit('userList', onlineList);
      });

      timer.start();
    }
    // io.emit('tick', timer);
  });
  socket.on('disconnect', function(){
    var index = onlineList.indexOf(socket.nickname);
    console.log("this is the index : " + index);
    var removed = onlineList.splice(index, 1);
    socket.broadcast.emit('userList', onlineList);
    socket.broadcast.emit('message', socket.nickname + "<em>"  + ' has just logged out' + "</em>");
  });
});

server.listen(process.env.PORT || 8080);
