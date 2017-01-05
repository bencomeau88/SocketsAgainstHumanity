// Global Variables
var hand = 0;
var host = false;
var submittedCard = '';
// submit 1 card at a time until you reach the pickAmount
var pickAmount = 0;

$(document).ready(function() {
    var socket = io();
    var messages = $('.messages');
    var nickname = '';
    var modal = $('.nicknameModal');
    var onlineList = $('.onlineList');
    var timer = $('.timer');


    $('.start').css("cursor", "pointer");
    $('.start').on('click', function() {
        $('.start').hide();
        modal.show();
        // var nickname = prompt('What is your nickname?');
        // $('.userName').html(nickname);
    });
    $('.userName').submit(function(e) {
        e.preventDefault();
        var user_input = $('.modalInput').val();
        socket.emit('userReg', user_input);
        // socket.on('userList', onlineList);
        socket.on('tick', displayTimer);
        socket.on('message', addMessage);
        // run gameStart();
        var nickname = user_input;
        // console.log(nickname);
        modal.hide();
    });

    // doesn't allow user to 'tab' off the modal
    $('.close').on('keydown', function(e) {
        if (e.which === 9) {
            e.preventDefault();
            $('.modalInput').focus();
        }
    });

    // once someone hits the 'esc' button the modal closes
    modal.keyup(function(e) {
        if (e.keyCode === 27) {
            modal.hide()
        }
    });

    // once someone inputs their name and presses 'enter' the nicknameModal
    // closes..the userName is added to the onlineList...
    // and the gamestarts.
    // there should be a timer that gives 60 seconds for other players to join?


    $('.close').on('click', function() {
        $('.nicknameModal').hide();
        $('.start').show();
        // gameStart();
    })

    // function that starts the game once everyone is logged in
    var gameStart = function() {
        console.log('game has started!');
        timer.hide();
        $('.waiting').hide();
    };

    var onlineList = function(nicknames) {
        $('.onlineList').html(nicknames.map(function(nickname) {
            return $("<div>" + nickname + "</div>")
        }));
    }
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };

    var displayTimer = function() {
        $('.timerWrap').show();
        // .premature code for later possibly
        // $('.premature').show();
        // $('.premature').html("Click to Start Early");
        $('.waiting').html("Waiting for opponents to join");
    }

    var runTimer = function(formattedTime) {
        timer.html(formattedTime);
        console.log('timer running!');
    };

    var showHand = function(cards) {
        console.log(cards)
        cards.forEach(function(card) {
            $('.playerCards').append("<div class='whiteCard'>" + card + "</div>");
        });
        $('.submitBtn').append("<div class='submit'> Submit </div>");
    };

    var removeCard = function(submittedCard) {
        // remove the submitted card
        console.log($("div.clickedWhiteCard:contains('" + submittedCard + "')"));
        $("div.clickedWhiteCard:contains('" + submittedCard + "')").remove();
    };

    // add a new card from the deck
    var drawCard = function(draw) {
        $('.playerCards').append("<div class='whiteCard'>" + draw + "</div>")
    };

    $('.submitBtn').on('click', function() {
        var submittedCard = $('.clickedWhiteCard').text();
        // console.log(submittedCard);
        socket.emit('cardSubmitted', submittedCard);
        removeCard(submittedCard);
    });

    var displayBlackCard = function(blackCard){
      // pickAmount = blackCard.pick;
      // console.log(blackCard);
      $('.blackCardArea').append("<h1 class='blackCard'>" + blackCard.text + "</h1>");
    };

    var stopSubmit = function(){
      $('.submitBtn').hide();
      $('.waitingMessage').show();
    };

    var startVoting = function(answers){
      console.log(answers);
      $('.cardsWrapper').hide();
      answers.forEach(function(card){
        // console.log(card.cardsSubmitted.text);
        for(i=0;i<card.answers.length;i++){
          console.log(card.answers[i]);
          $('.votingCards').append("<div class='votingCard'>" + card.answers[i] + "</div>");
        }
      })
      $('.votingBtn').append("<div class='submit2'> Submit </div>");
    };

    $('.votingBtn').on('click', function() {
        var votedCard = $('.clickedVoteCard').text();
        console.log(votedCard);
        // console.log(submittedCard);
        socket.emit('cardVoted', votedCard);
        removeVoteCard(votedCard);
        $('.votingBtn').hide();
    });

    var removeVoteCard = function(votedCard) {
        // remove the submitted card
        console.log($("div.clickedVoteCard:contains('" + votedCard + "')"));
        $("div.clickedVoteCard:contains('" + votedCard + "')").remove();
    };

    var displayCards = function(){
      $('.cardsWrapper').show();
      $('.waitingMessage').hide();
      $('.submitBtn').show();
      $('.votingCards').hide();
    };

    // var test1 = function(){
    //   console.log('test');
    // }

    // socket event functions
    // socket.on('questionMaster', setQuestionMaster)
    // socket.on('test', test1)
    socket.on('newTurn', displayCards);
    socket.on('turnOver', startVoting);
    socket.on('answersSubmitted', stopSubmit);
    socket.on('drawBlackCard', displayBlackCard);
    socket.on('cardList', showHand);
    socket.on('gameStart', gameStart);
    socket.on('tick', runTimer);
});
