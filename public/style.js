var $whiteCard = $('.whiteCard');
var $playerCards = $('.playerCards');
var $clickedWhite = '.clickedWhiteCard';

var $vote = $('.votingCard');
var $votingCards = $('.votingCards');


$(document).ready(function(){

  $playerCards.on('click', function(e){
      $($clickedWhite).toggleClass('clickedWhiteCard whiteCard');
      $(e.target).toggleClass('clickedWhiteCard');
      $(e.target).toggleClass('whiteCard');
  });

  $votingCards.on('click', function(e){
    $('.clickedVoteCard').toggleClass('clickedVoteCard votingCard');
    $(e.target).toggleClass('clickedVoteCard');
    $(e.target).toggleClass('votingCard');
  });


// next steps....go to main fontend.js and do a submit button...
// and on the submit button then send an event to back end and the clicked .val(), or .html();
// then give the information from the backend to the frontend

});
