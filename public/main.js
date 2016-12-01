// Global Variables
var hand = 0;

$(document ).ready(function(){
var socket = io();
var messages = $('.messages');
var nickname = '';
var modal = $('.nicknameModal');
var onlineList = $('.onlineList');
var timer = $('.timer');


$('.start').css("cursor", "pointer");
$('.start').on('click', function(){
  $('.start').hide();
  modal.show();
  // var nickname = prompt('What is your nickname?');
  // $('.userName').html(nickname);
});
$('.userName').submit(function(e){
  e.preventDefault();
  var user_input = $('.modalInput').val();
  socket.emit('userReg', user_input);
  socket.on('userList', onlineList);
  socket.on('tick', displayTimer);
  socket.on('message', addMessage);
    // run gameStart();
    var nickname = user_input;
    console.log(nickname);
    modal.hide();
});

// doesn't allow user to 'tab' off the modal
$('.close').on('keydown', function(e){
  if(e.which === 9){
    e.preventDefault();
    $('.modalInput').focus();
  }
});

// once someone hits the 'esc' button the modal closes
modal.keyup(function(e){
  if(e.keyCode === 27) { modal.hide() }
});

// once someone inputs their name and presses 'enter' the nicknameModal
// closes..the userName is added to the onlineList...
// and the gamestarts.
// there should be a timer that gives 60 seconds for other players to join?


$('.close').on('click', function(){
  $('.nicknameModal').hide();
  $('.start').show();
  // gameStart();
})

// function that starts the game once everyone is logged in
var gameStart = function(){
    console.log('game has started!');
    timer.hide();
    $('.waiting').hide();
};

var onlineList = function(nicknames){
  $('.onlineList').html(nicknames.map(function(nickname){return $("<div>" + nickname + "</div>")}));
}
var addMessage = function(message){
  messages.append('<div>' + message + '</div>');
};

var displayTimer = function(){
  $('.timerWrap').show();
  // .premature code for later possibly
  // $('.premature').show();
  // $('.premature').html("Click to Start Early");
  $('.waiting').html("Waiting for opponents to join");
}

var showHand = function(cards){
  var random = Math.floor((Math.random()* 459)+1);
  console.log(cards)
    for(i=0;i<=6;i++){
      console.log(cards.whiteCards[random]);
    }

}

var runTimer = function(formattedTime){
  timer.html(formattedTime);
  console.log('timer running!');
};
socket.on('cardList', showHand);
socket.on('gameStart', gameStart);
socket.on('tick', runTimer);
});
