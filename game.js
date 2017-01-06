var Deck = require('./deck.js').Deck;
var _ = require('underscore');

var game = {
  started: false,
  players: [],
  deck: new Deck(),
  blackCard: null,
  addPlayer: function(player, nickname) {
    player.nickname = nickname,
    player.hand = [],
    player.answers = [];
    player.vote = null;
    player.score = 0;
    this.players.push(player);
  },
  removePlayer: function(player) {
    var index = this.players.indexOf(player);
    this.players.splice(index, 1);
  },
  start: function(){
    this.started = true;
    this.blackCard = this.deck.getBlackCard();
    // populate player hand
    _.each(this.players, function(player){
      for (i = 0; i <= 5; i++) {
        player.hand.push(this.deck.getWhiteCard());
      };
    }, this);
  },
  cardSubmitted: function(player, card){
    // var playerIndex = players.indexOf(player);
    // var actualPlayer = players[playerIndex];
    if (player.answers.length >= this.blackCard.pick) {
      // DO SOMETHING ABOUT IT
      return false;
    }
    player.answers.push(card);
    return true;
  },
  playerPlayed: function(player) {
    return player.answers.length === this.blackCard.pick;
  },
  everyonePlayed: function(){
    return _.every(this.players, this.playerPlayed, this);
  },
  playersAnswers: function(){
    return _.map(game.players, function(player){
      return {player: player.nickname, answers: player.answers}
    });
  },
  cardVoted: function(player, card){
    // @TODO: check if the card was played at all.
    // @TODO: don't let the player vote for himself.
    if (player.vote) { return false; }
    else {
      player.vote = card;
      return true;
    }
  },
  everyoneVoted: function(){
    return _.every(this.players, function(p){ return p.vote; }, this);
  },
  findAnswerOwner: function(card) {
    return _.find(this.players, function(player){
        return _.contains(player.answers, card);
      }, this)
  },
  voteScoring: function(){
    _.each(this.players, function(player){
      var owner = this.findAnswerOwner(player.vote);
      owner.score++;
    }, this)
  },
  newTurn: function(){
    _.each(this.players, function(player){
      var missingCards = 6 - player.hand.length;
      for (i = 0; i < missingCards; i++) {
        player.hand.push(this.deck.getWhiteCard());
      };
      console.log(player.score);
      player.answers = [];
      player.vote = null;
      this.blackCard = this.deck.getBlackCard();
    }, this);
  }
};

module.exports = game;
