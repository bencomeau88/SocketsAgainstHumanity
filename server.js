// variables and stuff
var onlineObj = {};
var onlineList = [];
var answers = [];

// requirements
var socket_io = require('socket.io');
var express = require('express');
var Timer = require('timrjs');
var http = require('http');
var _ = require('underscore');
// will return the object deck.js so you have to write .Deck
var Deck = require('./deck.js').Deck;
var deck = new Deck();

// convert cards json to variables then send them to the front end
var cards = require('./cards.json');

// timer stuff
var timer = Timer(2);

var app = express();

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function(socket){
  // console.log('client connected');
  socket.on('message', function(message){
    // console.log('message recieved', message);
    socket.broadcast.emit('message', message);
  });
  socket.on('userReg', function(nickname){
    onlineObj[nickname] = socket;
    socket.nickname = nickname;
    onlineList.push(nickname);
    socket.broadcast.emit('message', nickname + "<em>" + ' has just logged in' + "</em>");
    if (!timer.isRunning()){
      timer.ticker(function(formattedTime, percentDone, currentTime, startTime, self){
        io.emit('tick', formattedTime);
      });
      timer.finish(function(){
        io.emit('gameStart');
        io.emit('userList', onlineList);
        // console.log(onlineObj);
        _.each(onlineObj, function(playerSocket, playerName){
          var playerHand = [];
          for(i=0;i<=6;i++){
            playerHand.push(deck.getWhiteCard())
          };
          playerSocket.emit('cardList', playerHand);
        });
      });

      timer.start();
    }
    // io.emit('tick', timer);
  });
  socket.on('disconnect', function(){
    var index = onlineList.indexOf(socket.nickname);
    // console.log("this is the index : " + index);
    var removed = onlineList.splice(index, 1);
    socket.broadcast.emit('userList', onlineList);
    socket.broadcast.emit('message', socket.nickname + "<em>"  + ' has just logged out' + "</em>");
  });

  socket.on('cardSubmitted', function(submittedCard){
    console.log(submittedCard);
      answers.push(submittedCard);
      deck.removeWhiteCard();
      var draw = deck.getWhiteCard();
      socket.emit('cardDeleted', draw);
  });

});

server.listen(process.env.PORT || 8080);
