let wordDictionary = [];
let correctWord = "";
const maxAttempts = 6;
let attempts = 0;
let currentGuess = "";

const gameContainer = document.getElementById("game-container");
const wordInput = document.getElementById("word-input");
const submitBtn = document.getElementById("submit-btn");
const message = document.getElementById("message");

// Fetch the word list
fetch("words.txt")
  .then(response => response.text())
  .then(data => {
    // Clean up the word list
    wordDictionary = data
      .split("\n")
      .map(word => word.trim().toLowerCase())
      .filter(word => /^[a-z]+$/.test(word)) // Ensure words contain only letters
      .filter(word => word.length === 5); // Ensure 5-letter words

    if (wordDictionary.length === 0) {
      throw new Error("No valid words found in the dictionary.");
    }

    // Select a random word as the correct word
    correctWord = wordDictionary[Math.floor(Math.random() * wordDictionary.length)];
    console.log("Correct Word:", correctWord); // Debugging purpose

    createGrid(); // Initialize the grid
  })
  .catch(err => {
    console.error("Failed to load word list:", err);
    message.textContent = "Failed to load words. Please try again later.";
  });

// Initialize the grid
function createGrid() {
  gameContainer.innerHTML = ""; // Clear the grid for a new game
  for (let i = 0; i < maxAttempts * 5; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    gameContainer.appendChild(tile);
  }
  attempts = 0;
  currentGuess = "";
}

// Validate and check the word
function checkWord() {
  if (currentGuess.length !== 5) {
    message.textContent = "Please complete the word.";
    return;
  }

  if (!wordDictionary.includes(currentGuess)) {
    message.textContent = "Invalid word! Try again.";
    return;
  }

  const rowStart = attempts * 5;
  const tiles = Array.from(gameContainer.children).slice(rowStart, rowStart + 5);

  currentGuess.split("").forEach((char, index) => {
    const tile = tiles[index];
    tile.textContent = char;

    if (char === correctWord[index]) {
      tile.classList.add("correct");
    } else if (correctWord.includes(char)) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }
  });

  if (currentGuess === correctWord) {
    message.textContent = "🎉 Congratulations! You guessed the word!";
    setTimeout(resetGame, 1000); // Start a new game after success
    return;
  }

  if (++attempts === maxAttempts) {
    message.textContent = `Game over! The word was "${correctWord}".`;
    setTimeout(resetGame, 1000); // Start a new game after failure
    return;
  }

  currentGuess = "";
}

// Reset the game
function resetGame() {
  message.textContent = "";
  correctWord = wordDictionary[Math.floor(Math.random() * wordDictionary.length)];
  createGrid();
}

// Handle keyboard input
function handleInput(key) {
  if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
    const tiles = Array.from(gameContainer.children).slice(attempts * 5, attempts * 5 + 5);
    tiles[currentGuess.length].textContent = key;
    currentGuess += key;
  } else if (key === "Backspace" && currentGuess.length > 0) {
    const tiles = Array.from(gameContainer.children).slice(attempts * 5, attempts * 5 + 5);
    tiles[currentGuess.length - 1].textContent = "";
    currentGuess = currentGuess.slice(0, -1);
  } else if (key === "Enter") {
    checkWord();
    wordInput.value = ""; // Clear the input box after pressing Enter
  }
}

// Add event listener for keyboard input
document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    currentGuess = wordInput.value.toLowerCase(); // Use input value as guess
    checkWord(); // Validate and check the word
    wordInput.value = ""; // Clear the input box
  } else {
    handleInput(e.key); // Handle other keys
  }
});

// Add event listener for the submit button
submitBtn.addEventListener("click", () => {
  currentGuess = wordInput.value.toLowerCase(); // Get input value
  wordInput.value = ""; // Clear input
  checkWord(); // Validate and check
});
