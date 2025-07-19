// Game Client with Socket.IO
class GameClient {
    constructor() {
        this.socket = null;
        this.gameState = {
            mode: null,
            playerCharacter: null,
            aiCharacter: null,
            currentOptions: []
        };
        this.sounds = {
            crying: document.getElementById('crying-sound'),
            laughing: document.getElementById('laughing-sound')
        };
        this.init();
    }

    init() {
        this.connectToServer();
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    connectToServer() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus('connected');
            this.socket.emit('join-game', { timestamp: Date.now() });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus('disconnected');
        });

        this.socket.on('connect_error', () => {
            console.log('Connection error');
            this.updateConnectionStatus('disconnected');
        });
    }

    updateConnectionStatus(status) {
        const indicator = document.getElementById('connection-indicator');
        indicator.className = status;
        
        switch(status) {
            case 'connected':
                indicator.textContent = 'サーバーに接続済み ✓';
                break;
            case 'disconnected':
                indicator.textContent = 'サーバーとの接続が切れました ✗';
                break;
            case 'connecting':
                indicator.textContent = 'サーバーに接続中...';
                break;
        }
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e));
        });

        // Character selection
        document.querySelectorAll('.character-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCharacter(e));
        });

        // Easy mode options
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectEasyOption(e));
        });

        // Hard mode input
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitHardMode();
        });

        document.getElementById('player-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitHardMode();
            }
        });

        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    setupSocketListeners() {
        this.socket.on('joined-game', (data) => {
            console.log('Joined game:', data.roomId);
        });

        this.socket.on('game-state-update', (gameState) => {
            this.updateGameState(gameState);
        });

        this.socket.on('player-speak', (data) => {
            this.handlePlayerSpeak(data);
        });

        this.socket.on('ai-speak', (data) => {
            this.handleAISpeak(data);
        });

        this.socket.on('dog-bark', (data) => {
            this.handleDogBark(data);
        });

        this.socket.on('weird-uncle-appear', (data) => {
            this.handleWeirdUncleAppear(data);
        });

        this.socket.on('game-end', (data) => {
            this.handleGameEnd(data);
        });

        this.socket.on('easy-options', (data) => {
            this.updateEasyOptions(data.options);
        });
    }

    selectMode(e) {
        this.gameState.mode = e.target.dataset.mode;
        document.querySelector('.mode-selection').style.display = 'none';
        document.querySelector('.character-selection').style.display = 'block';
    }

    selectCharacter(e) {
        this.gameState.playerCharacter = e.target.dataset.character;
        this.gameState.aiCharacter = this.gameState.playerCharacter === 'mom' ? 'dad' : 'mom';
        
        // Update labels
        document.getElementById('player-label').textContent = 
            this.gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ';
        document.getElementById('ai-label').textContent = 
            this.gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ';
        
        this.startGame();
    }

    startGame() {
        // Hide title screen and show game screen
        document.getElementById('title-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // Show appropriate input area
        if (this.gameState.mode === 'easy') {
            document.getElementById('easy-mode-options').style.display = 'block';
            document.getElementById('hard-mode-input').style.display = 'none';
            this.requestEasyOptions();
        } else {
            document.getElementById('easy-mode-options').style.display = 'none';
            document.getElementById('hard-mode-input').style.display = 'block';
        }
        
        // Start game on server
        this.socket.emit('start-game', {
            mode: this.gameState.mode,
            playerCharacter: this.gameState.playerCharacter
        });
    }

    requestEasyOptions() {
        this.socket.emit('get-easy-options', {
            character: this.gameState.playerCharacter
        });
    }

    updateEasyOptions(options) {
        this.gameState.currentOptions = options;
        document.querySelectorAll('.option-btn').forEach((btn, index) => {
            btn.textContent = options[index] || '';
            btn.style.display = options[index] ? 'block' : 'none';
        });
    }

    selectEasyOption(e) {
        const optionIndex = parseInt(e.target.dataset.option);
        const selectedText = this.gameState.currentOptions[optionIndex];
        
        if (selectedText) {
            this.socket.emit('player-input', { text: selectedText });
            
            // Request new options after a delay
            setTimeout(() => {
                this.requestEasyOptions();
            }, 1000);
        }
    }

    submitHardMode() {
        const input = document.getElementById('player-input');
        const text = input.value.trim();
        
        if (text) {
            this.socket.emit('player-input', { text: text });
            input.value = '';
        }
    }

    updateGameState(gameState) {
        // Update timer
        document.getElementById('timer').textContent = gameState.timeRemaining;
        
        // Update scores
        document.getElementById('player-score').textContent = gameState.scores.player;
        document.getElementById('ai-score').textContent = gameState.scores.ai;
        
        // Change timer color when time is running out
        const timerDisplay = document.getElementById('timer-display');
        if (gameState.timeRemaining <= 10) {
            timerDisplay.style.color = '#ff0000';
            timerDisplay.style.animation = 'timerPulse 0.5s ease-in-out infinite';
        } else {
            timerDisplay.style.color = '#ff4444';
        }
    }

    handlePlayerSpeak(data) {
        const character = document.getElementById(data.character);
        this.showSpeechBubble(character, data.text);
        
        // Update scores
        document.getElementById('player-score').textContent = data.scores.player;
        document.getElementById('ai-score').textContent = data.scores.ai;
        
        // Baby reaction
        if (data.score > 0) {
            this.babyReact('happy');
            this.playSound('laughing');
        } else {
            this.babyReact('neutral');
        }
    }

    handleAISpeak(data) {
        const character = document.getElementById(data.character);
        this.showSpeechBubble(character, data.text);
        
        // Update scores
        document.getElementById('player-score').textContent = data.scores.player;
        document.getElementById('ai-score').textContent = data.scores.ai;
        
        // Baby reaction
        this.babyReact('happy');
        this.playSound('laughing');
    }

    handleDogBark(data) {
        const dog = document.getElementById('dog');
        this.showSpeechBubble(dog, data.text);
        
        // Sometimes baby responds to dog
        if (Math.random() > 0.8) {
            setTimeout(() => {
                const baby = document.getElementById('baby');
                this.showSpeechBubble(baby, 'ワンワン！');
                this.babyReact('happy');
            }, 1000);
        }
    }

    handleWeirdUncleAppear(data) {
        const weirdUncle = document.getElementById('weird-uncle');
        weirdUncle.style.display = 'block';
        
        setTimeout(() => {
            this.showSpeechBubble(weirdUncle, data.text);
            
            // Sometimes baby responds to weird uncle
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    const baby = document.getElementById('baby');
                    this.showSpeechBubble(baby, 'おじさん！');
                    this.babyReact('happy');
                }, 1500);
            }
        }, 500);
    }

    handleGameEnd(data) {
        setTimeout(() => {
            document.getElementById('game-screen').classList.remove('active');
            document.getElementById('result-screen').classList.add('active');
            
            // Set result message
            let resultTitle, resultMessage;
            
            if (data.winner === 'player') {
                resultTitle = '勝利！🎉';
                resultMessage = `赤ちゃんの初めての言葉は「${data.babyFirstWord}」でした！`;
            } else if (data.winner === 'ai') {
                resultTitle = '敗北...😢';
                resultMessage = `赤ちゃんの初めての言葉は「${data.babyFirstWord}」でした...`;
            } else {
                resultTitle = '引き分け！😮';
                resultMessage = `なんと赤ちゃんの初めての言葉は「${data.babyFirstWord}」でした！`;
            }
            
            document.getElementById('result-title').textContent = resultTitle;
            document.getElementById('result-message').textContent = resultMessage;
            
            // Show final scores
            document.getElementById('final-player-label').textContent = 
                document.getElementById('player-label').textContent;
            document.getElementById('final-ai-label').textContent = 
                document.getElementById('ai-label').textContent;
            document.getElementById('final-player-score').textContent = data.finalScores.player;
            document.getElementById('final-ai-score').textContent = data.finalScores.ai;
            
            // Show baby saying first word
            const baby = document.getElementById('baby');
            this.showSpeechBubble(baby, data.babyFirstWord + '！');
        }, 2000);
    }

    showSpeechBubble(character, text) {
        const bubble = character.querySelector('.speech-bubble');
        const bubbleText = bubble.querySelector('.bubble-text');
        
        bubbleText.textContent = text;
        bubble.style.display = 'block';
        character.classList.add('reacting');
        
        setTimeout(() => {
            bubble.style.display = 'none';
            character.classList.remove('reacting');
        }, 3000);
    }

    babyReact(mood) {
        const baby = document.getElementById('baby');
        const babySprite = baby.querySelector('.character-sprite');
        
        baby.classList.add('happy');
        
        if (mood === 'happy') {
            babySprite.textContent = '😊';
            setTimeout(() => {
                babySprite.textContent = '👶';
                baby.classList.remove('happy');
            }, 2000);
        } else if (mood === 'cry') {
            babySprite.textContent = '😭';
            this.playSound('crying');
            setTimeout(() => {
                babySprite.textContent = '👶';
                baby.classList.remove('happy');
            }, 2000);
        } else {
            setTimeout(() => {
                baby.classList.remove('happy');
            }, 500);
        }
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(console.error);
        }
    }

    resetGame() {
        // Reset game state
        this.gameState = {
            mode: null,
            playerCharacter: null,
            aiCharacter: null,
            currentOptions: []
        };
        
        // Hide weird uncle
        document.getElementById('weird-uncle').style.display = 'none';
        
        // Reset screens
        document.getElementById('result-screen').classList.remove('active');
        document.getElementById('title-screen').classList.add('active');
        document.querySelector('.mode-selection').style.display = 'block';
        document.querySelector('.character-selection').style.display = 'none';
        
        // Clear any remaining speech bubbles
        document.querySelectorAll('.speech-bubble').forEach(bubble => {
            bubble.style.display = 'none';
        });
        
        // Reset baby sprite
        document.querySelector('#baby .character-sprite').textContent = '👶';
        
        // Reset timer display color
        const timerDisplay = document.getElementById('timer-display');
        timerDisplay.style.color = '#ff4444';
        timerDisplay.style.animation = 'timerPulse 1s ease-in-out infinite';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameClient();
});