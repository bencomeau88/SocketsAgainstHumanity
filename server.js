// requirements
var _ = require('underscore');
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var game = require('./game.js');

var app = express();
var server = http.Server(app);
var io = socket_io(server);

var onlineObj = {};
var onlineList = [];

app.use(express.static('public'));

io.on('connection', function(socket) {

  game.timer.ticker(function(formattedTime) {
    io.emit('tick', formattedTime);
  });

  game.timer.finish(function() {
    io.emit('gameStart');
    game.start();
    // get a black card from the deck.js
    io.emit('drawBlackCard', game.blackCard);
    console.log(game.players);
    _.each(game.players, function(player) {
      player.emit('cardList', player.hand);
    });
  });

  socket.on('message', function(message) {
    socket.broadcast.emit('message', message);
  });

  socket.on('userReg', function(nickname) {
    if (!game.started) {
      game.addPlayer(socket, nickname);
      socket.broadcast.emit('message', nickname + "<em>" + ' has just logged in' + "</em>");

      if (!game.timer.isRunning()) {
        game.timer.start();
      }
    } else {
      socket.emit('message', 'Game already started :(');
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

  socket.on('cardVoted', function(cardVoted){
    var voted = game.cardVoted(socket, card);
    if (!voted) { socket.emit('message', 'Cant play'); }
    else {
      socket.emit('cardVoted');
      if (game.everyoneVoted()) {
        io.emit('votingOver', game.playersVotes());
        game.scoring();
        io.emit('score', game.playersScore());
        game.newTurn();
        io.emit('newTurn');
      }
    }
  });
});

server.listen(process.env.PORT || 8080);
