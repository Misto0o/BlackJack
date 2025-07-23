// deck.js
const SUITS = ["♠", "♣", "♥", "♦"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const SUIT_MAP = {
  "♠": "S",
  "♣": "C",
  "♥": "H",
  "♦": "D",
};

export default class Deck {
  constructor(cards = freshDeck()) {
    this.cards = cards;
  }

  get numberOfCards() {
    return this.cards.length;
  }

  pop() {
    return this.cards.shift();
  }

  push(card) {
    this.cards.push(card);
  }

  shuffle() {
    for (let i = this.numberOfCards - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[newIndex]] = [this.cards[newIndex], this.cards[i]];
    }
  }
}

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  get shortSuit() {
    return SUIT_MAP[this.suit];
  }

  get imagePath() {
    return `./cards/${this.value}-${this.shortSuit}.png`;
  }

  get color() {
    return this.suit === "♣" || this.suit === "♠" ? "black" : "red";
  }

  getHTML() {
    const img = document.createElement("img");
    img.src = this.imagePath;
    img.alt = `${this.value} of ${this.suit}`;
    img.classList.add("card-img");
    return img;
  }
}

function freshDeck() {
  return SUITS.flatMap((suit) => {
    return VALUES.map((value) => new Card(suit, value));
  });
}
