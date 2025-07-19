// Game State
const gameState = {
    mode: null,
    playerCharacter: null,
    aiCharacter: null,
    playerScore: 0,
    aiScore: 0,
    timeRemaining: 20,
    timerInterval: null,
    gameActive: false,
    currentOptions: [],
    aiResponses: {
        mom: [
            "ママよ〜！ママって言って〜！",
            "ママのことが大好きでしょ？",
            "ママはいつもそばにいるよ〜",
            "ママって呼んでくれたら抱っこしてあげる！",
            "ママの声が聞こえる？ママよ〜"
        ],
        dad: [
            "パパだよ〜！パパって言ってごらん！",
            "パパと遊ぼう！楽しいよ〜",
            "パパがいちばん好きでしょ？",
            "パパって言えたらたかいたかいしてあげる！",
            "パパの声わかるかな？パパだよ〜"
        ]
    },
    easyModeOptions: {
        mom: [
            "ママ大好き！ママって言って！",
            "ママのおっぱい美味しいでしょ？",
            "ママと一緒にねんねしようね",
            "ママのお歌聞きたい？",
            "ママのぬくもりが一番でしょ？"
        ],
        dad: [
            "パパと遊ぼう！楽しいよ！",
            "パパの肩車は高いぞ〜",
            "パパとお風呂入ろうね",
            "パパのひげ、ちくちくする？",
            "パパの大きな手、つかまえて！"
        ]
    }
};

// Sound Effects
const sounds = {
    crying: new Audio('sounds/crying.mp3'),
    laughing: new Audio('sounds/laughing.mp3'),
    mama: new Audio('sounds/mama.m4a'),
    mamimamimama: new Audio('sounds/mamimamimama.m4a'),
    papa: new Audio('sounds/papa.m4a'),
    papaiya: new Audio('sounds/papaiya.m4a'),
    wanwan: new Audio('sounds/wanwan.m4a'),
    baka: new Audio('sounds/baka.m4a'),
    ojisan: new Audio('sounds/ojisan.m4a')
};

// Set volume to maximum for all sounds
Object.values(sounds).forEach(sound => {
    sound.volume = 1.0;
});

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const modeSelection = document.querySelector('.mode-selection');
const characterSelection = document.querySelector('.character-selection');
const timerDisplay = document.getElementById('timer');
const playerScoreDisplay = document.getElementById('player-score');
const aiScoreDisplay = document.getElementById('ai-score');
const playerLabel = document.getElementById('player-label');
const aiLabel = document.getElementById('ai-label');
const easyModeOptions = document.getElementById('easy-mode-options');
const hardModeInput = document.getElementById('hard-mode-input');
const playerInput = document.getElementById('player-input');
const submitBtn = document.getElementById('submit-btn');

// Initialize Event Listeners
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', selectMode);
});

document.querySelectorAll('.character-btn').forEach(btn => {
    btn.addEventListener('click', selectCharacter);
});

document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', selectEasyOption);
});

submitBtn.addEventListener('click', submitHardMode);
playerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitHardMode();
    }
});

document.getElementById('play-again-btn').addEventListener('click', resetGame);

// Game Functions
function selectMode(e) {
    gameState.mode = e.target.dataset.mode;
    modeSelection.style.display = 'none';
    characterSelection.style.display = 'block';
}

function selectCharacter(e) {
    gameState.playerCharacter = e.target.dataset.character;
    gameState.aiCharacter = gameState.playerCharacter === 'mom' ? 'dad' : 'mom';
    
    // Update labels
    playerLabel.textContent = gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ';
    aiLabel.textContent = gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ';
    
    startGame();
}

function startGame() {
    titleScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // Reset scores
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.timeRemaining = 20;
    
    // Hide scoreboard during gameplay
    document.getElementById('score-display').style.display = 'none';
    
    // Show appropriate input area
    if (gameState.mode === 'easy') {
        easyModeOptions.style.display = 'block';
        hardModeInput.style.display = 'none';
        generateEasyOptions();
    } else {
        easyModeOptions.style.display = 'none';
        hardModeInput.style.display = 'block';
    }
    
    // Start timer
    gameState.gameActive = true;
    startTimer();
    
    // Start AI actions
    startAIActions();
    
    // Schedule weird uncle appearance
    scheduleWeirdUncle();
    
    // Start dog barking
    startDogBarking();
}

