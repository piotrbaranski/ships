//This object is responsible for view actualization: displaying successful hits, missed hits and messages

var view = {
  displayMessage: function (message) {
    var messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = message;
  },
  displayHitOrMiss: function (location, attempt) {
    var cell = document.getElementById(location);
    cell.setAttribute('class', attempt);
  }
};

//This object is responsible for ship tracking: where ships are, if they are hit and if a player did not sunk them

var model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipSunk: 0,
  ships: [
    {locations: [0, 0, 0], hits: ['', '', '']},
    {locations: [0, 0, 0], hits: ['', '', '']},
    {locations: [0, 0, 0], hits: ['', '', '']}
  ],
  fire: function (guess) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);
      if (ship.hits[index] === 'hit') {
        view.displayMessage('Ups, już wcześniej trafiłeś to pole!');
        return true;
      } else if (index >= 0) {
        ship.hits[index] = 'hit';
        view.displayHitOrMiss(guess, 'hit');
        view.displayMessage('TRAFIONY!');
        if (this.isSunk(ship)) {
          view.displayMessage('Zatopiłeś mój okręt!');
          this.shipSunk++;
        }
        return true;
      }
    }
    view.displayHitOrMiss(guess, 'miss');
    view.displayMessage('PUDŁO!')
    return false;
  },
  isSunk: function (ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== 'hit') {
        return false;
      }
    }
    return true;
  },
  generateShipLocations: function () {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
  },
  generateShip: function () {
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }
    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + '' + (col + i));
      } else {
        newShipLocations.push((row + i) + '' + col);
      }
    }
    return newShipLocations;
  },
  collision: function (locations) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  }
};

//This object is responsible for linking together the whole application, handling user actions and executing game logic

var controller = {
  guesses: 0,
  processGuesses: function (guess) {
    var location = this.parseGuesses(guess);
    if (location) {
      this.guesses++;
      var hit = model.fire(location);
      if (hit && model.shipSunk === model.numShips) {
        view.displayMessage('Zatopiłeś wszystkie moje okręty, w ' + this.guesses + ' próbach.');
      }
    }
  },
  parseGuesses: function (guess) {
    var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (guess === null || guess.length !== 2) {
      alert('Ups, proszę wpisać literę i cyfrę.');
    } else {
      var firstChar = guess.charAt(0).toUpperCase();
      var row = alphabet.indexOf(firstChar);
      var column = guess.charAt(1);
      if (isNaN(row) || isNaN(column)) {
        alert('Ups, to nie są współrzędne!');
      } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
        alert('Ups, pole jest poza planszą!')
      } else {
        return row + column;
      }
    }
    return null;
  }
}

function init() {
  var fireButton = document.getElementById('fireButton');
  fireButton.onclick = handleFireButton;
  var guessInput = document.getElementById('guessInput');
  guessInput.onkeypress = handleKeyPress;

  model.generateShipLocations();
}

function handleFireButton() {
  var guessInput = document.getElementById('guessInput');
  var guess = guessInput.value;
  controller.processGuesses(guess);

  guessInput.value = '';
}

function handleKeyPress(e) {
  var fireButton = document.getElementById('fireButton');
  if (e.keyCode === 13) {
    fireButton.click();
    return false;
  }
}

window.onload = init;
