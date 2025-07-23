import Deck from "./deck.js";

// Game state
let deck;
let dealerSum = 0;
let yourSum = 0;
let player2Sum = 0;
let dealerAceCount = 0;
let yourAceCount = 0;
let player2AceCount = 0;
let hidden;
let canHit = true;
let turn = 1;
let bet = 10;
let betPlaced = false;
let mode = "single";
let credits = { p1: 100, p2: 100 };

// Utility functions
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element with ID '${id}' not found.`);
    return el;
}
function updateCredits() {
    const p1 = getEl("credits-p1");
    const p2 = getEl("credits-p2");
    if (p1) p1.innerText = credits.p1;
    if (p2) p2.innerText = credits.p2;
}
function updateScores() {
    const yourSumEl = getEl("your-sum");
    if (!yourSumEl) return;
    if (mode === "friend") {
        yourSumEl.innerText = turn === 1 ? yourSum : player2Sum;
    } else {
        yourSumEl.innerText = yourSum;
    }
}
function getValue(card) {
    let value = card.split("-")[0];
    if (value === "A") return 11;
    if (["K", "Q", "J"].includes(value)) return 10;
    return parseInt(value);
}
function checkAce(card) {
    return card[0] === "A" ? 1 : 0;
}
function reduceAce(sum, aceCount) {
    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount -= 1;
    }
    return sum;
}
function showResultModal(message) {
    let modal = getEl('result-modal');
    let modalTitle = getEl('modal-title');
    let modalMessage = getEl('modal-message');
    if (!modal || !modalTitle || !modalMessage) return;
    if (message.toLowerCase().includes('win')) {
        modalTitle.textContent = 'Win!';
        modalMessage.textContent = 'Congratulations!';
    } else if (message.toLowerCase().includes('lose')) {
        modalTitle.textContent = 'Lose!';
        modalMessage.textContent = 'Better luck next time!';
    } else {
        modalTitle.textContent = 'Tie!';
        modalMessage.textContent = 'It\'s a draw.';
    }
    modal.style.display = 'flex';
}

// Friend mode hit
function hitFriend() {
    if (!canHit) return;
    let card = deck.pop();
    let cardImg = document.createElement("img");
    let suit = card.suit;
    if (suit === "♣") suit = "C";
    if (suit === "♦") suit = "D";
    if (suit === "♥") suit = "H";
    if (suit === "♠") suit = "S";
    cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
    if (turn === 1) {
        yourSum += getValue(card.value + "-" + suit);
        yourAceCount += checkAce(card.value + "-" + suit);
    } else {
        player2Sum += getValue(card.value + "-" + suit);
        player2AceCount += checkAce(card.value + "-" + suit);
    }
    const el = getEl("your-cards");
    if (el) el.append(cardImg);
    updateScores();
    if ((turn === 1 && reduceAce(yourSum, yourAceCount) > 21) || (turn === 2 && reduceAce(player2Sum, player2AceCount) > 21)) {
        canHit = false;
        stayFriend();
    }
}
function stayFriend() {
    const el = getEl;
    if (turn === 1) {
        yourSum = reduceAce(yourSum, yourAceCount);
        canHit = false;
        if (el("your-cards")) el("your-cards").innerHTML = "";
        if (el("your-sum")) el("your-sum").innerText = "";
        if (el("player-label")) el("player-label").innerText = "Player 2: ";
        if (el("turn-indicator")) el("turn-indicator").innerText = "Player 2's Turn";
        turn = 2;
        canHit = true;
        player2Sum = 0;
        player2AceCount = 0;
        for (let i = 0; i < 2; i++) {
            let card = deck.pop();
            let cardImg = document.createElement("img");
            let suit = card.suit;
            if (suit === "♣") suit = "C";
            if (suit === "♦") suit = "D";
            if (suit === "♥") suit = "H";
            if (suit === "♠") suit = "S";
            cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
            player2Sum += getValue(card.value + "-" + suit);
            player2AceCount += checkAce(card.value + "-" + suit);
            if (el("your-cards")) el("your-cards").append(cardImg);
        }
        updateScores();
        if (el("hit")) el("hit").onclick = hitFriend;
        if (el("stay")) el("stay").onclick = stayFriend;
    } else {
        player2Sum = reduceAce(player2Sum, player2AceCount);
        canHit = false;
        let message = "";
        let p1Bet = typeof bet === 'object' ? bet.p1 : bet;
        let p2Bet = typeof bet === 'object' ? bet.p2 : bet;
        if (yourSum > 21 && player2Sum > 21) {
            message = "Both Bust! Tie!";
        } else if (yourSum > 21) {
            message = "Player 2 Wins!";
            credits.p2 += p2Bet;
            credits.p1 -= p1Bet;
        } else if (player2Sum > 21) {
            message = "Player 1 Wins!";
            credits.p1 += p1Bet;
            credits.p2 -= p2Bet;
        } else if (yourSum == player2Sum) {
            message = "Tie!";
        } else if (yourSum > player2Sum) {
            message = "Player 1 Wins!";
            credits.p1 += p1Bet;
            credits.p2 -= p2Bet;
        } else {
            message = "Player 2 Wins!";
            credits.p2 += p2Bet;
            credits.p1 -= p1Bet;
        }
        updateCredits();
        if (el("results")) el("results").innerText = message;
        showResultModal(message);
    }
}

// Single player hit
function hit() {
    if (!canHit) return;
    let card = deck.pop();
    let cardImg = document.createElement("img");
    let suit = card.suit;
    if (suit === "♣") suit = "C";
    if (suit === "♦") suit = "D";
    if (suit === "♥") suit = "H";
    if (suit === "♠") suit = "S";
    cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
    yourSum += getValue(card.value + "-" + suit);
    yourAceCount += checkAce(card.value + "-" + suit);
    const el = getEl("your-cards");
    if (el) el.append(cardImg);
    updateScores();
    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        stay();
    }
}
function stay() {
    canHit = false;
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);
    const el = getEl;
    if (el("dealer-cards")) el("dealer-cards").innerHTML = "";
    let suit = hidden.suit;
    if (suit === "♣") suit = "C";
    if (suit === "♦") suit = "D";
    if (suit === "♥") suit = "H";
    if (suit === "♠") suit = "S";
    let hiddenImg = document.createElement("img");
    hiddenImg.src = "./cards/" + hidden.value + "-" + suit + ".png";
    if (el("dealer-cards")) el("dealer-cards").append(hiddenImg);
    if (el("dealer-sum")) el("dealer-sum").innerText = dealerSum;
    let message = "";
    let p1Bet = typeof bet === 'object' ? bet.p1 : bet;
    if (yourSum > 21) {
        message = "Bust! You Lose!";
        credits.p1 -= p1Bet;
    } else if (dealerSum > 21) {
        message = "Dealer Busts! You Win!";
        credits.p1 += p1Bet;
    } else if (yourSum == dealerSum) {
        message = "Tie!";
    } else if (yourSum > dealerSum) {
        message = "You Win!";
        credits.p1 += p1Bet;
    } else {
        message = "You Lose!";
        credits.p1 -= p1Bet;
    }
    updateCredits();
    if (el("results")) el("results").innerText = message;
    showResultModal(message);
}

// UI setup
window.onload = function () {
    deck = new Deck();
    deck.shuffle();
    setupBetInputs();
    setupUI();
    updateCredits();
};

function setupBetInputs() {
    const betRow = getEl("bet-row");
    if (!betRow) return;
    betRow.innerHTML = `
        <label for="bet-amount-p1">Bet P1:</label>
        <input type="number" id="bet-amount-p1" min="1" value="10" class="game-btn" style="width:70px;">
        <label for="bet-amount-p2" id="bet-label-p2" style="display:none;">Bet P2:</label>
        <input type="number" id="bet-amount-p2" min="1" value="10" class="game-btn" style="width:70px; display:none;">
        <button id="place-bet" class="game-btn">Place Bet</button>
        <button id="new-game" class="game-btn">New Game</button>
    `;
    getEl("bet-label-p2").style.display = "none";
    getEl("bet-amount-p2").style.display = "none";
}

function setupUI() {
    getEl("mode-toggle").addEventListener("change", function (e) {
        mode = e.target.value;
        getEl("credits-p2-wrap").style.display = (mode === "friend") ? "block" : "none";
        getEl("bet-label-p2").style.display = (mode === "friend") ? "inline-block" : "none";
        getEl("bet-amount-p2").style.display = (mode === "friend") ? "inline-block" : "none";
        resetGame();
    });
    getEl("place-bet").addEventListener("click", function () {
        let val1 = parseInt(getEl("bet-amount-p1").value);
        let val2 = mode === "friend" ? parseInt(getEl("bet-amount-p2").value) : val1;
        if (val1 > 0 && val1 <= credits.p1 && val2 > 0 && val2 <= credits.p2) {
            bet = mode === "friend" ? { p1: val1, p2: val2 } : val1;
            betPlaced = true;
            getEl("place-bet").disabled = true;
            startGame();
        }
    });
    getEl("new-game").addEventListener("click", function () {
        credits = { p1: 100, p2: 100 };
        updateCredits();
        resetGame();
        getEl("bet-amount-p1").value = 10;
        if (getEl("bet-amount-p2")) getEl("bet-amount-p2").value = 10;
        getEl("place-bet").disabled = false;
        getEl("result-modal").style.display = "none";
    });
    getEl("close-modal").onclick = function () {
        getEl("result-modal").style.display = "none";
    };
    getEl("play-again").onclick = function () {
        resetGame();
        getEl("result-modal").style.display = "none";
        getEl("place-bet").disabled = false;
    };
    resetGame();
}

function resetGame() {
    dealerSum = 0;
    yourSum = 0;
    player2Sum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    player2AceCount = 0;
    canHit = true;
    turn = 1;
    betPlaced = false;
    deck = new Deck();
    deck.shuffle();
    const el = getEl;
    if (el("place-bet")) el("place-bet").disabled = false;
    if (mode === "friend") {
        if (el("dealer-label")) el("dealer-label").style.display = "none";
        if (el("dealer-cards")) el("dealer-cards").style.display = "none";
    } else {
        if (el("dealer-label")) el("dealer-label").style.display = "";
        if (el("dealer-cards")) el("dealer-cards").style.display = "";
        if (el("dealer-cards")) el("dealer-cards").innerHTML = '<img id="hidden" src="cards/BACK.png">';
        if (el("dealer-sum")) el("dealer-sum").innerText = "";
    }
    if (el("your-cards")) el("your-cards").innerHTML = "";
    if (el("your-sum")) el("your-sum").innerText = "";
    if (el("results")) el("results").innerText = "";
    if (el("player-label")) el("player-label").innerText = mode === "friend" ? "Player 1: " : "You: ";
    if (el("turn-indicator")) el("turn-indicator").innerText = mode === "friend" ? "Player 1's Turn" : "Your Turn";
    if (el("hit")) el("hit").style.display = "inline-block";
    if (el("stay")) el("stay").style.display = "inline-block";
}

checkCredits();
function checkCredits() {
    if (credits.p1 <= 0 || credits.p2 <= 0) {
        let modal = getEl('result-modal');
        let modalTitle = getEl('modal-title');
        let modalMessage = getEl('modal-message');
        if (!modal || !modalTitle || !modalMessage) return;
        modalTitle.textContent = 'Game Over!';
        modalMessage.textContent = (credits.p1 <= 0 ? 'Player 1' : 'Player 2') + ' is out of credits! Click Play Again to restart.';
        modal.style.display = 'flex';
    }
}

function startGame() {
    if (!betPlaced) return;
    const el = getEl;
    if (mode === "friend") {
        if (el("dealer-cards")) el("dealer-cards").innerHTML = "";
        if (el("dealer-sum")) el("dealer-sum").innerText = "";
        if (el("your-cards")) el("your-cards").innerHTML = "";
        yourSum = 0;
        yourAceCount = 0;
        for (let i = 0; i < 2; i++) {
            let card = deck.pop();
            let cardImg = document.createElement("img");
            let suit = card.suit;
            if (suit === "♣") suit = "C";
            if (suit === "♦") suit = "D";
            if (suit === "♥") suit = "H";
            if (suit === "♠") suit = "S";
            cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
            yourSum += getValue(card.value + "-" + suit);
            yourAceCount += checkAce(card.value + "-" + suit);
            if (el("your-cards")) el("your-cards").append(cardImg);
        }
        updateScores();
        if (el("hit")) el("hit").onclick = hitFriend;
        if (el("stay")) el("stay").onclick = stayFriend;
    } else {
        // Dealer setup
        hidden = deck.pop();
        let hiddenSuit = hidden.suit;
        if (hiddenSuit === "♣") hiddenSuit = "C";
        if (hiddenSuit === "♦") hiddenSuit = "D";
        if (hiddenSuit === "♥") hiddenSuit = "H";
        if (hiddenSuit === "♠") hiddenSuit = "S";
        dealerSum = getValue(hidden.value + "-" + hiddenSuit);
        dealerAceCount = checkAce(hidden.value + "-" + hiddenSuit);
        if (el("dealer-cards")) el("dealer-cards").innerHTML = '<img id="hidden" src="cards/BACK.png">';
        while (dealerSum < 17) {
            let card = deck.pop();
            let cardImg = document.createElement("img");
            let suit = card.suit;
            if (suit === "♣") suit = "C";
            if (suit === "♦") suit = "D";
            if (suit === "♥") suit = "H";
            if (suit === "♠") suit = "S";
            cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
            dealerSum += getValue(card.value + "-" + suit);
            dealerAceCount += checkAce(card.value + "-" + suit);
            if (el("dealer-cards")) el("dealer-cards").append(cardImg);
        }
        // Player setup
        if (el("your-cards")) el("your-cards").innerHTML = "";
        yourSum = 0;
        yourAceCount = 0;
        for (let i = 0; i < 2; i++) {
            let card = deck.pop();
            let cardImg = document.createElement("img");
            let suit = card.suit;
            if (suit === "♣") suit = "C";
            if (suit === "♦") suit = "D";
            if (suit === "♥") suit = "H";
            if (suit === "♠") suit = "S";
            cardImg.src = "./cards/" + card.value + "-" + suit + ".png";
            yourSum += getValue(card.value + "-" + suit);
            yourAceCount += checkAce(card.value + "-" + suit);
            if (el("your-cards")) el("your-cards").append(cardImg);
        }
        updateScores();
        if (el("hit")) el("hit").onclick = hit;
        if (el("stay")) el("stay").onclick = stay;
    }
}