// requirements
var _ = require('underscore');
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var game = require('./game.js');

// timer
var Timer = require('timrjs');
var timer = Timer(8);

var app = express();
var server = http.Server(app);
var io = socket_io(server);

// var onlineObj = {};
// var onlineList = [];

app.use(express.static('public'));

io.on('connection', function(socket) {
  console.log('connecting');

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('userReg', function(nickname) {

    if (!game.started) {
      game.addPlayer(socket, nickname);
      socket.join('gameRoom');
      socket.broadcast.emit('message', nickname + "<em>" + ' has just logged into the game room' + "</em>");
    } else {
      socket.emit('message', 'Game already started :( ');
    }

    if(!timer.isRunning()) {
      timer.ticker(function(formattedTime){
        io.in('gameRoom').emit('tick', formattedTime);
      });
      timer.finish(function(){
        io.in('gameRoom').emit('gameStart');
        game.start();
        io.in('gameRoom').emit('drawBlackCard', game.blackCard);
        _.each(game.players, function(player) {
          player.emit('cardList', player.hand);
        });
      })
      timer.start();
    }

  });

  socket.on('disconnect', function() {
    if (socket.nickname) {
      game.removePlayer(socket);
      socket.broadcast.emit('message', socket.nickname + "<em>" + ' has just logged out' + "</em>");
    }
    // socket.broadcast.emit('userList', onlineList);
  });

  socket.on('cardSubmitted', function(submittedCard) {
    var played = game.cardSubmitted(socket, submittedCard);

    if (!played) {
      socket.emit('message', 'Cannot play any more cards this turn.');
    } else {
      if (game.playerPlayed(socket)) {
        socket.emit('answersSubmitted');
      }
    }
    if (game.everyonePlayed()) {
      io.emit('turnOver', game.playersAnswers());
    }
  });


  socket.on('cardVoted', function(votedCard){
    var voted = game.cardVoted(socket, votedCard);
    if (!voted) { socket.emit('message', 'Cant play'); }
    else
    {
      // if (game.everyoneVoted()) {
        // io.emit('votingOver', game.playersVotes());
        game.voteScoring();
        // io.emit('score', game.playersScore());
        game.newTurn();
        _.each(game.players, function(player) {
          player.emit('newCards', player.hand);
        });
        io.in('gameRoom').emit('newTurn');
        io.in('gameRoom').emit('drawBlackCard', game.blackCard);
      // }
    }
  });
});

server.listen(process.env.PORT || 8080);
