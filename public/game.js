// Game State
let gameState = {
    mode: null,
    difficulty: 'beginner',
    score: 0,
    round: 1,
    maxRounds: 10,
    currentCard: null,
    cardData: [],
    usedCards: [],
    hintUsed: false
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    loadCardData();
});

// Load card data from JSON files
async function loadCardData() {
    try {
        const nounResponse = await fetch('../data/noun-adjective-pairs.json');
        const verbResponse = await fetch('../data/subject-verb-pairs.json');
        
        gameState.nounAdjectiveData = await nounResponse.json();
        gameState.subjectVerbData = await verbResponse.json();
    } catch (error) {
        console.log('Using local data - file fetch not available in this environment');
        // Fallback data embedded in the file
        gameState.nounAdjectiveData = { pairs: [] };
        gameState.subjectVerbData = { pairs: [] };
    }
}

// Start Game
function startGame(mode) {
    gameState.mode = mode;
    gameState.score = 0;
    gameState.round = 1;
    gameState.usedCards = [];
    gameState.hintUsed = false;
    
    // Reset UI
    showScreen('gameScreen');
    nextCard();
}

// Set Difficulty
function setDifficulty(level) {
    gameState.difficulty = level;
    const buttons = document.querySelectorAll('.difficulty-section .btn-secondary');
    buttons.forEach(btn => {
        btn.style.background = btn.textContent.toLowerCase().includes(level) 
            ? 'var(--primary-color)' 
            : 'var(--secondary-color)';
    });
}

// Next Card
function nextCard() {
    gameState.hintUsed = false;
    
    const data = gameState.mode === 'noun-adjective' 
        ? gameState.nounAdjectiveData.pairs 
        : gameState.subjectVerbData.pairs;
    
    const filteredCards = data.filter(
        card => card.difficulty === gameState.difficulty && !gameState.usedCards.includes(card.id)
    );
    
    if (filteredCards.length === 0 || gameState.round > gameState.maxRounds) {
        endGame();
        return;
    }
    
    gameState.currentCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];
    gameState.usedCards.push(gameState.currentCard.id);
    
    displayCard();
}

// Display Card
function displayCard() {
    const card = gameState.currentCard;
    
    if (gameState.mode === 'noun-adjective') {
        document.getElementById('cardLabel').textContent = 'Choose the correct adjective';
        document.getElementById('cardWord').textContent = card.noun;
        document.getElementById('instruction').textContent = `Which adjective best describes "${card.noun}"?`;
        displayOptions(card.adjectives);
    } else {
        document.getElementById('cardLabel').textContent = 'Choose the correct verb';
        document.getElementById('cardWord').textContent = card.subject;
        document.getElementById('instruction').textContent = `Select the verb that agrees with "${card.subject}"`;
        displayOptions(card.verbs);
    }
    
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('round').textContent = gameState.round;
    document.getElementById('feedback').textContent = '';
    document.getElementById('hint').style.display = 'none';
}

// Display Options
function displayOptions(options) {
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => checkAnswer(option, button);
        optionsDiv.appendChild(button);
    });
}

// Check Answer
function checkAnswer(selected, button) {
    const card = gameState.currentCard;
    const correct = gameState.mode === 'noun-adjective' 
        ? selected === card.correctAdjective 
        : selected === card.correctVerb;
    
    const feedback = document.getElementById('feedback');
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(btn => btn.disabled = true);
    
    if (correct) {
        gameState.score++;
        button.classList.add('correct');
        feedback.textContent = '✓ Correct!';
        feedback.className = 'feedback correct';
    } else {
        button.classList.add('incorrect');
        feedback.textContent = `✗ Incorrect! The correct answer is: ${gameState.mode === 'noun-adjective' ? card.correctAdjective : card.correctVerb}`;
        feedback.className = 'feedback incorrect';
        
        // Highlight the correct answer
        optionButtons.forEach(btn => {
            if (gameState.mode === 'noun-adjective' && btn.textContent === card.correctAdjective) {
                btn.classList.add('correct');
            } else if (gameState.mode === 'subject-verb' && btn.textContent === card.correctVerb) {
                btn.classList.add('correct');
            }
        });
    }
    
    // Move to next card after delay
    setTimeout(() => {
        gameState.round++;
        nextCard();
    }, 2000);
}

// Show Hint
function showHint() {
    if (!gameState.hintUsed) {
        document.getElementById('hint').textContent = gameState.currentCard.hint;
        document.getElementById('hint').style.display = 'block';
        gameState.hintUsed = true;
    }
}

// End Game
function endGame() {
    const performance = document.getElementById('performance');
    const percentage = (gameState.score / gameState.maxRounds) * 100;
    
    document.getElementById('finalScore').textContent = gameState.score;
    
    if (percentage >= 80) {
        performance.textContent = '🌟 Excellent work!';
    } else if (percentage >= 60) {
        performance.textContent = '👍 Good job! Keep practicing.';
    } else if (percentage >= 40) {
        performance.textContent = '💪 Not bad! Try again.';
    } else {
        performance.textContent = '📚 Keep learning!';
    }
    
    showScreen('resultsScreen');
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function returnToMenu() {
    showScreen('menuScreen');
}

function playAgain() {
    startGame(gameState.mode);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (gameState.round <= gameState.maxRounds) {
        const buttons = document.querySelectorAll('.option-btn:not([disabled])');
        const key = parseInt(e.key);
        
        if (key > 0 && key <= buttons.length) {
            buttons[key - 1].click();
        }
    }
});
