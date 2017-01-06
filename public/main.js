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

    $('.close').on('click', function() {
        $('.nicknameModal').hide();
        $('.start').show();
    })

    // hide the timer and "waiting for other player to join"
    var gameStart = function() {
        console.log('game has started!');
        timer.hide();
        $('.waiting').hide();
    };
    // Write message and append to message area
    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };

    var displayTimer = function() {
        $('.timerWrap').show();
        $('.waiting').html("Waiting for opponents to join");
    };
    // Count down timer showing the formattedTime
    var runTimer = function(formattedTime) {
        timer.html(formattedTime);
        console.log('timer running!');
    };

    // shows the first hand
    var showHand = function(cards) {
        $('.playerCards').html("");
        console.log(cards)
        $('.cardsWrapper').show();
        $('.submitBtn').show();
        cards.forEach(function(card) {
            $('.playerCards').append("<div class='whiteCard'>" + card + "</div>");
        });
        $('.submitBtn').append("<div class='submit'> Submit </div>");
    };
    // shows all subsequent hands after
    var showNewHand = function(cards) {
        $('.votingCards').html("");
        $('.playerCards').html("");
        $('.blackCardArea').html("");
        $('.submitBtn').html("");
        $('.waitingMessageWrapper').hide();
        console.log(cards)
        $('.cardsWrapper').show();
        $('.submitBtn').show();
        cards.forEach(function(card) {
            $('.playerCards').append("<div class='whiteCard'>" + card + "</div>");
        });
        $('.submitBtn').append("<div class='submit'> Submit </div>");
    };

    // add a new card from the deck
    var drawCard = function(draw) {
        $('.playerCards').append("<div class='whiteCard'>" + draw + "</div>")
    };

    // remove the clickedWhiteCard that is submitted
    var removeCard = function(submittedCard) {
        console.log($("div.clickedWhiteCard:contains('" + submittedCard + "')"));
        $("div.clickedWhiteCard:contains('" + submittedCard + "')").remove();
    };

    // submits card when you click the submitted card and runs the removeCard();
    $('.submitBtn').on('click', function() {
        var submittedCard = $('.clickedWhiteCard').text();
        socket.emit('cardSubmitted', submittedCard);
        removeCard(submittedCard);
    });

    // append blackCard to the .blackCardArea
    var displayBlackCard = function(blackCard) {
        $('.blackCardArea').append("<h1 class='blackCard'>" + blackCard.text + "</h1>");
    };

    var stopSubmit = function() {
        $('.submitBtn').hide();
        $('.waitingMessage').show();
    };

    var startVoting = function(answers) {
        console.log(answers);
        $('.cardsWrapper').hide();
        answers.forEach(function(card) {
            // console.log(card.cardsSubmitted.text);
            for (i = 0; i < card.answers.length; i++) {
                console.log(card.answers[i]);
                $('.votingCards').append("<div class='votingCard'>" + card.answers[i] + "</div>");
            }
        })
        $('.votingBtn').append("<div class='submit2'> Submit </div>");
    };

    var removeVoteCard = function(votedCard) {
        // remove the submitted card
        console.log($("div.clickedVoteCard:contains('" + votedCard + "')"));
        $("div.clickedVoteCard:contains('" + votedCard + "')").remove();
    };

    // on click for the card runs removeVoteCard()
    $('.votingBtn').on('click', function() {
        var votedCard = $('.clickedVoteCard').text();
        console.log(votedCard);
        // @ TODO: if you have a pick:2+ blackcard property you should be able to vote more
        socket.emit('cardVoted', votedCard);
        removeVoteCard(votedCard);
        $('.votingBtn').html("");
    });

    var updateScores = function(players){
      // @TODO best way to update scores?
      // $('.score').children().empty();
      displayScoreBar(players);
      // console.log(player);
      // var nickname = player[0];
      // var score = player[1];
      // var newElement = "<div class=" + nickname + "> <h2>" + nickname + "'s score is:" + "</h2> <br>" + score + "</div>";
      // if ($("div").hasClass(nickname)){
      //   console.log(player);
      // $('div.' + nickname).replaceWith(newElement);
      // }
    };

    var displayScoreBar = function(players){
      $('.score').empty();
      _.each(players, function(player){
      var nickname = player.nickname;
      var score = player.score;
      $('.score').append("<div class=" + nickname + "> <h2>" + nickname + "'s score is:" + "</h2> <br>" + score + "</div>");
    });
    };

    // socket event functions
    // socket.on('newTurn', displayCards);
    socket.on('players', displayScoreBar);
    socket.on('score', updateScores);
    socket.on('newCards', showNewHand);
    socket.on('turnOver', startVoting);
    socket.on('answersSubmitted', stopSubmit);
    socket.on('drawBlackCard', displayBlackCard);
    socket.on('cardList', showHand);
    socket.on('gameStart', gameStart);
    socket.on('tick', runTimer);
});
