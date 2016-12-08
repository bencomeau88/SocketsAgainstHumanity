var cards = require("./cards.json");
var _ = require("underscore");

var Deck = function(){
  this.whiteCards = _.shuffle(cards.whiteCards);
  this.blackCards = _.shuffle(cards.blackCards);

  // you could also use .pop(), which is a 'destructive'() and would change the...
  // array without the need to reassign
  this.getWhiteCard = function(){
    // returns 1 element but also removes it from the array
    return this.whiteCards.pop()
  }

  this.getBlackCard = function(){
    return this.blackCards.pop()
  }

  this.removeWhiteCard = function(cardSubmitted){
    return this.whiteCards.splice(0,1,cardSubmitted);
  }
}


// when deck.js is "required('')" the code requiring it gets the exports object
// var exports = {};
exports.Deck = Deck;

// you could use the .slice();
  // this.getWhiteCard = function(){
  //    var card = this.whiteCards[0];
  //   // slice doesn't change the array so we have to reassign the variable
  //    this.whiteCards = this.whiteCards.slice(1);
  //    return card;
  // }
  // this.getBlackCard = function(){
  //   var card = this.blackCards[0];
  //   this.blackCards = this.blackCards.slice(1);
  //   return card;
  // }
