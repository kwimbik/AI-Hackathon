const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Game state management
const gameRooms = new Map();

class GameRoom {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = new Map();
        this.gameState = {
            isActive: false,
            timeRemaining: 60,
            scores: { player: 0, ai: 0 },
            mode: null,
            playerCharacter: null,
            aiCharacter: null,
            weirdUncleAppeared: false
        };
        this.gameInterval = null;
        this.aiInterval = null;
        this.dogInterval = null;
    }

    addPlayer(socketId, playerData) {
        this.players.set(socketId, playerData);
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
    }

    startGame(mode, playerCharacter) {
        this.gameState = {
            isActive: true,
            timeRemaining: 60,
            scores: { player: 0, ai: 0 },
            mode: mode,
            playerCharacter: playerCharacter,
            aiCharacter: playerCharacter === 'mom' ? 'dad' : 'mom',
            weirdUncleAppeared: false
        };

        // Start game timer
        this.gameInterval = setInterval(() => {
            this.gameState.timeRemaining--;
            
            if (this.gameState.timeRemaining <= 0) {
                this.endGame();
            } else {
                this.broadcastGameState();
            }
        }, 1000);

        // Start AI actions
        this.startAIActions();
        
        // Start dog barking
        this.startDogBarking();
        
        // Schedule weird uncle
        this.scheduleWeirdUncle();
        
        this.broadcastGameState();
    }

    startAIActions() {
        const aiResponses = {
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
        };

        this.aiInterval = setInterval(() => {
            if (!this.gameState.isActive) return;

            const responses = aiResponses[this.gameState.aiCharacter];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // AI gets points randomly
            if (Math.random() > 0.3) {
                this.gameState.scores.ai += Math.floor(Math.random() * 3) + 1;
            }

            this.broadcast('ai-speak', {
                character: this.gameState.aiCharacter,
                text: randomResponse,
                scores: this.gameState.scores
            });
        }, 3000 + Math.random() * 2000);
    }

    startDogBarking() {
        this.dogInterval = setInterval(() => {
            if (!this.gameState.isActive) return;
            
            if (Math.random() > 0.7) {
                this.broadcast('dog-bark', {
                    text: 'ワンワン！'
                });
            }
        }, 5000);
    }

    scheduleWeirdUncle() {
        const appearTime = (30 + Math.random() * 20) * 1000;
        
        setTimeout(() => {
            if (!this.gameState.isActive) return;
            
            this.gameState.weirdUncleAppeared = true;
            this.broadcast('weird-uncle-appear', {
                text: 'おじさんだよ〜！'
            });
        }, appearTime);
    }

    processPlayerInput(text) {
        if (!this.gameState.isActive) return;

        // Calculate score based on input
        let score = this.calculateScore(text, this.gameState.playerCharacter);
        this.gameState.scores.player += score;

        this.broadcast('player-speak', {
            character: this.gameState.playerCharacter,
            text: text,
            score: score,
            scores: this.gameState.scores
        });
    }

    calculateScore(text, speaker) {
        let score = 0;
        const lowerText = text.toLowerCase();
        
        // Check for character name
        if ((speaker === 'mom' && text.includes('ママ')) ||
            (speaker === 'dad' && text.includes('パパ'))) {
            score += 2;
        }
        
        // Check for positive words
        const positiveWords = ['好き', '大好き', '愛', 'だっこ', '遊ぶ', '楽しい'];
        positiveWords.forEach(word => {
            if (text.includes(word)) score += 1;
        });
        
        return score;
    }

    endGame() {
        this.gameState.isActive = false;
        
        // Clear intervals
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.aiInterval) clearInterval(this.aiInterval);
        if (this.dogInterval) clearInterval(this.dogInterval);

        // Determine winner
        let winner;
        let babyFirstWord;
        
        if (this.gameState.scores.player > this.gameState.scores.ai) {
            winner = 'player';
            babyFirstWord = this.gameState.playerCharacter === 'mom' ? 'ママ' : 'パパ';
        } else if (this.gameState.scores.ai > this.gameState.scores.player) {
            winner = 'ai';
            babyFirstWord = this.gameState.aiCharacter === 'mom' ? 'ママ' : 'パパ';
        } else {
            winner = 'tie';
            const tieWords = ['ワンワン', 'おじさん', 'まんま'];
            babyFirstWord = tieWords[Math.floor(Math.random() * tieWords.length)];
        }

        this.broadcast('game-end', {
            winner: winner,
            babyFirstWord: babyFirstWord,
            finalScores: this.gameState.scores
        });
    }

    broadcast(event, data) {
        this.players.forEach((playerData, socketId) => {
            io.to(socketId).emit(event, data);
        });
    }

    broadcastGameState() {
        this.broadcast('game-state-update', this.gameState);
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('join-game', (data) => {
        let roomId = 'main-room'; // For simplicity, using one room
        
        if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, new GameRoom(roomId));
        }
        
        const room = gameRooms.get(roomId);
        room.addPlayer(socket.id, data);
        
        socket.join(roomId);
        socket.emit('joined-game', { roomId: roomId });
    });

    socket.on('start-game', (data) => {
        const roomId = 'main-room';
        const room = gameRooms.get(roomId);
        
        if (room) {
            room.startGame(data.mode, data.playerCharacter);
        }
    });

    socket.on('player-input', (data) => {
        const roomId = 'main-room';
        const room = gameRooms.get(roomId);
        
        if (room) {
            room.processPlayerInput(data.text);
        }
    });

    socket.on('get-easy-options', (data) => {
        const easyOptions = {
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
        };

        const options = easyOptions[data.character];
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        
        socket.emit('easy-options', {
            options: shuffled.slice(0, 3)
        });
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        // Remove player from all rooms
        gameRooms.forEach((room, roomId) => {
            room.removePlayer(socket.id);
            
            // Clean up empty rooms
            if (room.players.size === 0) {
                if (room.gameInterval) clearInterval(room.gameInterval);
                if (room.aiInterval) clearInterval(room.aiInterval);
                if (room.dogInterval) clearInterval(room.dogInterval);
                gameRooms.delete(roomId);
            }
        });
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
    console.log(`🎮 ママとパパどっちが好きなの？ server running on http://localhost:${PORT}`);
    console.log(`📝 Open your browser and navigate to: http://localhost:${PORT}`);
});