function startTimer() {
    timerDisplay.textContent = gameState.timeRemaining;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        timerDisplay.textContent = gameState.timeRemaining;
        
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function updateScoreDisplay() {
    playerScoreDisplay.textContent = gameState.playerScore;
    aiScoreDisplay.textContent = gameState.aiScore;
}

function generateEasyOptions() {
    const options = gameState.easyModeOptions[gameState.playerCharacter];
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    gameState.currentOptions = shuffled.slice(0, 3);
    
    // Assign scoring values to each option (+1, 0, -1)
    const scores = [1, 0, -1].sort(() => Math.random() - 0.5);
    
    document.querySelectorAll('.option-btn').forEach((btn, index) => {
        btn.textContent = gameState.currentOptions[index];
        btn.dataset.score = scores[index];
    });
}

function selectEasyOption(e) {
    if (!gameState.gameActive) return;
    
    const selectedText = e.target.textContent;
    const scoreValue = parseInt(e.target.dataset.score);
    playerSpeak(selectedText, scoreValue);
    
    // Generate new options after a short delay
    setTimeout(generateEasyOptions, 1000);
}

function submitHardMode() {
    if (!gameState.gameActive) return;
    
    const text = playerInput.value.trim();
    if (text) {
        // Calculate score for hard mode
        let scoreValue = 0;
        
        // 50% chance to get +1 point
        if (Math.random() > 0.5) {
            scoreValue = 1;
        }
        
        // Additional +1 if message is emotional or funny
        const emotionalWords = ['好き', '大好き', '愛', 'かわいい', '素敵', '最高', '幸せ', '嬉しい', '楽しい', 'おもしろい', 'うれしい'];
        const funnyWords = ['あはは', 'わはは', 'くすくす', 'ぷっ', 'きゃー', 'わーい', 'やったー', 'すごい', 'びっくり'];
        
        const isEmotional = emotionalWords.some(word => text.includes(word));
        const isFunny = funnyWords.some(word => text.includes(word)) || text.includes('笑') || text.includes('！') || text.includes('!') || text.length > 20;
        
        if (isEmotional || isFunny) {
            scoreValue = 1;
        }
        
        playerSpeak(text, scoreValue);
        playerInput.value = '';
    }
}

function playerSpeak(text, scoreValue = null) {
    const playerCharacter = document.getElementById(gameState.playerCharacter);
    showSpeechBubble(playerCharacter, text);
    
    // Use provided score value or calculate based on old logic
    let pointsToAdd = 0;
    if (scoreValue !== null) {
        pointsToAdd = scoreValue;
    } else {
        pointsToAdd = calculateBabyReaction(text, gameState.playerCharacter);
    }
    
    if (pointsToAdd > 0) {
        gameState.playerScore += pointsToAdd;
        babyReact('happy');
        sounds.laughing.play();
    } else if (pointsToAdd < 0) {
        gameState.playerScore += pointsToAdd; // This will subtract since pointsToAdd is negative
        babyReact('cry');
    } else {
        babyReact('neutral');
    }
}

function aiSpeak() {
    if (!gameState.gameActive) return;
    
    const aiCharacter = document.getElementById(gameState.aiCharacter);
    const responses = gameState.aiResponses[gameState.aiCharacter];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    showSpeechBubble(aiCharacter, randomResponse);
    
    // AI scores points randomly
    if (Math.random() > 0.3) {
        gameState.aiScore += Math.floor(Math.random() * 3) + 1;
        babyReact('happy');
        sounds.laughing.play();
    }
    
    updateScoreDisplay();
}

function showSpeechBubble(character, text) {
    const bubble = character.querySelector('.speech-bubble');
    const bubbleText = bubble.querySelector('.bubble-text');
    const sprite = character.querySelector('.character-sprite');
    
    bubbleText.textContent = text;
    bubble.style.display = 'block';
    character.classList.add('reacting');
    
    // Change sprite to speaking state if it has speaking animation
    if (sprite && sprite.dataset.speaking) {
        sprite.src = sprite.dataset.speaking;
    }
    
    setTimeout(() => {
        bubble.style.display = 'none';
        character.classList.remove('reacting');
        
        // Return sprite to normal state
        if (sprite && sprite.dataset.normal) {
            sprite.src = sprite.dataset.normal;
        }
    }, 3000);
}

function babyReact(mood) {
    const baby = document.getElementById('baby');
    const babySprite = baby.querySelector('.character-sprite');
    
    if (mood === 'happy' && babySprite.dataset.happy) {
        babySprite.src = babySprite.dataset.happy;
        setTimeout(() => {
            babySprite.src = babySprite.dataset.normal;
        }, 2000);
    } else if (mood === 'cry' && babySprite.dataset.crying) {
        babySprite.src = babySprite.dataset.crying;
        sounds.crying.play();
        setTimeout(() => {
            babySprite.src = babySprite.dataset.normal;
        }, 2000);
    }
}

function calculateBabyReaction(text, speaker) {
    // Simple scoring based on keywords
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Check for character name
    if ((speaker === 'mom' && lowerText.includes('ママ')) ||
        (speaker === 'dad' && lowerText.includes('パパ'))) {
        score += 2;
    }
    
    // Check for positive words
    const positiveWords = ['好き', '大好き', '愛', 'だっこ', '遊ぶ', '楽しい'];
    positiveWords.forEach(word => {
        if (text.includes(word)) score += 1;
    });
    
    return score;
}

function startAIActions() {
    // AI speaks every 3-5 seconds
    const aiInterval = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(aiInterval);
            return;
        }
        aiSpeak();
    }, 3000 + Math.random() * 2000);
}

