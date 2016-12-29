// variables and stuff
var onlineObj = {};
var onlineList = [];
// make an object that tracks the 'state of the turn' ie. which players submitted which cards
var answers = [];
// make another 'game state' {} that will track how many points each player has
// black card
var blackCard = {};
// submitted amount
var playersSubmitted = 0;
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
var timer = Timer(10);

var app = express();

app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function(socket) {
    // console.log('client connected');
    socket.on('message', function(message) {
        // console.log('message recieved', message);
        socket.broadcast.emit('message', message);
    });
    socket.on('userReg', function(nickname) {
        onlineObj[nickname] = socket;
        socket.nickname = nickname;
        onlineList.push(nickname);
        socket.broadcast.emit('message', nickname + "<em>" + ' has just logged in' + "</em>");
        if (!timer.isRunning()) {
            timer.ticker(function(formattedTime, percentDone, currentTime, startTime, self) {
                io.emit('tick', formattedTime);
            });
            timer.finish(function() {
                io.emit('gameStart');
                // get a black card from the deck.js
                blackCard = deck.getBlackCard();
                io.emit('drawBlackCard', blackCard);
                console.log(blackCard);
                io.emit('userList', onlineList);
                // console.log(onlineObj);
                answers = [];
                _.each(onlineObj, function(playerSocket, playerName) {
                    // resets the played cards for this turn
                      answers.push({name: playerName, cardsSubmitted: []});
                    // fills the player hands
                    var playerHand = [];
                    for (i = 0; i <= 6; i++) {
                        playerHand.push(deck.getWhiteCard())
                    };
                    playerSocket.emit('cardList', playerHand);
                });
            });

            timer.start();
        }
        // io.emit('tick', timer);
    });

    socket.on('disconnect', function() {
        var index = onlineList.indexOf(socket.nickname);
        // console.log("this is the index : " + index);
        var removed = onlineList.splice(index, 1);
        socket.broadcast.emit('userList', onlineList);
        socket.broadcast.emit('message', socket.nickname + "<em>" + ' has just logged out' + "</em>");
    });

    socket.on('cardSubmitted', function(submittedCard) {
        var answer = answers.find(function(e){
          return e.name == socket.nickname
        });
        // console.log(submittedCard);
        answer.cardsSubmitted.push(submittedCard);

        _.each(answers, function(cardsSubmitted){
          console.log(blackCard);
          console.log(cardsSubmitted);
          console.log(cardsSubmitted.cardsSubmitted.length);
          if (cardsSubmitted.cardsSubmitted.length == blackCard.pick){
            console.log("time for answers" + cardsSubmitted.cardsSubmitted.length);
            socket.emit('answersSubmitted');
            playersSubmitted++;
          };
        });

        console.log("submitted var = " + playersSubmitted);
        console.log("online list = " + onlineList.length);
        // end turn when player submits the "cards.pick #"
        if(playersSubmitted == onlineList.length){
            console.log("this person has submitted enough cards " + socket.nickname);
            // this event should submit to both players once both players have...
            // ...submitted their answers
          io.emit('turnOver', answers);
        };

        deck.removeWhiteCard(submittedCard);
        var draw = deck.getWhiteCard();
        // console.log(draw);
        socket.emit('cardDeleted', draw);
    });

});


server.listen(process.env.PORT || 8080);
