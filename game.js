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
    dog_sound: new Audio('sounds/dog_sound.mp3'),
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
    scheduleDogBark();
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

function scheduleDogBark() {
    // Dog barks once when 14 seconds remaining (6 seconds after game starts for 20-second game)
    setTimeout(() => {
        if (!gameState.gameActive || gameState.timeRemaining !== 14) return;
        
        const dog = document.getElementById('dog');
        
        // Change dog sprite to speaking version
        const dogSprite = dog.querySelector('.character-sprite');
        const originalSrc = dogSprite.getAttribute('data-normal');
        const speakingSrc = dogSprite.getAttribute('data-speaking');
        
        dogSprite.src = speakingSrc;
        
        showSpeechBubble(dog, 'ワンワン！');
        sounds.dog_sound.play();
        
        // Revert to normal sprite after barking
        setTimeout(() => {
            dogSprite.src = originalSrc;
        }, 1500);
        
        // Small chance baby responds to dog
        if (Math.random() > 0.8) {
            const baby = document.getElementById('baby');
            showSpeechBubble(baby, 'ワンワン！');
            babyReact('happy');
        }
    }, 6000); // 6 seconds after game starts (when 14 seconds remain in a 20-second game)
}

function scheduleWeirdUncle() {
    // Appear between 30-50 seconds
    const appearTime = 14;
    
    setTimeout(() => {
        if (!gameState.gameActive) return;
        
        const weirdUncle = document.getElementById('weird-uncle');
        weirdUncle.style.display = 'block';
        
        setTimeout(() => {
            sounds.ojisan.play(); // 変なおじさんが話すときにojisan.m4aサウンドを再生
            showSpeechBubble(weirdUncle, 'おじさんだよ〜！');
        }, 500);
    }, appearTime * 1000);
}

function endGame() {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    
    // Determine winner and baby's first word
    let resultTitle, resultMessage, babyFirstWord, soundToPlay;
    
    if (gameState.mode === 'hard') {
        // Hard mode: Need 20+ points to win, otherwise random silly word
        if (gameState.playerScore >= 20 && gameState.playerScore > gameState.aiScore) {
            resultTitle = '勝利！🎉';
            babyFirstWord = gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ';
            resultMessage = `赤ちゃんの初めての言葉は「${babyFirstWord}」でした！`;
            
            // Select sound to play
            if (gameState.playerCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                soundToPlay = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                soundToPlay = papaSounds[Math.floor(Math.random() * papaSounds.length)];
            }
        } else if (gameState.aiScore >= 20 && gameState.aiScore > gameState.playerScore) {
            resultTitle = '敗北...😢';
            babyFirstWord = gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ';
            resultMessage = `赤ちゃんの初めての言葉は「${babyFirstWord}」でした...`;
            
            // Select sound to play
            if (gameState.aiCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                soundToPlay = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                soundToPlay = papaSounds[Math.floor(Math.random() * papaSounds.length)];
            }
        } else {
            // Neither has 20+ points or it's a tie - random silly word
            const sillWords = ['ワンワン', 'バカ'];
            babyFirstWord = sillWords[Math.floor(Math.random() * sillWords.length)];
            resultTitle = '予想外！😮';
            resultMessage = `なんと赤ちゃんの初めての言葉は「${babyFirstWord}」でした！`;
            
            // Select sound to play
            if (babyFirstWord === 'ワンワン') {
                soundToPlay = sounds.dog_sound;
            } else if (babyFirstWord === 'バカ') {
                soundToPlay = sounds.baka;
            }
        }
    } else {
        // Easy mode: Use original logic
        if (gameState.playerScore > gameState.aiScore) {
            resultTitle = '勝利！🎉';
            babyFirstWord = gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ';
            resultMessage = `赤ちゃんの初めての言葉は「${babyFirstWord}」でした！`;
            
            // Select sound to play
            if (gameState.playerCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                soundToPlay = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                soundToPlay = papaSounds[Math.floor(Math.random() * papaSounds.length)];
            }
        } else if (gameState.aiScore > gameState.playerScore) {
            resultTitle = '敗北...😢';
            babyFirstWord = gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ';
            resultMessage = `赤ちゃんの初めての言葉は「${babyFirstWord}」でした...`;
            
            // Select sound to play
            if (gameState.aiCharacter === 'mom') {
                const mamaSounds = [sounds.mama, sounds.mamimamimama];
                soundToPlay = mamaSounds[Math.floor(Math.random() * mamaSounds.length)];
            } else {
                const papaSounds = [sounds.papa, sounds.papaiya];
                soundToPlay = papaSounds[Math.floor(Math.random() * papaSounds.length)];
            }
        } else {
            // Tie - random outcome
            const outcomes = ['ワンワン', 'バカ'];
            babyFirstWord = outcomes[Math.floor(Math.random() * outcomes.length)];
            resultTitle = '引き分け！😮';
            resultMessage = `なんと赤ちゃんの初めての言葉は「${babyFirstWord}」でした！`;
            
            // Select sound to play
            if (babyFirstWord === 'ワンワン') {
                soundToPlay = sounds.dog_sound;
            } else if (babyFirstWord === 'バカ') {
                soundToPlay = sounds.baka;
            }
        }
    }
    
    // Immediately go to results screen
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
    
    // Set up result screen content
    document.getElementById('result-title').textContent = resultTitle;
    document.getElementById('result-message').textContent = resultMessage;
    document.getElementById('final-player-label').textContent = playerLabel.textContent;
    document.getElementById('final-ai-label').textContent = aiLabel.textContent;
    document.getElementById('final-player-score').textContent = gameState.playerScore;
    document.getElementById('final-ai-score').textContent = gameState.aiScore;
    
    // Show baby's first word after a short delay
    setTimeout(() => {
        document.getElementById('baby-first-word').textContent = babyFirstWord + '！';
        if (soundToPlay) {
            soundToPlay.play();
        }
    }, 1000);
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
    
    // Reset result screen baby first word
    document.getElementById('baby-first-word').textContent = '';
    
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