function startDogBarking() {
    const dog = document.getElementById('dog');
    
    const barkInterval = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(barkInterval);
            return;
        }
        
        if (Math.random() > 0.7) {
            showSpeechBubble(dog, 'ワンワン！');
            
            // Small chance baby responds to dog
            if (Math.random() > 0.8) {
                const baby = document.getElementById('baby');
                showSpeechBubble(baby, 'ワンワン！');
                babyReact('happy');
            }
        }
    }, 5000);
}

function scheduleWeirdUncle() {
    // Appear between 30-50 seconds
    const appearTime = 8;
    
    setTimeout(() => {
        if (!gameState.gameActive) return;
        
        const weirdUncle = document.getElementById('weird-uncle');
        weirdUncle.style.display = 'block';
        
        setTimeout(() => {
            showSpeechBubble(weirdUncle, 'おじさんだよ〜！');
            sounds.ojisan.play(); // 変なおじさんが話すときにojisan.m4aサウンドを再生
            
            // Small chance baby says おじさん
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    const baby = document.getElementById('baby');
                    showSpeechBubble(baby, 'おじさん！');
                    babyReact('happy');
                }, 1500);
            }
        }, 500);
    }, appearTime * 1000);
}

function endGame() {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    
    // Determine winner based on mode
    let resultTitle, resultMessage;
    const baby = document.getElementById('baby');
    
    if (gameState.mode === 'hard') {
        // Hard mode: Need 20+ points to win, otherwise random silly word
        if (gameState.playerScore >= 20 && gameState.playerScore > gameState.aiScore) {
            resultTitle = '勝利！🎉';
            resultMessage = `赤ちゃんの初めての言葉は「${gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ'}」でした！`;
            showSpeechBubble(baby, gameState.playerCharacter === 'mom' ? 'ママ！' : 'パパ！');
            
            // Play mama or papa sound randomly
            if (gameState.playerCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                const randomMamaSound = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
                randomMamaSound.play();
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                const randomPapaSound = papaSounds[Math.floor(Math.random() * papaSounds.length)];
                randomPapaSound.play();
            }
        } else if (gameState.aiScore >= 20 && gameState.aiScore > gameState.playerScore) {
            resultTitle = '敗北...😢';
            resultMessage = `赤ちゃんの初めての言葉は「${gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ'}」でした...`;
            showSpeechBubble(baby, gameState.aiCharacter === 'mom' ? 'ママ！' : 'パパ！');
            
            // Play mama or papa sound randomly
            if (gameState.aiCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                const randomMamaSound = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
                randomMamaSound.play();
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                const randomPapaSound = papaSounds[Math.floor(Math.random() * papaSounds.length)];
                randomPapaSound.play();
            }
        } else {
            // Neither has 20+ points or it's a tie - random silly word
            const sillWords = ['ワンワン', 'バカ'];
            const randomWord = sillWords[Math.floor(Math.random() * sillWords.length)];
            resultTitle = '予想外！😮';
            resultMessage = `なんと赤ちゃんの初めての言葉は「${randomWord}」でした！`;
            showSpeechBubble(baby, randomWord + '！');
            
            // Play appropriate sound
            if (randomWord === 'ワンワン') {
                sounds.wanwan.play();
            } else if (randomWord === 'バカ') {
                sounds.baka.play();
            }
        }
    } else {
        // Easy mode: Use original logic
        if (gameState.playerScore > gameState.aiScore) {
            resultTitle = '勝利！🎉';
            resultMessage = `赤ちゃんの初めての言葉は「${gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ'}」でした！`;
            showSpeechBubble(baby, gameState.playerCharacter === 'mom' ? 'ママ！' : 'パパ！');
            
            // Play mama or papa sound randomly
            if (gameState.playerCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                const randomMamaSound = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
                randomMamaSound.play();
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                const randomPapaSound = papaSounds[Math.floor(Math.random() * papaSounds.length)];
                randomPapaSound.play();
            }
        } else if (gameState.aiScore > gameState.playerScore) {
            resultTitle = '敗北...😢';
            resultMessage = `赤ちゃんの初めての言葉は「${gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ'}」でした...`;
            showSpeechBubble(baby, gameState.aiCharacter === 'mom' ? 'ママ！' : 'パパ！');
            
            // Play mama or papa sound randomly
            if (gameState.aiCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                const randomMamaSound = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
                randomMamaSound.play();
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                const randomPapaSound = papaSounds[Math.floor(Math.random() * papaSounds.length)];
                randomPapaSound.play();
            }
        } else {
            // Tie - random outcome
            const outcomes = ['ワンワン', 'バカ'];
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            resultTitle = '引き分け！😮';
            resultMessage = `なんと赤ちゃんの初めての言葉は「${randomOutcome}」でした！`;
            showSpeechBubble(baby, randomOutcome + '！');
            
            // Play appropriate sound
            if (randomOutcome === 'ワンワン') {
                sounds.wanwan.play();
            } else if (randomOutcome === 'バカ') {
                sounds.baka.play();
            }
        }
    }
    
    // Wait a moment before showing results
    setTimeout(() => {
        gameScreen.classList.remove('active');
        resultScreen.classList.add('active');
        
        document.getElementById('result-title').textContent = resultTitle;
        document.getElementById('result-message').textContent = resultMessage;
        document.getElementById('final-player-label').textContent = playerLabel.textContent;
        document.getElementById('final-ai-label').textContent = aiLabel.textContent;
        document.getElementById('final-player-score').textContent = gameState.playerScore;
        document.getElementById('final-ai-score').textContent = gameState.aiScore;
    }, 3000);
}

function resetGame() {
    // Reset game state
    gameState.mode = null;
    gameState.playerCharacter = null;
    gameState.aiCharacter = null;
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.timeRemaining = 20;
    gameState.gameActive = false;
    
    // Hide weird uncle
    document.getElementById('weird-uncle').style.display = 'none';
    
    // Show scoreboard again for next game
    document.getElementById('score-display').style.display = 'block';
    
    // Reset screens
    resultScreen.classList.remove('active');
    titleScreen.classList.add('active');
    modeSelection.style.display = 'block';
    characterSelection.style.display = 'none';
    
    // Clear any remaining speech bubbles
    document.querySelectorAll('.speech-bubble').forEach(bubble => {
        bubble.style.display = 'none';
    });
}